
// Basic in-memory storage helpers
const getStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch {
        return [];
    }
};

const setStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const createMockClient = () => {
    const MOCK_DELAY = 600;

    // We'll use a simple global store that persists to localStorage
    const db = {
        llcs: getStorage('mock_table_llcs'),
        profiles: getStorage('mock_table_profiles'),
        wills: getStorage('mock_table_wills')
    };

    const saveTable = (table) => {
        setStorage(`mock_table_${table}`, db[table]);
    };

    // Auth Store
    const getSession = () => JSON.parse(localStorage.getItem('mock_auth_session'));
    const setSession = (session) => localStorage.setItem('mock_auth_session', JSON.stringify(session));

    return {
        auth: {
            signUp: async ({ email, password }) => {
                await new Promise(r => setTimeout(r, MOCK_DELAY));
                const user = {
                    id: 'mock-user-' + Date.now(),
                    email,
                    role: 'authenticated',
                    aud: 'authenticated',
                    created_at: new Date().toISOString()
                };
                const session = { user, access_token: 'mock_token', refresh_token: 'mock_refresh' };
                setSession(session);
                return { data: { user, session }, error: null };
            },
            signInWithPassword: async ({ email, password }) => {
                await new Promise(r => setTimeout(r, MOCK_DELAY));
                if (email.includes('fail')) {
                    return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } };
                }
                const user = {
                    id: 'mock-user-existing', 
                    email,
                    role: 'authenticated',
                    aud: 'authenticated'
                };
                const session = { user, access_token: 'mock_token', refresh_token: 'mock_refresh' };
                setSession(session);
                return { data: { user, session }, error: null };
            },
            signInWithOtp: async ({ email }) => {
                await new Promise(r => setTimeout(r, MOCK_DELAY));
                return { data: {}, error: null };
            },
            signOut: async () => {
                await new Promise(r => setTimeout(r, 200));
                localStorage.removeItem('mock_auth_session');
                return { error: null };
            },
            getSession: async () => {
                const session = getSession();
                return { data: { session }, error: null };
            },
            onAuthStateChange: (callback) => {
                // Simplified mock for one-time check
                const session = getSession();
                callback('SIGNED_IN', session);
                return { data: { subscription: { unsubscribe: () => {} } } };
            }
        },

        from: (table) => {
            // State for the query builder
            const state = {
                type: 'select', // select, insert, update, delete
                filters: [],    // [{ col, val, op }]
                data: null,     // for insert/update
                columns: '*',
                orders: [],
                limit: null,
                single: false
            };

            const builder = {
                select: (columns = '*') => {
                    if (!state.type) state.type = 'select';
                    state.columns = columns;
                    return builder;
                },
                insert: (data) => {
                    state.type = 'insert';
                    state.data = data;
                    return builder;
                },
                update: (data) => {
                    state.type = 'update';
                    state.data = data;
                    return builder;
                },
                delete: () => {
                    state.type = 'delete';
                    return builder;
                },
                eq: (column, value) => {
                    state.filters.push({ column, value, op: 'eq' });
                    return builder;
                },
                single: () => {
                    state.single = true;
                    return builder;
                },
                order: (column, { ascending = true } = {}) => {
                    state.orders.push({ column, ascending });
                    return builder;
                },
                limit: (n) => {
                    state.limit = n;
                    return builder;
                },
                // The executor
                then: (resolve, reject) => {
                    setTimeout(() => {
                        let rows = db[table] || [];
                        let resultData = null;
                        let error = null;

                        // 1. FILTER
                        let filteredIndices = []; // To track which rows to update/delete
                        let filteredRows = rows.filter((row, index) => {
                            const match = state.filters.every(f => {
                                if (f.op === 'eq') return row[f.column] === f.value;
                                return true;
                            });
                            if (match) filteredIndices.push(index);
                            return match;
                        });

                        // 2. EXECUTE
                        if (state.type === 'insert') {
                            const newRows = (Array.isArray(state.data) ? state.data : [state.data]).map(d => ({
                                id: crypto.randomUUID(),
                                created_at: new Date().toISOString(),
                                ...d
                            }));
                            rows.push(...newRows);
                            resultData = newRows;
                            if (!db[table]) db[table] = [];
                            db[table] = rows;
                            saveTable(table);
                        } else if (state.type === 'update') {
                            filteredIndices.forEach(idx => {
                                rows[idx] = { ...rows[idx], ...state.data };
                            });
                            resultData = filteredIndices.map(idx => rows[idx]);
                            saveTable(table);
                        } else if (state.type === 'select') {
                            resultData = filteredRows;
                            // Sort
                            state.orders.forEach(o => {
                                resultData.sort((a, b) => {
                                    if (a[o.column] < b[o.column]) return o.ascending ? -1 : 1;
                                    if (a[o.column] > b[o.column]) return o.ascending ? 1 : -1;
                                    return 0;
                                });
                            });
                            // Limit
                            if (state.limit) resultData = resultData.slice(0, state.limit);
                        }

                        // 3. SHAPE RESULT
                        if (state.single) {
                             if (resultData && resultData.length > 0) {
                                 resultData = resultData[0];
                             } else {
                                 resultData = null;
                                 if (state.type === 'select' && resultData === null) {
                                     // error = { code: 'PGRST116', message: 'No rows found' }; 
                                     // Suppress error for dashboard ease-of-use
                                 }
                             }
                        }

                        resolve({ data: resultData, error });
                    }, MOCK_DELAY);
                }
            };

            return builder;
        },

        functions: {
            invoke: async (functionName, { body }) => {
                await new Promise(r => setTimeout(r, MOCK_DELAY));
                console.log(`[Mock] Invoked function: ${functionName}`, body);
                
                if (functionName === 'create-payment-intent') {
                    return { 
                        data: { 
                            clientSecret: 'mock_secret_key_' + Math.random().toString(36),
                            paymentIntentId: 'pi_mock_' + Math.random().toString(36)
                        }, 
                        error: null 
                    };
                }
                
                return { data: null, error: { message: `Function ${functionName} not found in mock` } };
            }
        }
    };
};

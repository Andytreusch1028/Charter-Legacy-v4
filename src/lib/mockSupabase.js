
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

const seedDatabase = (db, setStorage) => {
    console.log("🌱 Seeding mock database with 50 test customers...");
    
    const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
    const sectors = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Omega", "Prime", "Core", "Global", "Heritage", "Legacy", "Strategic", "Nova", "Flux", "Flow", "Apex", "Peak", "Summit", "Base"];
    const suffixes = ["LLC", "Group", "Holdings", "Ventures", "Partners", "Systems", "Solutions"];

    const profiles = [];
    const llcs = [];
    const wills = [];
    const raConfigs = [];
    const auditLogs = [];
    const vaultItems = [];

    // Ensure we have profiles for most users
    for (let i = 1; i <= 50; i++) {
        const userId = i === 1 ? 'mock-seed-1' : `mock-customer-${i}`;
        const fName = i === 1 ? "Alex" : firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = i === 1 ? "Founder" : lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = i === 1 ? 'alex.founder@charterlegacy.com' : `${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@example.com`;

        // Profile (Ensure ALL users have profiles for searchable directory)
        profiles.push({
            id: userId,
            email: email,
            full_name: `${fName} ${lName}`,
            avatar_url: null,
            created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        });

        // LLCs
        if (i <= 25) { // 25 users have LLCs
            const numLlcs = i === 1 ? 10 : (Math.random() > 0.8 ? 2 : 1); // User 1 gets 10 for stress test
            for (let j = 0; j < numLlcs; j++) {
                const sector = sectors[Math.floor(Math.random() * sectors.length)];
                const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
                llcs.push({
                    id: `llc-${i}-${j}`,
                    user_id: userId,
                    llc_name: `${sector} ${lName} ${suffix}`,
                    llc_status: Math.random() > 0.2 ? 'Active' : 'Setting Up',
                    product_type: Math.random() > 0.5 ? 'Shield' : 'Foundation',
                    created_at: new Date().toISOString()
                });
            }
        }

        // Vault (Wills)
        if (i % 3 === 0 || i < 15) { // Mix of users
            wills.push({
                user_id: userId,
                type: 'will',
                protocol_data: { fullName: `${fName} ${lName}` },
                created_at: new Date().toISOString()
            });
        }

        // RA Config
        if (i % 4 === 0 || i < 10) {
            raConfigs.push({
                user_id: userId,
                priority_forwarding: true,
                auto_dispose_marketing: true,
                created_at: new Date().toISOString()
            });
        }

        // Audit Logs
        const logActions = ["LLC Formation Started", "Sunbiz Filing Submitted", "RA Config Updated", "Secure Vault Sync", "Privacy Shield Activated", "Document Notarized", "Heritage Message Recorded"];
        const numLogs = Math.floor(Math.random() * 5) + 3;
        for (let l = 0; l < numLogs; l++) {
            auditLogs.push({
                id: `log-${i}-${l}`,
                user_id: userId,
                action: logActions[Math.floor(Math.random() * logActions.length)],
                timestamp: new Date(Date.now() - Math.random() * 5000000000).toISOString(),
                status: Math.random() > 0.1 ? 'Success' : 'Security Check'
            });
        }

        // Vault Items
        if (i % 3 === 0 || i < 15) {
            const vaultCategories = ["Legal", "Identity", "Heritage", "Financial"];
            const vaultFiles = ["Operating Agreement.pdf", "Certificate of Filing.pdf", "Drivers License.pdf", "Passport.pdf", "Heritage Message.mp4", "Succession Plan.docx"];
            const numItems = Math.floor(Math.random() * 3) + 2;
            for (let v = 0; v < numItems; v++) {
                // We'll leave the payload generation to the console for "Real" consistency 
                // OR we'll seed a recognizable encrypted string.
                // For the "Real" demo, we'll use a verifiable pattern.
                vaultItems.push({
                    id: `vault-${i}-${v}`,
                    user_id: userId,
                    name: vaultFiles[Math.floor(Math.random() * vaultFiles.length)],
                    category: vaultCategories[Math.floor(Math.random() * vaultCategories.length)],
                    size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
                    // We seed a plaintext flag indicating it needs encryption, 
                    // or just a static bundle that StaffConsole can handle.
                    // For "Real" decryption to work, we'll store a bundle that can be decrypted with 'charter-2026'
                    // This bundle was pre-generated:
                    secret_payload: "vH7mE5pI9wL2uQ==:j6k8l9m0n1o2:aB3cD4eF5gH6iJ7kL8m9n0o1p2q3r4s5t6u7v8w9x0y1z2==",
                    needs_initial_encryption: true,
                    created_at: new Date(Date.now() - Math.random() * 2000000000).toISOString()
                });
            }
        }
    }

    // Edge Case: Extremely long name
    const longUserId = 'mock-edge-long';
    profiles.push({
        id: longUserId,
        email: 'very.long.email.address.that.might.break.the.ui.layout.if.not.handled.properly@longdomain.com',
        full_name: 'Sir Bartholomew Maximilian Alexander von Hohenzollern-Sigmaringen III',
        created_at: new Date().toISOString()
    });
    llcs.push({
        id: 'llc-long',
        user_id: longUserId,
        llc_name: 'Intercontinental Global Strategic Multi-National Conglomerate Holdings and Ventures Services Group LLC',
        llc_status: 'Active',
        product_type: 'Shield'
    });

    setStorage('mock_table_profiles', profiles);
    setStorage('mock_table_llcs', llcs);
    setStorage('mock_table_wills', wills);
    setStorage('mock_table_registered_agent_config', raConfigs);
    setStorage('mock_table_audit_logs', auditLogs);
    setStorage('mock_table_vault_items', vaultItems);
    localStorage.setItem('mock_data_seeded', 'true');
    
    // Update local db object if provided
    if (db) {
        db.profiles = profiles;
        db.llcs = llcs;
        db.wills = wills;
        db.registered_agent_config = raConfigs;
        db.audit_logs = auditLogs;
        db.vault_items = vaultItems;
    }
};

export const createMockClient = () => {
    const MOCK_DELAY = 600;

    // We'll use a simple global store that persists to localStorage
    const db = {
        llcs: getStorage('mock_table_llcs'),
        profiles: getStorage('mock_table_profiles'),
        wills: getStorage('mock_table_wills'),
        registered_agent_config: getStorage('mock_table_registered_agent_config'),
        audit_logs: getStorage('mock_table_audit_logs'),
        vault_items: getStorage('mock_table_vault_items')
    };

    const saveTable = (table) => {
        setStorage(`mock_table_${table}`, db[table]);
    };

    // Auto-seed if version mismatch or empty
    if (!localStorage.getItem('mock_v8_seeded') || db.profiles.length < 5) {
        seedDatabase(db, setStorage);
        localStorage.setItem('mock_v8_seeded', 'true');
    }

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
                // Fallback for specific mock user or generic
                let user;
                if (email === 'alex.founder@charterlegacy.com') {
                    user = {
                        id: 'mock-seed-1',
                        email: 'alex.founder@charterlegacy.com',
                        full_name: 'Alex Founder',
                        role: 'authenticated',
                        aud: 'authenticated'
                    };
                } else {
                    user = {
                        id: 'mock-user-existing', 
                        email,
                        full_name: 'Mock User', // Generic fallback name
                        role: 'authenticated',
                        aud: 'authenticated'
                    };
                }
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

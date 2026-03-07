import { useState, useEffect, useMemo } from 'react';

export const useFormationQueue = (supabase) => {
    const [viewMode, setViewMode] = useState('queue');
    const [searchQuery, setSearchQuery] = useState('');
    const [formations, setFormations] = useState([]);

    useEffect(() => {
        const fetchQueue = async () => {
            const { data, error } = await supabase
                .from('llcs')
                .select(`
                    id, user_id, llc_name, llc_status, created_at, principal_address, sunbiz_document_number
                `)
                .order('created_at', { ascending: false });

            if (data) {
                const mapped = data
                    .filter(llc => !['FILED', 'TRANSMITTED', 'Active'].includes(llc.llc_status))
                    .map(llc => {
                        const isPLLC = llc.llc_name?.includes('PLLC') || llc.llc_name?.includes('Professional');
                        const addrParts = llc.principal_address?.split(',') || [];
                        
                        return {
                            id: llc.id,
                            client_id: llc.user_id,
                            entityName: llc.llc_name || 'Unnamed Entity',
                            type: isPLLC ? 'PLLC' : 'LLC',
                            action_type: llc.llc_status === 'AR Pending' ? 'ANNUAL_REPORT' : llc.llc_status === 'Reinstating' ? 'REINSTATEMENT' : llc.llc_status === 'Dissolving' ? 'DISSOLUTION' : 'FORMATION',
                            document_number: llc.sunbiz_document_number || '',
                            status: llc.llc_status || 'AWAITING_REVIEW',
                            submitted: new Date(llc.created_at).toLocaleDateString(),
                            owner: 'Client',
                            priority: 'high',
                            filingOptions: { effectiveDate: '', certOfStatus: false, certifiedCopy: true },
                            principalAddress: { 
                                street: addrParts[0]?.trim() || '123 Business Way', 
                                suite: '', 
                                city: addrParts[1]?.trim() || 'Miami', 
                                state: 'FL', 
                                zip: addrParts[2]?.trim() || '33101' 
                            },
                            mailingAddress: { isSame: true, street: '', suite: '', city: '', state: '', zip: '' },
                            registeredAgent: { 
                                type: 'BUSINESS', 
                                businessName: 'Charter Legacy Services LLC',
                                firstName: '',
                                lastName: '',
                                signature: 'Charter Legacy Services LLC',
                                street: '456 Guardian Way', 
                                city: 'DeLand', 
                                state: 'FL', 
                                zip: '32724' 
                            },
                            correspondence: { name: 'Client', email: 'legal@charterlegacy.com' },
                            authPersonnel: [
                                { title: 'MGR', firstName: 'Authorized', lastName: 'Person', street: addrParts[0]?.trim() || '123 Business Way', city: addrParts[1]?.trim() || 'Miami', state: 'FL', zip: addrParts[2]?.trim() || '33101' }
                            ]
                        };
                    });

                // Fetch DBAs
                const { data: dbaData } = await supabase
                    .from('dbas')
                    .select('id, user_id, llc_id, dba_name, status, created_at, advertising_county, llcs(llc_name, principal_address)')
                    .order('created_at', { ascending: false });

                let mappedDbas = [];
                if (dbaData) {
                    mappedDbas = dbaData
                        .filter(dba => !['FILED', 'TRANSMITTED', 'Active'].includes(dba.status) || dba.status === 'Renewing')
                        .map(dba => {
                            const llc = dba.llcs || {};
                            const addrParts = llc.principal_address?.split(',') || [];
                            return {
                                id: dba.id,
                                client_id: dba.user_id,
                                entityName: dba.dba_name || 'Unnamed DBA',
                                type: 'DBA',
                                action_type: dba.status === 'Renewing' ? 'DBA_RENEWAL' : 'DBA_REGISTRATION',
                                document_number: '',
                                status: dba.status || 'AWAITING_REVIEW',
                                submitted: new Date(dba.created_at).toLocaleDateString(),
                                owner: llc.llc_name || 'Owner',
                                priority: 'high',
                                filingOptions: { county: dba.advertising_county },
                                principalAddress: { 
                                    street: addrParts[0]?.trim() || '', 
                                    suite: '', 
                                    city: addrParts[1]?.trim() || '', 
                                    state: 'FL', 
                                    zip: addrParts[2]?.trim() || '' 
                                },
                                mailingAddress: { isSame: true, street: '', suite: '', city: '', state: '', zip: '' },
                                registeredAgent: { type: 'BUSINESS', businessName: 'Charter Legacy Services LLC', firstName: '', lastName: '', signature: '', street: '', city: '', state: '', zip: '' },
                                correspondence: { name: 'Client', email: 'legal@charterlegacy.com' },
                                authPersonnel: []
                            };
                        });
                }

                let finalFormations = mapped ? [...mapped, ...mappedDbas] : [...mappedDbas];
                
                // Always inject the AR Demo card in local dev for testing purposes
                if (window.location.hostname === 'localhost') {
                    if (!finalFormations.find(f => f.id === 'mock-ar-testing-456')) {
                        finalFormations.push({
                            id: 'mock-ar-testing-456',
                            client_id: 'mock-client-id',
                            entityName: 'Charter Legacy AR Demo LLC',
                            type: 'LLC',
                            action_type: 'ANNUAL_REPORT',
                            document_number: 'L22000527008',
                            status: 'AWAITING_REVIEW',
                            submitted: new Date().toLocaleDateString(),
                            owner: 'Demo User',
                            priority: 'high',
                            filingOptions: { effectiveDate: '', certOfStatus: false, certifiedCopy: false },
                            principalAddress: { street: '', suite: '', city: '', state: '', zip: '' },
                            mailingAddress: { isSame: true, street: '', suite: '', city: '', state: '', zip: '' },
                            registeredAgent: { type: 'BUSINESS', businessName: 'Charter Legacy Services LLC', firstName: '', lastName: '', signature: 'Charter Legacy', street: '', city: 'DeLand', state: 'FL', zip: '32724' },
                            correspondence: { name: 'Demo User', email: 'legal@charterlegacy.com' },
                            authPersonnel: []
                        });
                    }
                    
                    if (finalFormations.length === 1 && finalFormations[0].id === 'mock-ar-testing-456') {
                         finalFormations.unshift({
                            id: 'mock-llc-for-testing-123',
                            client_id: 'mock-client-id',
                            entityName: 'Charter Legacy Test Entity LLC',
                            type: 'LLC',
                            action_type: 'FORMATION',
                            document_number: '',
                            status: 'AWAITING_REVIEW',
                            submitted: new Date().toLocaleDateString(),
                            owner: 'Demo User',
                            priority: 'high',
                            filingOptions: { effectiveDate: '', certOfStatus: false, certifiedCopy: true },
                            principalAddress: { street: '123 Test St', suite: '', city: 'Miami', state: 'FL', zip: '33101' },
                            mailingAddress: { isSame: true, street: '', suite: '', city: '', state: '', zip: '' },
                            registeredAgent: { type: 'BUSINESS', businessName: 'Charter Legacy Services LLC', firstName: '', lastName: '', signature: 'Charter Legacy Services LLC', street: '456 Guardian Way', city: 'DeLand', state: 'FL', zip: '32724' },
                            correspondence: { name: 'Demo User', email: 'legal@charterlegacy.com' },
                            authPersonnel: [{ title: 'MGR', firstName: 'Demo', lastName: 'User', street: '123 Test St', city: 'Miami', state: 'FL', zip: '33101' }]
                        });
                    }
                }
                setFormations(finalFormations);
            } else if (error) {
                console.error("Failed to fetch queue", error);
                if (window.location.hostname === 'localhost') {
                    setFormations([
                        {
                            id: 'mock-llc-for-testing-123',
                            client_id: 'mock-client-id',
                            entityName: 'Charter Legacy Test Entity LLC',
                            type: 'LLC',
                            action_type: 'FORMATION',
                            document_number: '',
                            status: 'AWAITING_REVIEW',
                            submitted: new Date().toLocaleDateString(),
                            owner: 'Demo User',
                            priority: 'high',
                            filingOptions: { effectiveDate: '', certOfStatus: false, certifiedCopy: true },
                            principalAddress: { street: '123 Test St', suite: '', city: 'Miami', state: 'FL', zip: '33101' },
                            mailingAddress: { isSame: true, street: '', suite: '', city: '', state: '', zip: '' },
                            registeredAgent: { type: 'BUSINESS', businessName: 'Charter Legacy Services LLC', firstName: '', lastName: '', signature: 'Charter Legacy Services LLC', street: '456 Guardian Way', city: 'DeLand', state: 'FL', zip: '32724' },
                            correspondence: { name: 'Demo User', email: 'legal@charterlegacy.com' },
                            authPersonnel: [{ title: 'MGR', firstName: 'Demo', lastName: 'User', street: '123 Test St', city: 'Miami', state: 'FL', zip: '33101' }]
                        },
                        {
                            id: 'mock-ar-testing-456',
                            client_id: 'mock-client-id',
                            entityName: 'Charter Legacy AR Demo LLC',
                            type: 'LLC',
                            action_type: 'ANNUAL_REPORT',
                            document_number: 'L22000527008',
                            status: 'AWAITING_REVIEW',
                            submitted: new Date().toLocaleDateString(),
                            owner: 'Demo User',
                            priority: 'high',
                            filingOptions: { effectiveDate: '', certOfStatus: false, certifiedCopy: false },
                            principalAddress: { street: '', suite: '', city: '', state: '', zip: '' },
                            mailingAddress: { isSame: true, street: '', suite: '', city: '', state: '', zip: '' },
                            registeredAgent: { type: 'BUSINESS', businessName: 'Charter Legacy Services LLC', firstName: '', lastName: '', signature: 'Charter Legacy', street: '', city: 'DeLand', state: 'FL', zip: '32724' },
                            correspondence: { name: 'Demo User', email: 'legal@charterlegacy.com' },
                            authPersonnel: []
                        }
                    ]);
                }
            }
        };
        fetchQueue();
    }, [supabase]);

    const filteredFormations = useMemo(() => {
        return formations.filter(f => 
            f.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [formations, searchQuery]);

    return {
        viewMode, 
        setViewMode,
        searchQuery, 
        setSearchQuery,
        formations, 
        setFormations,
        filteredFormations
    };
};

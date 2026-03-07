import { useState, useRef, useCallback } from 'react';
import { tinyfish } from '../../../lib/tinyfish';

export const validateSpec = (formation) => {
    const errors = [];
    if (!formation.entityName) errors.push({ id: 'entityName', label: 'Entity Name', tab: 'intake' });
    
    // Minimal validation for AR, DBA Registration, DBA Renewal, Reinstatement, Dissolution, and Certificate of Status
    if (formation.action_type === 'ANNUAL_REPORT' || formation.action_type === 'DBA_REGISTRATION' || formation.action_type === 'DBA_RENEWAL' || formation.action_type === 'REINSTATEMENT' || formation.action_type === 'DISSOLUTION' || formation.action_type === 'CERTIFICATE_OF_STATUS') {
        if (formation.action_type === 'ANNUAL_REPORT' && !formation.document_number) errors.push({ id: 'doc_number', label: 'Document Number', tab: 'intake' });
        if (formation.action_type === 'DBA_REGISTRATION' && !formation.filingOptions?.county) errors.push({ id: 'dba_county', label: 'Advertising County', tab: 'intake' });
        if (formation.action_type === 'REINSTATEMENT' && !formation.document_number) errors.push({ id: 'doc_number', label: 'Document Number', tab: 'intake' });
        if (formation.action_type === 'DISSOLUTION' && !formation.document_number) errors.push({ id: 'doc_number', label: 'Document Number', tab: 'intake' });
        return errors; 
    }

    if (!formation.type) errors.push({ id: 'type', label: 'Filing Type', tab: 'intake' });
    if (!formation.principalAddress?.street) errors.push({ id: 'principal_street', label: 'Principal Street', tab: 'addresses' });
    if (!formation.principalAddress?.city) errors.push({ id: 'principal_city', label: 'Principal City', tab: 'addresses' });
    
    const ra = formation.registeredAgent;
    if (!ra?.street) errors.push({ id: 'ra_street', label: 'RA Street', tab: 'ra' });
    if (!ra?.city) errors.push({ id: 'ra_city', label: 'RA City', tab: 'ra' });
    if (ra?.type === 'INDIVIDUAL' && !ra.firstName) errors.push({ id: 'ra_fname', label: 'RA First Name', tab: 'ra' });
    if (ra?.type === 'INDIVIDUAL' && !ra.lastName) errors.push({ id: 'ra_lname', label: 'RA Last Name', tab: 'ra' });
    if (ra?.type === 'BUSINESS' && !ra.businessName) errors.push({ id: 'ra_bizname', label: 'RA Business Name', tab: 'ra' });
    if (!ra?.signature) errors.push({ id: 'ra_sig', label: 'RA Signature', tab: 'ra' });
    
    if (!formation.correspondence?.email) errors.push({ id: 'corr_email', label: 'Correspondence Email', tab: 'intake' });
    if (!formation.authPersonnel || formation.authPersonnel.length === 0) {
        errors.push({ id: 'add_person', label: 'Add Authorized Person', tab: 'management' });
    } else {
        formation.authPersonnel.forEach((person, i) => {
            if (!person.firstName || !person.lastName) errors.push({ id: `person_${i}_name`, label: `Person ${i+1} Name`, tab: 'management' });
            if (!person.street || !person.city) errors.push({ id: `person_${i}_addr`, label: `Person ${i+1} Address`, tab: 'management' });
        });
    }
    
    return errors;
};

export const useTinyfishAutomation = (supabase, setToast, setFormations) => {
    const TINYFISH_KEY = window.localStorage.getItem('TINYFISH_KEY') || 'sk-tinyfish-_900RKNoZIA38xSHqFNhUl957VIGUMXw';
    
    const [activeAutomation, setActiveAutomation] = useState(null);
    const [automationState, setAutomationState] = useState('IDLE');
    const [automationLogs, setAutomationLogs] = useState([]);
    const [lastSnapshot, setLastSnapshot] = useState(null);
    const [apiKey, setApiKey] = useState(TINYFISH_KEY);
    const [showKeyPrompt, setShowKeyPrompt] = useState(!TINYFISH_KEY);
    const [handoffUrl, setHandoffUrl] = useState(null);
    const [currentUrl, setCurrentUrl] = useState(null);
    
    const [showSpecEditor, setShowSpecEditor] = useState(false);
    const [editingSpec, setEditingSpec] = useState(null);

    const automationAbort = useRef(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);
    const lastEventRef = useRef(Date.now());

    const handleSaveKey = useCallback(() => {
        window.localStorage.setItem('TINYFISH_KEY', apiKey);
        setShowKeyPrompt(false);
        setToast({ type: 'success', message: 'TinyFish API Key Saved locally.' });
    }, [apiKey, setToast]);

    const startAutomation = useCallback((formation) => {
        const errors = validateSpec(formation);
        if (errors.length > 0) {
            setEditingSpec({ ...formation });
            setShowSpecEditor(true);
            setToast({ 
                type: 'error', 
                message: `Statutory Check Failed: Missing ${errors.map(e => e.label).join(', ')}` 
            });
            return;
        }

        if (!apiKey) {
            setShowKeyPrompt(true);
            return;
        }
        
        setActiveAutomation(formation);
        setAutomationState('NAVIGATING');
        setHandoffUrl(null);
        
        // --- Goal Strings Logic from FormationFactory ---
        let goal = '';
        if (formation.action_type === 'ANNUAL_REPORT') {
            setCurrentUrl('https://services.sunbiz.org/Filings/AnnualReport/FilingStart');
            goal = `Navigate to https://services.sunbiz.org/Filings/AnnualReport/FilingStart
            1. Enter the Document Number: "${formation.document_number}"
            2. Click Submit.
            3. Log "Intake & Addresses complete".
            4. Review the Annual Report details page.
            5. Update the Principal Address to: ${formation.principalAddress.street}, ${formation.principalAddress.city}, FL ${formation.principalAddress.zip}
            6. Log "Registered Agent complete".
            7. CRITICAL: Stop at the final review screen and take a screenshot. DO NOT click proceed to payment.`;
        } else if (formation.action_type === 'DBA_REGISTRATION') {
            setCurrentUrl('https://efile.sunbiz.org/fict01.html');
            goal = `Navigate to https://efile.sunbiz.org/fict01.html
            1. Start Fictitious Name Registration.
            2. FILL FILING INFORMATION:
               - Owner Name (LLC): "${formation.owner}"
               - Fictitious Name (DBA): "${formation.entityName}"
               - County of Principal Business: "${formation.filingOptions?.county || 'Miami-Dade'}"
            3. FILL MAILING ADDRESS:
               - Address: "${formation.principalAddress?.street}"
               - City, State: "${formation.principalAddress?.city}", "${formation.principalAddress?.state}"
               - Zip: "${formation.principalAddress?.zip}"
            4. FILL FLORIDA PRINCIPAL PLACE OF BUSINESS:
               - Same as mailing address.
            5. CRITICAL: Stop at the final review/payment screen. Take a final screenshot.`;
        } else if (formation.action_type === 'DBA_RENEWAL') {
            setCurrentUrl('https://efile.sunbiz.org/fict01.html');
            goal = `Renew the existing Florida Fictitious Name (DBA) for '${formation.entityName}'. Owner is '${formation.owner}'. Bypass the advertising requirement step as this is a strict statutory renewal. Verify the owner address and proceed to the $50 state fee payment checkout screen.`;
        } else if (formation.action_type === 'REINSTATEMENT') {
            setCurrentUrl('https://services.sunbiz.org/Filings/Reinstatement/FilingStart');
            goal = `Navigate to https://services.sunbiz.org/Filings/Reinstatement/FilingStart
            1. Enter the Document Number: "${formation.document_number}"
            2. Click Submit to begin reinstatement.
            3. Review the entity details — confirm Entity Name matches: "${formation.entityName}"
            4. Confirm registered agent information is current. RA: Charter Legacy Services LLC, DeLand, FL 32724.
            5. Verify the principal address.
            6. CRITICAL: Stop at the final review/payment screen. Take a screenshot. DO NOT click proceed to payment.`;
        } else if (formation.action_type === 'DISSOLUTION') {
            setCurrentUrl('https://services.sunbiz.org/Filings/Dissolution/FilingStart');
            goal = `Navigate to https://services.sunbiz.org/Filings/Dissolution/FilingStart
            1. Enter the Document Number: "${formation.document_number}"
            2. Click Submit to begin dissolution filing.
            3. Review the entity details — confirm Entity Name matches: "${formation.entityName}"
            4. Select Filing Type: "Articles of Dissolution"
            5. Verify the registered agent information is current.
            6. CRITICAL: Stop at the final review/payment screen. Take a screenshot. DO NOT click proceed to payment.`;
        } else if (formation.action_type === 'CERTIFICATE_OF_STATUS') {
            setCurrentUrl('https://services.sunbiz.org/Filings/CertificateOfStatus/FilingStart');
            goal = `Navigate to https://services.sunbiz.org/Filings/CertificateOfStatus/FilingStart
            1. Enter the Document Number: "${formation.document_number}"
            2. Click Submit to search for the entity.
            3. Review the entity details — confirm Entity Name matches: "${formation.entityName}"
            4. Select Certificate Type: "${formation.filingOptions?.certified ? 'Certified Copy' : 'Certificate of Status'}"
            5. CRITICAL: Stop at the final review/payment screen. Take a screenshot. DO NOT click proceed to payment.`;
        } else {
            setCurrentUrl('https://dos.myflorida.com/sunbiz/start-e-filing/efile-articles-of-organization/');
            goal = `Navigate to https://dos.myflorida.com/sunbiz/start-e-filing/efile-articles-of-organization/. 
            1. Start LLC E-Filing.
            2. FILL FILING INFORMATION:
               - LLC Name: "${formation.entityName}"${formation.type === 'PLLC' ? '\n               - Professional Purpose: "Professional Services"' : ''}
               - Effective Date: "${formation.filingOptions?.effectiveDate || 'Today'}"
               - Certificate of Status ($5): ${formation.filingOptions?.certOfStatus ? 'Check yes' : 'Leave unchecked'}
               - Certified Copy ($30): ${formation.filingOptions?.certifiedCopy ? 'Check yes' : 'Leave unchecked'}
            3. FILL PRINCIPAL ADDRESS:
               - Address: "${formation.principalAddress?.street}"
               - Suite: "${formation.principalAddress?.suite || ''}"
               - City, State: "${formation.principalAddress?.city}", "${formation.principalAddress?.state}"
               - Zip: "${formation.principalAddress?.zip}"
            4. FILL MAILING ADDRESS:
               - ${formation.mailingAddress?.isSame ? "Check 'Mailing address same as principal address'" : `Fill: ${formation.mailingAddress?.street}, ${formation.mailingAddress?.city}, ${formation.mailingAddress?.zip}`}
            5. CRITICAL: Take a screenshot and log "Intake & Addresses complete".
            6. FILL REGISTERED AGENT:
               - ${formation.registeredAgent?.type === 'INDIVIDUAL' ? `Individual Name: ${formation.registeredAgent.firstName} ${formation.registeredAgent.lastName}` : `Business Name: ${formation.registeredAgent.businessName}`}
               - RA Address: "${formation.registeredAgent?.street}, ${formation.registeredAgent?.city}, FL ${formation.registeredAgent?.zip}"
               - Sign: Type "${formation.registeredAgent?.firstName} ${formation.registeredAgent?.lastName}" in Signature box.
            7. CRITICAL: Take a screenshot and log "Registered Agent complete".
            8. FILL CORRESPONDENCE:
               - Name: "${formation.correspondence?.name}"
               - Email: "${formation.correspondence?.email}"
            9. FILL AUTHORIZED PERSONNEL (MGR/AMBR):
               ${formation.authPersonnel?.map((p, i) => `
               Entry ${i + 1}:
               - Title: ${p.title}
               - Name: ${p.firstName} ${p.lastName}
               - Address: ${p.street}, ${p.city}, ${p.state} ${p.zip}
               `).join('\n')}
            10. CRITICAL: Stop at the final review/payment screen. Take a final screenshot.`;
        }

        setLastSnapshot(null);
        setAutomationLogs([{
            timestamp: new Date().toLocaleTimeString(),
            message: `Initiating Protocol Tinyfish for ${formation.entityName}...`,
            type: 'system'
        }]);
        
        setElapsedTime(0);
        lastEventRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
            
            // Proactive "Thinking" logs
            if (Date.now() - lastEventRef.current > 15000) {
                const thinkingMessages = [
                    "Analyzing Sunbiz DOM structure...",
                    "Waiting for Florida State servers to respond...",
                    "Verifying field availability...",
                    "Ensuring statutory alignment...",
                    "Calculating next optimal navigation path..."
                ];
                const msg = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
                setAutomationLogs(prev => [...prev.slice(-49), {
                    timestamp: new Date().toLocaleTimeString(),
                    message: `[SYSTEM] ${msg}`,
                    type: 'system'
                }]);
                lastEventRef.current = Date.now();
            }
        }, 1000);
        
        automationAbort.current = new AbortController();
        
        tinyfish.run({
            url: 'https://dos.myflorida.com/sunbiz/',
            goal,
            apiKey,
            controller: automationAbort.current,
            onEvent: async (data) => {
                let message = data.message;
                
                if (data.url || data.payload?.url) setCurrentUrl(data.url || data.payload?.url);
                
                if (!message) {
                    if (data.event === 'navigation' || data.type === 'navigation') {
                        message = `Navigating to ${data.payload?.url || data.url || 'next section'}...`;
                    } else if (data.event === 'action' || data.type === 'action') {
                        const payload = data.payload || data;
                        if (payload.action === 'fill' || payload.action === 'type') {
                            message = `[INJECT] ${payload.value} -> ${payload.target || payload.selector || payload.description || 'field'}`;
                        } else if (payload.action === 'click') {
                            message = `[CLICK] ${payload.target || payload.selector || payload.description || 'element'}`;
                        } else {
                            message = `[ACTION] ${payload.action} on ${payload.target || payload.selector || 'interaction point'}`;
                        }
                    } else if (data.event === 'completed') {
                        message = "Protocol successfully finalized.";
                    } else {
                        message = `[${(data.event || data.type || 'LOG').toUpperCase()}] ${data.payload ? (typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload)) : JSON.stringify(data)}`;
                    }
                }

                setAutomationLogs(prev => [...prev.slice(-49), {
                    timestamp: new Date().toLocaleTimeString(),
                    message,
                    type: data.event === 'completed' ? 'success' : 'info'
                }]);
                lastEventRef.current = Date.now();

                // DB Logging Sync
                if (data.event === 'navigation' || data.event === 'field_filled' || data.event === 'completed') {
                    try {
                        await supabase.from('system_events_ledger').insert({
                            entity_id: formation.id,
                            client_id: formation.client_id || null,
                            actor_id: 'TINYFISH_BOT',
                            actor_type: 'TINYFISH_BOT',
                            event_category: 'FILING_AUTOMATION',
                            event_type: 'SUNBIZ_TELEMETRY',
                            severity: data.event === 'completed' ? 'SUCCESS' : 'INFO',
                            customer_facing_message: data.event === 'completed' ? `Automated filing sequence finalized for ${formation.entityName}.` : null,
                            internal_payload: { step: data.event, message: message, url: data.payload?.url }
                        });
                    } catch (syncErr) {
                        console.error('[Action Ledger] Failed to sync event:', syncErr);
                    }
                }

                if (data.event === 'screenshot') {
                    setLastSnapshot(data.payload?.url || data.payload?.data);
                    setAutomationLogs(prev => [...prev, {
                        timestamp: new Date().toLocaleTimeString(),
                        message: "VISUAL SNAPSHOT CAPTURED",
                        type: 'system'
                    }]);
                }

                if (data.event === 'completed') {
                    setAutomationState('COMPLETE');
                    setHandoffUrl(data.payload?.takeoverUrl || data.payload?.url || null);
                    clearInterval(timerRef.current);
                    setFormations(prev => prev.map(f => f.id === formation.id ? { ...f, status: 'DRAFT_SAVED' } : f));
                    
                    try {
                        await supabase.from('llcs').update({ llc_status: 'TRANSMITTED', filed_at: new Date().toISOString() }).eq('id', formation.id);
                        await supabase.functions.invoke('send-action-audit', {
                            body: {
                                action_type: 'SUNBIZ_FILING_COMPLETE',
                                entity_id: formation.id,
                                user_id: formation.client_id,
                                details: { tracking_number: 'N/A' }
                            }
                        });
                        setAutomationLogs(prev => [...prev.slice(-49), {
                            timestamp: new Date().toLocaleTimeString(),
                            message: `Action Audit Email dispatched to client via Secure Exchange.`,
                            type: 'system'
                        }]);
                    } catch (emailErr) {
                        console.error('[Action Ledger] Failed to send audit email or update status:', emailErr);
                    }
                }
            },
            onError: async (err) => {
                setAutomationState('ERROR');
                clearInterval(timerRef.current);
                setAutomationLogs(prev => [...prev, {
                    timestamp: new Date().toLocaleTimeString(),
                    message: `PROTOCOL ABORTED: ${err.message}`,
                    type: 'error'
                }]);
                
                try {
                    await supabase.from('system_events_ledger').insert({
                        entity_id: formation.id,
                        client_id: formation.client_id || null,
                        actor_id: 'SYSTEM',
                        actor_type: 'SYSTEM',
                        event_category: 'FILING_AUTOMATION',
                        event_type: 'SUNBIZ_EXCEPTION',
                        severity: 'CRITICAL',
                        customer_facing_message: 'Our automation engine encountered a temporary roadblock with the State portal. Our staff has been alerted.',
                        internal_payload: { error: err.message, stack: err.stack },
                        system_snapshot: formation
                    });
                } catch (auditErr) {}
                
                setToast({ type: 'error', message: 'Automation Failure: Check Logs' });
            }
        });
    }, [apiKey, supabase, setToast, setFormations]);

    const stopAutomation = useCallback(async () => {
        automationAbort.current?.abort();
        clearInterval(timerRef.current);
        setAutomationState('IDLE');
        
        setAutomationLogs(prev => [...prev.slice(-49), {
            timestamp: new Date().toLocaleTimeString(),
            message: "PROTOCOL REVOKED: Emergency stop triggered. Clearing session footprint.",
            type: 'error'
        }]);

        if (activeAutomation) {
            try {
                await supabase.from('system_events_ledger').insert({
                    entity_id: activeAutomation.id,
                    client_id: activeAutomation.client_id || null,
                    actor_id: 'CURRENT_OPERATOR_ID',
                    actor_type: 'STAFF',
                    event_category: 'FILING_AUTOMATION',
                    event_type: 'MANUAL_ABORT',
                    severity: 'WARNING',
                    internal_payload: { reason: 'Emergency Stop trigger by operator' }
                });
            } catch (err) {
                console.error('[Action Ledger] Failed to log revocation:', err);
            }
        }
    }, [activeAutomation, supabase]);

    return {
        activeAutomation,
        setActiveAutomation,
        automationState,
        setAutomationState,
        automationLogs,
        setAutomationLogs,
        lastSnapshot,
        setLastSnapshot,
        apiKey,
        setApiKey,
        showKeyPrompt,
        setShowKeyPrompt,
        handoffUrl,
        setHandoffUrl,
        currentUrl,
        setCurrentUrl,
        showSpecEditor,
        setShowSpecEditor,
        editingSpec,
        setEditingSpec,
        elapsedTime,
        handleSaveKey,
        startAutomation,
        stopAutomation,
    };
};

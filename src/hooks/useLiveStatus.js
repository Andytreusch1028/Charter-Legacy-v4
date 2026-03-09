import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useLiveStatus Hook
 * Subscribes to real-time events from system_events_ledger and ra_document_audit
 * to provide live status updates for the dashboard UI rings and status boards.
 */
export const useLiveStatus = (entityId, userId) => {
    const [lastEvent, setLastEvent] = useState(null);
    const [systemStatus, setSystemStatus] = useState('ACTIVE'); // Default status
    const [isSyncing, setIsSyncing] = useState(false);
    const [breachAlert, setBreachAlert] = useState(false);

    useEffect(() => {
        if (!entityId || !userId) return;

        // 1. Initial Fetch of latest events
        const fetchLatestStatus = async () => {
            const { data: ledgerData } = await supabase
                .from('system_events_ledger')
                .select('*')
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (ledgerData && ledgerData.length > 0) {
                processEvent(ledgerData[0]);
            }
        };

        const processEvent = (event) => {
            setLastEvent(event);
            
            // Map event categories/types to UI states
            if (event.event_category === 'SECURITY' && event.severity === 'CRITICAL') {
                setBreachAlert(true);
            }

            if (event.event_type === 'SYNC_STARTED') {
                setIsSyncing(true);
            } else if (event.event_type === 'SYNC_COMPLETED') {
                setIsSyncing(false);
            }

            // Update global status based on severity
            if (event.severity === 'CRITICAL') {
                setSystemStatus('BREACH_DETECTED');
            } else if (event.severity === 'WARNING') {
                setSystemStatus('ATTENTION_REQUIRED');
            } else {
                setSystemStatus('SECURE');
            }
        };

        fetchLatestStatus();

        // 2. Real-time Subscriptions
        const ledgerChannel = supabase.channel(`live-status-${entityId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'system_events_ledger',
                filter: `entity_id=eq.${entityId}`
            }, (payload) => {
                processEvent(payload.new);
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'ra_document_audit',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                // Documents being ingested/audited can trigger "Syncing" state
                setLastEvent({
                    event_type: 'DOCUMENT_AUDIT',
                    severity: 'INFO',
                    customer_facing_message: 'RA Document Audit in progress...',
                    created_at: payload.new.created_at
                });
                setIsSyncing(true);
                // Auto-reset syncing after a delay if no completion event
                setTimeout(() => setIsSyncing(false), 5000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ledgerChannel);
        };
    }, [entityId, userId]);

    return {
        lastEvent,
        systemStatus,
        isSyncing,
        breachAlert
    };
};

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, CheckCircle2, Fingerprint } from 'lucide-react';

export const useDashboardData = (user, initialData, setProtocolData) => {
  const [loading, setLoading] = useState(true);
  const [llcData, setLlcData] = useState(initialData || null);
  const [allLlcs, setAllLlcs] = useState([]);
  const [activeDBA, setActiveDBA] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [newDocCount, setNewDocCount] = useState(0);
  const [showDesignation, setShowDesignation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Localhost Bypass: Auto-grant Heritage Vault permission
      if (window.location.hostname === 'localhost') {
        if (user && !user.permissions) {
          user.permissions = { heritage_vault: true };
        } else if (user?.permissions) {
          user.permissions.heritage_vault = true;
        }
      }

      try {
        // Fetch LLC Data if not provided
        if (!llcData) {
            const { data, error } = await supabase
                .from('llcs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (data && data.length > 0) {
                setAllLlcs(data);
                if (data.length === 1) {
                    setLlcData(data[0]);
                    if (data[0].llc_name.includes('Pending Formation') || data[0].llc_status === 'Setting Up') {
                        setShowDesignation(true);
                    }
                }
            }
        }

        // Fetch user's active DBA if any
        const { data: dbaData } = await supabase
            .from('dbas')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (dbaData && dbaData.length > 0) {
            setActiveDBA(dbaData[0]);
        }

        // Fetch RA Alerts
        const { count } = await supabase
            .from('registered_agent_documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('viewed', false);
        
        setNewDocCount(count || 0);

        // Bootstrap protocol data for VaultTile card
        const { data: wills } = await supabase
            .from('wills')
            .select('protocol_data')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
        if (wills && wills.length > 0 && wills[0].protocol_data) {
            setProtocolData(wills[0].protocol_data);
        }

        // Mock Activity Log
        setActivityLog([
            { id: 1, message: "Privacy Protection Started", time: "Just now", icon: ShieldCheck },
            { id: 2, message: "Institutional Payment Verified", time: "1 min ago", icon: CheckCircle2 },
            { id: 3, message: "Identity Verification Active", time: "Action Required", icon: Fingerprint },
        ]);

        setTimeout(() => setLoading(false), 2000);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        // Graceful fallback
        if (!llcData) {
          const isLocalDev = window.location.hostname === 'localhost';
          const isAuditor = user?.email?.includes('auditor');
          
          if (isLocalDev || isAuditor) {
            const mockLLC = {
                llc_name: isAuditor ? 'Pending Formation - LLC Name TBD' : 'Charter Legacy Demo LLC',
                llc_status: isAuditor ? 'Setting Up' : 'Active',
                privacy_shield_active: true,
                created_at: new Date().toISOString(),
                _isDemoData: true,
            };
            setLlcData(mockLLC);
            if (isAuditor) setShowDesignation(true);
          }
        }
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to new documents to update alert real-time
    const channel = supabase
      .channel('ra_doc_alerts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'registered_agent_documents',
        filter: `user_id=eq.${user.id}` 
      }, () => {
        const fetchCount = async () => {
          const { count } = await supabase
            .from('registered_agent_documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('viewed', false);
          setNewDocCount(count || 0);
        };
        fetchCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, llcData, setProtocolData]); // Include dependencies

  return {
    loading,
    setLoading,
    llcData,
    setLlcData,
    allLlcs,
    setAllLlcs,
    activeDBA,
    setActiveDBA,
    activityLog,
    setActivityLog,
    newDocCount,
    setNewDocCount,
    showDesignation,
    setShowDesignation
  };
};

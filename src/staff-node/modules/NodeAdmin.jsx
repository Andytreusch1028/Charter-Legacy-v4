import React, { useState, useEffect } from 'react';
import { 
    ShieldAlert, CheckCircle2, XCircle, Clock, 
    UserCheck, Search, Shield, Zap, RefreshCw, Key
} from 'lucide-react';

const NodeAdmin = ({ supabase, staffRole, setToast, CURRENT_OPERATOR }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('recovery');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('staff_recovery_requests')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setRequests(data || []);
        } catch (err) {
            console.error('Fetch error:', err);
            // Fallback for demo
            setRequests([
                { id: 'REC-001', staff_email: 'j.voss@charter-staff.internal', requested_node: 'Node-04', status: 'PENDING', created_at: new Date().toISOString() },
                { id: 'REC-002', staff_email: 's.chen@charter-staff.internal', requested_node: 'Node-02', status: 'COMPLETED', created_at: new Date(Date.now() - 86400000).toISOString() }
            ]);
        }
        setLoading(false);
    };

    const handleAction = async (requestId, action) => {
        const status = action === 'approve' ? 'APPROVED' : 'DENIED';
        try {
            const { error } = await supabase
                .from('staff_recovery_requests')
                .update({ 
                    status, 
                    verifier_id: CURRENT_OPERATOR.id 
                })
                .eq('id', requestId);

            if (error) throw error;
            
            setToast({ 
                type: action === 'approve' ? 'success' : 'warning', 
                message: action === 'approve' ? 'Access Recovery Authorized.' : 'Recovery Denied.' 
            });
            fetchRequests();
        } catch (err) {
            setToast({ type: 'error', message: 'Update failed.' });
        }
    };

    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab('recovery')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'recovery' ? 'bg-white text-luminous-ink shadow-sm' : 'text-gray-400'}`}
                    >
                        <ShieldAlert size={12} /> Recovery Queue {requests.filter(r => r.status === 'PENDING').length > 0 && `(${requests.filter(r => r.status === 'PENDING').length})`}
                    </button>
                    <button 
                        onClick={() => setActiveTab('nodes')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'nodes' ? 'bg-white text-luminous-ink shadow-sm' : 'text-gray-400'}`}
                    >
                        <Zap size={12} /> Active Nodes
                    </button>
                </div>

                <button onClick={fetchRequests} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-luminous-blue transition-all">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activeTab === 'recovery' ? (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic">No access recovery requests pending.</div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="p-6 bg-white border border-gray-100 rounded-[32px] flex items-center justify-between group hover:shadow-xl hover:shadow-gray-200/40 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                            req.status === 'PENDING' ? 'bg-amber-50 text-amber-500 animate-pulse' : 
                                            req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'
                                        }`}>
                                            <Key size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-luminous-ink uppercase tracking-tight text-sm">{req.staff_email}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Target Node: {req.requested_node} · {new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                                            req.status === 'PENDING' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                            req.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-400'
                                        }`}>
                                            {req.status}
                                        </div>
                                        {req.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleAction(req.id, 'deny')}
                                                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(req.id, 'approve')}
                                                    className="px-6 h-10 rounded-xl bg-luminous-blue text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-luminous-blue/20 hover:bg-hacker-blue transition-all flex items-center gap-2"
                                                >
                                                    <UserCheck size={14} /> Authorize Reset
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        {['DeLand-01', 'Miami-02', 'Tampa-04', 'Orlando-03'].map(node => (
                            <div key={node} className="p-8 bg-white border border-gray-100 rounded-[40px] relative overflow-hidden group hover:border-luminous-blue/20 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap size={80} />
                                </div>
                                <h3 className="text-xl font-black text-luminous-ink uppercase tracking-tighter mb-1">{node}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-black text-gray-300 uppercase italic tracking-widest">Node Operational</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                        <span className="text-[9px] font-black text-gray-400 uppercase">Latency</span>
                                        <span className="text-[10px] font-black text-emerald-500">12ms</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                        <span className="text-[9px] font-black text-gray-400 uppercase">Uptime</span>
                                        <span className="text-[10px] font-black text-luminous-ink">99.98%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NodeAdmin;

import React, { useState, useEffect } from 'react';
import { 
  Activity, FileText, Settings, Shield, MessageSquare, ClipboardList, Loader2 
} from 'lucide-react';

// Hooks
import { useRaData } from './hooks/useRaData';

// Sectors
import RaDashboardSector from './sectors/ra/RaDashboardSector';
import RaVaultSector from './sectors/ra/RaVaultSector';
import RaConfigSector from './sectors/ra/RaConfigSector';
import RaSupportSector from './sectors/ra/RaSupportSector';
import RaAuditSector from './sectors/ra/RaAuditSector';

// Modals
import ComplianceStatusModal from './components/ComplianceStatusModal';
import { PremiumToast } from './shared/design-system/UIPrimitives';

/**
 * RegisteredAgentConsole
 * The primary interface for clients to manage their Florida Registered Agent domain.
 * Refactored to a Sector-based architecture for mission-critical reliability.
 */
const RegisteredAgentConsole = ({ isModal = false, onClose, initialTab = 'dashboard' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [toast, setToast] = useState(null);
    const [isComplianceOpen, setIsComplianceOpen] = useState(false);
    
    const { 
        loading, 
        documents, 
        config, 
        inquiries,
        auditLogs,
        threadMessages,
        fetchRaData, 
        updateConfig,
        setDocuments,
        fetchThreadMessages,
        sendMessage,
        createThread,
        logRaEvent
    } = useRaData();

    // Initial Sync
    useEffect(() => {
        fetchRaData();
    }, [fetchRaData]);
    const handleAction = async (action, docIds) => {
        if (!docIds || docIds.length === 0) return;
        
        if (action === 'view' || action === 'download') {
            const doc = documents.find(d => d.id === docIds[0]);
            if (doc && doc.download_url) {
                window.open(doc.download_url, '_blank');
                return;
            } else {
                setToast({ message: 'Document preview URL not available.', type: 'error' });
                return;
            }
        }

        console.log(`[RA Console] Executing action: ${action} on ${docIds.length} items`);
        setToast({ message: `${action.charAt(0).toUpperCase() + action.slice(1)} initiated successfully.`, type: 'success' });
    };

    const triggerFireDrill = () => {
        const fireDrillDoc = {
            id: `fire-drill-${Date.now()}`,
            title: 'Service of Process (Simulated Alert)',
            date: new Date().toLocaleDateString(),
            type: 'Legal Notice',
            status: 'URGENT PENDING',
            viewed: false,
            urgent: true
        };
        
        setDocuments(prev => [fireDrillDoc, ...prev]);
        setToast({ message: "CRITICAL: Service of Process Simulated. Check Dashboard.", type: 'error' });
    };

    const tabs = [
        { id: 'dashboard', icon: Activity,       label: 'Dashboard' },
        { id: 'documents', icon: FileText,        label: 'Document Vault' },
        { id: 'inquiries', icon: MessageSquare,   label: 'Agent Support' },
        { id: 'config',    icon: Settings,        label: 'Forwarding Config' },
        { id: 'shield',    icon: Shield,          label: 'Address Shield' },
        { id: 'audit',     icon: ClipboardList,   label: 'Audit Log' },
    ];

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 bg-[#0A0A0B]">
                <Loader2 className="animate-spin text-luminous-blue" size={28} />
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400">Connecting to DeLand Hub...</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full bg-[#0A0A0B] text-white font-sans overflow-hidden ${isModal ? 'rounded-[32px] border border-white/5 shadow-2xl relative' : ''}`}>
            {isModal && (
                <button 
                  onClick={onClose}
                  className="absolute top-8 right-8 z-50 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Activity size={18} className="rotate-45" />
                </button>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-20 md:w-64 bg-[#121214] border-r border-white/5 flex flex-col shrink-0">
                    <div className="p-6 md:p-8 flex-1">
                        <div className="flex items-center gap-3 mb-10 overflow-hidden">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shrink-0">
                                <Shield size={20} />
                            </div>
                            <div className="hidden md:block">
                                <span className="font-black text-xs uppercase tracking-widest block">Charter RA</span>
                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">VAULT_NODE_FL</span>
                            </div>
                        </div>

                        <nav className="space-y-1.5">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${
                                        activeTab === tab.id 
                                            ? 'bg-white text-black' 
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} className="shrink-0" />
                                    <span className="hidden md:block font-bold text-[10px] uppercase tracking-widest">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-10 md:p-12">
                   <div className="max-w-6xl mx-auto">
                        {activeTab === 'dashboard' && (
                            <RaDashboardSector 
                                documents={documents} 
                                onOpenCompliance={() => setIsComplianceOpen(true)}
                                onTabChange={setActiveTab}
                            />
                        )}
                        {activeTab === 'documents' && (
                            <RaVaultSector 
                                documents={documents} 
                                onAction={handleAction} 
                            />
                        )}
                        {activeTab === 'config' && (
                            <RaConfigSector 
                                config={config} 
                                onUpdateConfig={updateConfig}
                                triggerFireDrill={triggerFireDrill}
                            />
                        )}
                        {activeTab === 'inquiries' && (
                            <RaSupportSector
                                inquiries={inquiries}
                                threadMessages={threadMessages}
                                fetchThreadMessages={fetchThreadMessages}
                                sendMessage={sendMessage}
                                createThread={createThread}
                            />
                        )}
                        {activeTab === 'audit' && (
                            <RaAuditSector
                                auditLogs={auditLogs}
                            />
                        )}
                        {activeTab === 'shield' && (
                             <div className="p-12 border border-white/5 rounded-[24px] text-center bg-white/[0.02]">
                                <Shield className="mx-auto text-emerald-500 mb-4" size={32} />
                                <h3 className="text-white font-medium mb-1">Privacy Shield Active</h3>
                                <p className="text-sm text-gray-500">Your home address is fully protected by the DeLand Hub Node.</p>
                            </div>
                        )}
                   </div>
                </main>
            </div>

            {isComplianceOpen && <ComplianceStatusModal onClose={() => setIsComplianceOpen(false)} />}
            {toast && <PremiumToast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default RegisteredAgentConsole;

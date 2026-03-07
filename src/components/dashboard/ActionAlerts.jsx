import React from 'react';
import { AlertCircle, Activity, RefreshCw } from 'lucide-react';

const ActionAlerts = ({ 
    llcData, 
    activeDBA, 
    hasReportAccess, 
    onOpenAnnualReport, 
    onOpenDBARenewal, 
    onOpenReinstatement 
}) => {
    
    // 1. Annual Report Logic
    const renderAnnualReportAlert = () => {
        return (
            <div className="mb-8 w-max">
                <div 
                    onClick={() => {
                        if (hasReportAccess) onOpenAnnualReport();
                    }}
                    className={`relative group ${hasReportAccess ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-not-allowed opacity-60'} overflow-hidden p-[1px] rounded-2xl transition-all`}
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 rounded-2xl animate-[spin_3s_linear_infinite] group-hover:animate-none opacity-50"></span>
                    <div className="relative bg-slate-900 border border-amber-500/30 px-6 py-4 rounded-2xl flex items-center gap-4 transition-all group-hover:bg-slate-800">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <AlertCircle size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-0.5">Urgent Action Required</p>
                            <p className="text-sm font-bold text-white">2026 Annual Report Due</p>
                        </div>
                        <div className="ml-4 pl-4 border-l border-white/10 hidden sm:block">
                            <p className="text-xs text-gray-400">File by May 1st to avoid a $400 statutory late fee.</p>
                        </div>
                        <div className="ml-8 px-4 py-2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg group-hover:bg-amber-400 transition-colors">
                            File Now
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 2. DBA Renewal Logic
    const renderDBARenewalAlert = () => {
        if (!activeDBA || activeDBA.status === 'Renewed') return null;

        const created = new Date(activeDBA.created_at);
        const expiration = new Date(created.setFullYear(created.getFullYear() + 5));
        const now = new Date();
        const monthsUntilExpiry = (expiration - now) / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsUntilExpiry > 6) return null;

        return (
            <div className="mb-8 w-max">
                <div 
                    onClick={onOpenDBARenewal}
                    className="relative group cursor-pointer hover:scale-[1.02] overflow-hidden p-[1px] rounded-2xl transition-all"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 rounded-2xl animate-[spin_3s_linear_infinite] group-hover:animate-none opacity-50"></span>
                    <div className="relative bg-slate-900 border border-red-500/30 px-6 py-4 rounded-2xl flex items-center gap-4 transition-all group-hover:bg-slate-800">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                            <Activity size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-0.5">Brand Risk Alert</p>
                            <p className="text-sm font-bold text-white">DBA Renewal Due: {activeDBA.dba_name}</p>
                        </div>
                        <div className="ml-4 pl-4 border-l border-white/10 hidden sm:block">
                            <p className="text-xs text-gray-400">Florida requires Fictitious Names to be renewed every 5 years.</p>
                        </div>
                        <div className="ml-8 px-4 py-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg group-hover:bg-red-400 transition-colors">
                            Renew Now
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 3. Reinstatement Logic
    const renderReinstatementAlert = () => {
        if (!llcData?.llc_status || !['Admin Dissolved', 'Inactive', 'Revoked'].includes(llcData.llc_status)) {
            return null;
        }

        return (
            <div className="mb-8 w-max">
                <div 
                    onClick={onOpenReinstatement}
                    className="relative group cursor-pointer hover:scale-[1.02] overflow-hidden p-[1px] rounded-2xl transition-all"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-2xl animate-[spin_3s_linear_infinite] group-hover:animate-none opacity-50"></span>
                    <div className="relative bg-slate-900 border border-orange-500/30 px-6 py-4 rounded-2xl flex items-center gap-4 transition-all group-hover:bg-slate-800">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <RefreshCw size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-0.5">Entity Recovery Required</p>
                            <p className="text-sm font-bold text-white">LLC Reinstatement Needed</p>
                        </div>
                        <div className="ml-4 pl-4 border-l border-white/10 hidden sm:block">
                            <p className="text-xs text-gray-400">Your LLC has been administratively dissolved. File for reinstatement to restore active status.</p>
                        </div>
                        <div className="ml-8 px-4 py-2 bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg group-hover:bg-orange-400 transition-colors">
                            Reinstate Now
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {renderAnnualReportAlert()}
            {renderDBARenewalAlert()}
            {renderReinstatementAlert()}
        </>
    );
};

export default ActionAlerts;

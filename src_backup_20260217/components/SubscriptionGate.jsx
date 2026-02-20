import React from 'react';
import { usePermissions } from '../hooks/usePermissions.jsx';
import { Lock } from 'lucide-react';

const SubscriptionGate = ({ 
    feature, 
    children, 
    fallback = 'blur' 
}) => {
    const { 
        canAccess, 
        setIsUpgradeModalOpen 
    } = usePermissions();

    if (canAccess(feature)) {
        return children;
    }

    if (fallback === 'hide') {
        return null;
    }

    return (
        <div className="relative group cursor-not-allowed">
            <div className="blur-md grayscale opacity-50 pointer-events-none select-none">
                {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 animate-in fade-in duration-500">
                <div 
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="flex flex-col items-center gap-3 bg-black/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-black/80 transition-all cursor-pointer shadow-2xl group/lock"
                >
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-gray-400 group-hover/lock:bg-blue-500 group-hover/lock:text-white transition-colors">
                        <Lock size={20} />
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover/lock:text-blue-400">Restricted Protocol</span>
                        <h4 className="text-white font-bold text-sm mt-1">Upgrade to Access</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionGate;

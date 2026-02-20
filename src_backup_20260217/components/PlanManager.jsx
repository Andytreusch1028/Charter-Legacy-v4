import React from 'react';
import { 
    usePermissions, 
    PLAN_TIERS 
} from '../hooks/usePermissions.jsx';
import { 
    Check, 
    X, 
    Shield, 
    Star, 
    Lock 
} from 'lucide-react';

const PLAN_DETAILS = {
    [PLAN_TIERS.FOUNDER]: { 
        name: 'Founder', 
        price: '$0/mo', 
        color: 'text-gray-400', 
        role: 'Basic Protection' 
    },
    [PLAN_TIERS.SHIELD]: { 
        name: 'Shield', 
        price: '$49/mo', 
        color: 'text-blue-400', 
        role: 'Business Defense' 
    },
    [PLAN_TIERS.LEGACY]: { 
        name: 'Legacy', 
        price: '$199/mo', 
        color: 'text-[#d4af37]', 
        role: 'Full Sovereignty' 
    }
};

const PlanManager = () => {
    const { 
        currentTier, 
        upgradeTier, 
        isUpgradeModalOpen, 
        setIsUpgradeModalOpen 
    } = usePermissions();
    if (!isUpgradeModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#0f1115] w-full max-w-4xl rounded-[2rem] border border-gray-800 p-8 relative">
                <button 
                    onClick={() => setIsUpgradeModalOpen(false)} 
                    className="absolute top-6 right-6 text-gray-500 hover:text-white"
                >
                    <X size={24} />
                </button>
                <h2 className="text-3xl font-black text-white text-center mb-8 uppercase tracking-tighter">
                    Subscription Protocol
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.values(PLAN_TIERS).map((tierKey) => {
                        const plan = PLAN_DETAILS[tierKey];
                        const isCurrent = currentTier === tierKey;
                        return (
                            <div 
                                key={tierKey} 
                                className={`p-6 rounded-2xl border ${
                                    isCurrent ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 bg-black/40'
                                } flex flex-col`}
                            >
                                <div className="mb-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${plan.color}`}>
                                        {plan.role}
                                    </span>
                                    <h3 className="text-xl font-black text-white mt-1">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-mono">
                                        {plan.price}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => !isCurrent && upgradeTier(tierKey)}
                                    disabled={isCurrent}
                                    className={`mt-auto py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                        isCurrent ? 'bg-gray-800 text-gray-500' : 'bg-white text-black hover:bg-blue-400'
                                    }`}
                                >
                                    {isCurrent ? 'Active' : 'Select Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PlanManager;

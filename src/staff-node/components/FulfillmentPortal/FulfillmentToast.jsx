import React, { useEffect } from 'react';
import { Activity, X } from 'lucide-react';

const FulfillmentToast = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const colors = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-luminous-blue text-white',
        warning: 'bg-amber-500 text-white'
    };

    return (
        <div className={`fixed bottom-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${colors[type] || colors.info}`}>
            <Activity size={18} className="animate-pulse" />
            <p className="text-xs font-black uppercase tracking-widest">{message}</p>
            <button onClick={onDismiss} className="ml-4 opacity-50 hover:opacity-100"><X size={14} /></button>
        </div>
    );
};

export default FulfillmentToast;

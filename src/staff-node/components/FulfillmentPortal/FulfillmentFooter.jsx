import React from 'react';

const FulfillmentFooter = ({ operatorNode, userEmail }) => {
    return (
        <footer className="fixed bottom-0 left-80 right-0 h-10 px-8 border-t border-gray-100 bg-white/50 backdrop-blur-md flex items-center justify-between z-40">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-luminous-ink uppercase tracking-widest">{operatorNode} // CONNECTED</span>
                </div>
                <div className="w-px h-3 bg-gray-200" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Operator: {userEmail?.split('@')[0]}</span>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-[8px] font-medium text-gray-400 italic">Security Layer: AES-256-GCM Encryption Active</p>
            </div>
        </footer>
    );
};

export default FulfillmentFooter;

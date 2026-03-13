import React from 'react';

const ComplianceStatusModal = ({ documentNumber, onClose }) => {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white w-full max-w-xl rounded-[48px] p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 text-left border border-gray-100 transition-all duration-500">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all z-10">✕</button>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Compliance Status</h2>
                    <p className="text-gray-500 font-medium italic">Document {documentNumber}</p>
                    <div className="p-8 bg-[#F5F5F7] rounded-3xl border border-gray-100 text-center">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Component Manifesting</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceStatusModal;

import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export const SentryModals = ({ duplicateModal, dialogModal, setDialogModal }) => {
    return (
        <>
            {/* Duplicate Modal */}
            {duplicateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={duplicateModal.onCancel} />
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="p-3 bg-red-100 rounded-xl"><AlertTriangle size={24} /></div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Duplicate Detected</h3>
                                <p className="text-xs text-red-500 font-bold">SHA-256 Hash Collision</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-sm text-gray-600 font-medium leading-relaxed">This document is identical to one submitted on {new Date(duplicateModal.existing.created_at).toLocaleDateString()}.</p></div>
                        <div className="flex gap-3">
                            <button onClick={duplicateModal.onCancel} className="flex-1 py-3 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200">Cancel</button>
                            <button onClick={duplicateModal.onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20">Forge Ahead</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generic Dialog Modal */}
            {dialogModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDialogModal(null)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2.5 rounded-xl ${dialogModal.isDestructive ? 'bg-red-100 text-red-600' : 'bg-luminous-blue/10 text-luminous-blue'}`}>
                                {dialogModal.isDestructive ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-luminous-ink">{dialogModal.title}</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">{dialogModal.message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDialogModal(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={dialogModal.onConfirm} className={`flex-1 py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${dialogModal.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-luminous-blue hover:bg-hacker-blue shadow-luminous-blue/20'}`}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

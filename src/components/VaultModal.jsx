import React, { useState } from 'react';
import { X, Shield, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, Fingerprint } from 'lucide-react';

const VaultModal = ({ 
    isOpen, 
    onClose, 
    client, 
    vaultItems, 
    onDecrypt, 
    sharingStatus 
}) => {
    const [passphrase, setPassphrase] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [decryptedContent, setDecryptedContent] = useState(null);

    const handleVerify = () => {
        setVerifying(true);
        setTimeout(() => {
            setIsVerified(true);
            setVerifying(false);
        }, 800);
    };

    const handleDecrypt = async () => {
        if (!passphrase) return;
        try {
            // In a real scenario, we'd find the item for this client
            const item = vaultItems[0] || { content: 'Encrypted_Placeholder_Data' };
            const content = await onDecrypt(item.content, passphrase);
            setDecryptedContent(content);
        } catch (err) {
            console.error("Decryption failed", err);
        }
    };

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0A0A0B]/90 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="bg-[#121214] border border-white/5 rounded-[48px] w-full max-w-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">{client.full_name || 'Client'} Vault</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Zero-Knowledge Retrieval Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="p-12 space-y-10">
                    {!isVerified ? (
                        <div className="space-y-8 text-center py-8">
                            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                <Fingerprint size={48} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Identity Check Required</h4>
                                <p className="text-gray-500 text-sm font-medium">Verify your staff credentials to access this vault node.</p>
                            </div>
                            <button 
                                onClick={handleVerify}
                                disabled={verifying}
                                className="w-full bg-[#E5E5E7] hover:bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                            >
                                {verifying ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                             <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 flex items-center gap-4">
                                <CheckCircle2 className="text-green-500" size={18} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Staff Identity Confirmed via Protocol Alpha</p>
                             </div>

                             <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Key</p>
                                <div className="relative">
                                    <input 
                                        type={showPass ? 'text' : 'password'}
                                        value={passphrase}
                                        onChange={(e) => setPassphrase(e.target.value)}
                                        placeholder="Vault Access Key..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 font-bold text-sm outline-none focus:border-white/20 transition-all text-white"
                                    />
                                    <button 
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                             </div>

                             <button 
                                onClick={handleDecrypt}
                                className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                             >
                                <Lock size={16} /> Decrypt Artifacts
                             </button>

                             {sharingStatus && (
                                <div className={`p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300 ${
                                    sharingStatus.includes('Error') || sharingStatus.includes('Alert')
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                }`}>
                                    {sharingStatus}
                                </div>
                             )}

                             {decryptedContent && (
                                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4 animate-in zoom-in-95 duration-500">
                                   <div className="flex items-center justify-between">
                                      <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Decrypted Artifact</p>
                                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg">High-Fidelity</span>
                                   </div>
                                   <p className="text-gray-300 font-medium italic text-base">"{decryptedContent}"</p>
                                </div>
                             )}
                        </div>
                    )}
                </div>

                <div className="bg-black/50 p-6 flex items-center justify-center gap-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        <Shield size={10} /> 
                        <span>End-to-End Encrypted Tunnel</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaultModal;

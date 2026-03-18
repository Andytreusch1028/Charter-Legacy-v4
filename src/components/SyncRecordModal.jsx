import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, X, Loader2, CheckCircle2, Shield, Zap, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SyncRecordModal = ({ isOpen, onClose, sessionId, onComplete }) => {
  const [status, setStatus] = useState('waiting'); // waiting, linked, recording, uploading, complete
  
  // Construct the sync URL (In production this would be a public URL)
  // For local testing, we use the shareable IP/port or a placeholder
  const syncUrl = `${window.location.origin}/mobile-recorder/${sessionId}`;

  useEffect(() => {
    if (!isOpen || !sessionId) return;

    // 1. Initialize session in DB if it doesn't exist
    const initSession = async () => {
      const { data, error } = await supabase
        .from('sync_sessions')
        .upsert({ id: sessionId, status: 'waiting' }, { onConflict: 'id' });
      
      if (error) console.error("Error initializing sync session:", error);
    };

    initSession();

    // 2. Subscribe to Realtime changes for this specific session
    const channel = supabase
      .channel(`sync_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sync_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          const newStatus = payload.new.status;
          setStatus(newStatus);
          
          if (newStatus === 'complete') {
            setTimeout(() => {
              onComplete(payload.new.video_data);
              onClose();
            }, 1500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, sessionId, onClose, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-lg bg-[#1A1A1B] border border-white/10 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                <Smartphone size={20} />
             </div>
             <div>
                <h3 className="text-white font-black uppercase tracking-tight">SyncRecord Bridge</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Mobile Handoff Protocol</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-10">
          
          {status === 'waiting' && (
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#D4AF37]/20 rounded-3xl blur-xl group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white p-6 rounded-3xl">
                  {/* Mock QR Code UI */}
                  <div className="w-48 h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-4 border-2 border-black/5 overflow-hidden">
                     <QrCode size={120} strokeWidth={1} className="text-black" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Scan to Record</h4>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                  Scan this code with your phone camera to start a secure 4K video heritage recording.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/5 w-full justify-center">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                    <Zap size={12} fill="currentColor" />
                    <span>Real-time Sync Active</span>
                 </div>
              </div>
            </div>
          )}

          {status === 'linked' && (
            <div className="flex flex-col items-center gap-8 py-10 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-[#007AFF]/20 rounded-full flex items-center justify-center text-[#007AFF]">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">Phone Linked</h4>
                <p className="text-gray-500 font-medium">Follow instructions on your mobile device...</p>
              </div>
            </div>
          )}

          {(status === 'recording' || status === 'uploading') && (
            <div className="flex flex-col items-center gap-8 py-10 text-center animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-[#FF3B30]/20 rounded-full flex items-center justify-center text-[#FF3B30] animate-pulse">
                   <Video size={48} fill="currentColor" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">
                  {status === 'recording' ? 'Recording Active' : 'Syncing to Vault...'}
                </h4>
                <p className="text-gray-500 font-medium tracking-widest text-[10px] uppercase font-black">
                   Protocol: Encrypted Tunnel 256-Bit
                </p>
              </div>
            </div>
          )}

          {status === 'complete' && (
            <div className="flex flex-col items-center gap-8 py-10 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-[#4CD964]/20 rounded-full flex items-center justify-center text-[#4CD964]">
                <Shield size={48} fill="currentColor" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">Heritage Archived</h4>
                <p className="text-gray-500 font-medium">Video successfully synced and encrypted in vault.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-8 py-6 bg-black/40 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#4CD964] rounded-full animate-pulse" />
              <span>Bridge Secure</span>
           </div>
           <span>Session: {sessionId.substring(0,8)}</span>
        </div>
      </div>
    </div>
  );
};

export default SyncRecordModal;

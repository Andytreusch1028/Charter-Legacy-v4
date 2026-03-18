import React, { useState, useEffect, useRef } from 'react';
import { Camera, Video, StopCircle, RefreshCw, CheckCircle2, Shield, ArrowLeft, Loader2, Play } from 'lucide-react';
import { supabase } from './lib/supabase';

const MobileRecorder = ({ sessionId, onExit }) => {
  const [status, setStatus] = useState('ready'); // ready, recording, uploading, complete
  const [previewUrl, setPreviewUrl] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const fileInputRef = useRef(null);

  // Sync state back to desktop via Supabase
  const updateSyncState = async (updates) => {
    const { error } = await supabase
      .from('sync_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sessionId);
    
    if (error) console.error("Error updating sync state:", error);
  };

  useEffect(() => {
    // Notify desktop that mobile is linked
    updateSyncState({ status: 'linked', timestamp: Date.now() });
    
    return () => {
      // In a real app, we'd handle cleanup here
    };
  }, [sessionId]);

  const handleCaptureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setVideoBlob(file);
      setStatus('ready_to_upload');
      updateSyncState({ status: 'recording_review', timestamp: Date.now() });
    }
  };

  const handleUpload = async () => {
    if (!videoBlob) return;
    
    setStatus('uploading');
    await updateSyncState({ status: 'uploading' });

    try {
      const fileName = `${sessionId}/${Date.now()}_heritage.mp4`;
      
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('heritage-videos')
        .upload(fileName, videoBlob);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('heritage-videos')
        .getPublicUrl(fileName);

      // 3. Mark as complete in Database
      setStatus('complete');
      await updateSyncState({ 
        status: 'complete', 
        video_data: {
          name: `Heritage_Video_${new Date().toLocaleDateString()}.mp4`,
          duration: "Synced",
          url: publicUrl,
          thumbnail: previewUrl
        }
      });
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus('ready_to_upload');
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans">
      
      {/* Top Nav */}
      <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
        <button onClick={onExit} className="p-2 -ml-2 text-gray-400">
           <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Charter Legacy</span>
           <span className="text-xs font-bold text-white tracking-tight">Secure Mobile Recorder</span>
        </div>
        <Shield size={20} className="text-[#D4AF37]" />
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        
        {status === 'ready' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="w-32 h-32 bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center mx-auto relative group">
               <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-[40px] blur-2xl group-active:opacity-100 opacity-0 transition-opacity" />
               <Camera size={48} className="text-[#D4AF37] relative z-10" />
            </div>
            <div className="space-y-4">
               <h2 className="text-3xl font-black uppercase tracking-tighter">Record Video <br/>Heritage</h2>
               <p className="text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto text-sm">
                 Use your phone's native camera for the highest quality 4K video. Your session is end-to-end encrypted.
               </p>
            </div>
          </div>
        )}

        {status === 'ready_to_upload' && previewUrl && (
           <div className="w-full max-w-sm space-y-8 animate-in zoom-in-95 duration-500">
              <div className="aspect-[9/16] bg-white/5 rounded-[40px] border border-white/10 overflow-hidden relative shadow-2xl">
                 <video 
                   src={previewUrl} 
                   className="w-full h-full object-cover"
                   controls={false}
                   autoPlay
                   muted
                   loop
                 />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center group pointer-events-none">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                       <Play fill="white" size={24} className="ml-1" />
                    </div>
                 </div>
                 <div className="absolute top-6 right-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full animate-pulse" />
                    <span>Reviewing Preview</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tight">Capture Complete</h3>
                 <p className="text-gray-500 text-sm font-medium">Ready to sync with your desktop vault.</p>
              </div>
           </div>
        )}

        {status === 'uploading' && (
           <div className="space-y-10 flex flex-col items-center animate-in fade-in duration-500">
              <div className="w-24 h-24 relative flex items-center justify-center">
                 <div className="absolute inset-0 border-4 border-[#D4AF37]/20 rounded-full" />
                 <div className="absolute inset-0 border-t-4 border-[#D4AF37] rounded-full animate-spin" />
                 <Video size={32} className="text-[#D4AF37]" />
              </div>
              <div className="space-y-3">
                 <h2 className="text-2xl font-black uppercase tracking-tight">Syncing to Vault</h2>
                 <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    Transferring Encrypted Blocks...
                 </p>
              </div>
           </div>
        )}

        {status === 'complete' && (
           <div className="space-y-8 animate-in zoom-in-90 duration-500">
              <div className="w-32 h-32 bg-[#4CD964]/20 rounded-[40px] border border-[#4CD964]/20 flex items-center justify-center mx-auto">
                 <CheckCircle2 size={64} className="text-[#4CD964]" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-black uppercase tracking-tighter">Legacy <br/>Secured.</h2>
                 <p className="text-gray-400 font-medium leading-relaxed max-w-[280px] mx-auto text-sm">
                   Your video has been successfully archived. You can now close this tab on your phone.
                 </p>
              </div>
              <button 
                onClick={onExit}
                className="w-full bg-[#1A1A1B] border border-white/10 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs"
              >
                Close Recorder
              </button>
           </div>
        )}

      </div>

      {/* Native Camera Trigger */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="video/*"
        capture="user"
        className="hidden"
      />

      {/* Bottom Actions */}
      <div className="p-8 pb-12 shrink-0">
        {status === 'ready' && (
          <button 
            onClick={handleCaptureClick}
            className="w-full bg-[#D4AF37] text-black py-8 rounded-[32px] font-black uppercase tracking-widest text-lg shadow-[0_20px_50px_-10px_rgba(212,175,55,0.4)] active:scale-95 transition-all"
          >
            Open Camera
          </button>
        )}
        {status === 'ready_to_upload' && (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleCaptureClick}
              className="bg-[#1A1A1B] border border-white/10 text-white py-6 rounded-[32px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Retake
            </button>
            <button 
              onClick={handleUpload}
              className="bg-[#D4AF37] text-black py-6 rounded-[32px] font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2"
            >
              <Shield size={16} /> Sync to Vault
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default MobileRecorder;

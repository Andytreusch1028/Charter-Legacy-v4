import React, { useState, useEffect, useCallback } from 'react';
import { Shield, X, AlertCircle, CheckCircle2, Info, HelpCircle, Lock } from 'lucide-react';

const ZenithDialog = () => {
  const [dialogs, setDialogs] = useState([]);

  const addDialog = useCallback((config) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setDialogs(prev => [...prev, { ...config, id }]);
    return id;
  }, []);

  const removeDialog = useCallback((id) => {
    setDialogs(prev => prev.filter(d => d.id !== id));
  }, []);

  useEffect(() => {
    // Override window.alert
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    const originalPrompt = window.prompt;

    window.alert = (message) => {
      addDialog({
        type: 'alert',
        title: 'System Notification',
        message,
        onClose: () => {}
      });
    };

    // Override window.confirm
    window.confirm = (message) => {
      addDialog({
        type: 'confirm',
        title: 'Security Confirmation',
        message,
        onConfirm: () => {},
        onCancel: () => {}
      });
      return true; // Return true as default to not block logic unexpectedly
    };

    // Override window.prompt
    window.prompt = (message, defaultValue) => {
      addDialog({
        type: 'prompt',
        title: 'Input Required',
        message,
        defaultValue,
        onConfirm: (val) => { console.log("Prompt val:", val); }
      });
      return defaultValue || ""; // Return default as safe value
    };

    return () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
      window.prompt = originalPrompt;
    };
  }, [addDialog]);

  // Expose a global method for async confirms/alerts
  useEffect(() => {
    window.zenith = {
      alert: (message, title = 'Notification') => {
        return new Promise(resolve => {
          addDialog({
            type: 'alert',
            title,
            message,
            onClose: resolve
          });
        });
      },
      confirm: (message, title = 'Confirmation') => {
        return new Promise(resolve => {
          addDialog({
            type: 'confirm',
            title,
            message,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          });
        });
      },
      prompt: (message, defaultValue = '', title = 'Input Required') => {
        return new Promise(resolve => {
          addDialog({
            type: 'prompt',
            title,
            message,
            defaultValue,
            onConfirm: (val) => resolve(val),
            onCancel: () => resolve(null)
          });
        });
      }
    };
  }, [addDialog]);

  if (dialogs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-end md:justify-center p-4 pointer-events-none">
      <div className="space-y-4 w-full max-w-sm pointer-events-auto">
        {dialogs.map((dialog) => (
          <DialogItem 
            key={dialog.id} 
            dialog={dialog} 
            onClose={() => removeDialog(dialog.id)} 
          />
        ))}
      </div>
    </div>
  );
};

const DialogItem = ({ dialog, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const [inputValue, setInputValue] = useState(dialog.defaultValue || '');
  
  useEffect(() => {
    setIsVisible(true);
    if (dialog.type === 'alert' && !dialog.persistent) {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [dialog]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
        onClose();
        if (dialog.onClose) dialog.onClose();
    }, 300);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => {
        onClose();
        if (dialog.onConfirm) dialog.onConfirm(dialog.type === 'prompt' ? inputValue : true);
    }, 300);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => {
        onClose();
        if (dialog.onCancel) dialog.onCancel();
    }, 300);
  };

  const icons = {
    alert: <Info className="text-[#d4af37]" size={20} />,
    confirm: <HelpCircle className="text-[#d4af37]" size={20} />,
    prompt: <Lock className="text-[#d4af37]" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    success: <CheckCircle2 className="text-green-500" size={20} />,
  };

  return (
    <div 
      className={`bg-[#0A0A0B] border border-[#d4af37]/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
            {icons[dialog.type] || icons.alert}
          </div>
          <div className="flex-1">
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-1">{dialog.title}</h4>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              {dialog.message}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-600 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        
        {(dialog.type === 'confirm' || dialog.type === 'prompt') && (
          <div className="space-y-4 mt-6">
            {dialog.type === 'prompt' && (
              <input 
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                className="w-full bg-[#1c1c1e] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-[#d4af37] outline-none transition-all"
                placeholder="Enter value..."
              />
            )}
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="flex-1 py-3 bg-gray-900 text-gray-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all border border-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 bg-[#d4af37] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg"
              >
                {dialog.type === 'prompt' ? 'Submit' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="h-1 bg-gradient-to-r from-[#d4af37] to-transparent w-full opacity-20"></div>
    </div>
  );
};

export default ZenithDialog;

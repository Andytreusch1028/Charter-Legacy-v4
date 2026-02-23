import React from 'react';
import { Shield, CheckCircle2, FileText, ArrowLeft, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FulfillmentConsole() {
  const handleSignOut = async () => {
    localStorage.removeItem('DEV_ADMIN_BYPASS');
    await supabase.auth.signOut();
    window.location.href = '/staff';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between border-b border-[#2A2A2E] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Fulfillment Command</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">
                Operations & Document Prep
              </p>
            </div>
          </div>
          
          <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-500 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
            <LogOut size={16} /> Disconnect
          </button>
        </header>

        <main className="grid md:grid-cols-3 gap-6">
          
          <div className="col-span-2 space-y-6">
            <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-[#2A2A2E] pb-3 mb-6">Pending Formations</h3>
              
              <div className="space-y-4">
                {[
                  { id: 'ORD-991', entity: 'Apex Logistics LLC', status: 'Awaiting BOI', date: '2 Hours Ago' },
                  { id: 'ORD-842', entity: 'Neon Studio Group', status: 'Awaiting Articles', date: '5 Hours Ago' }
                ].map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-1">{order.entity}</div>
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          <span className="text-blue-500">{order.id}</span>
                          <span>{order.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-black uppercase tracking-widest rounded-md">
                      {order.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 text-center">
               <Shield size={32} className="text-blue-500 mx-auto mb-4 opacity-50" />
               <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Notice</h4>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                 Your role is restricted to document generation and statutory filing tasks. Executive Analytics and AI test controls are disabled.
               </p>
             </div>
          </div>

        </main>

      </div>
    </div>
  );
}

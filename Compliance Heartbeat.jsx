import React, { useState } from 'react';
import { HeartPulse, CheckCircle2, Clock, Zap, RefreshCw, X } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState('monitor');

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex items-end justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600"><HeartPulse size={24} /></div>
              <span className="font-black text-xl uppercase">Charter Legacy</span>
            </div>
            <h1 className="text-5xl font-black uppercase">Compliance Heartbeat.</h1>
          </div>
        </header>

        <section className="bg-white rounded-[60px] p-16 border border-gray-100 shadow-2xl space-y-16">
          <div className="flex justify-between items-center">
            <h3 className="text-4xl font-black uppercase text-red-500">Pending Report</h3>
            <div className="bg-gray-50 p-6 rounded-3xl flex items-center gap-6">
              <div className="text-right"><p className="text-[10px] font-black uppercase">Penalty</p><p className="text-2xl font-black text-red-500">$400.00</p></div>
              <div className="text-left ml-6"><p className="text-[10px] font-black uppercase">Deadline</p><p className="text-2xl font-black uppercase">MAY 1</p></div>
            </div>
          </div>
          <button onClick={() => setStep('success')} className="w-full bg-black text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4">
            <Zap fill="currentColor" /> Defuse & Update
          </button>
        </section>
      </div>
    </div>
  );
}
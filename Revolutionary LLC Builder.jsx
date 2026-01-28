import React, { useState } from 'react';
import { Building2, MapPin, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-12">
      <div className="max-w-2xl mx-auto space-y-12">
        <h1 className="text-5xl font-bold tracking-tight">Think different.</h1>
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 space-y-8">
           <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2"><Building2 /> The Identity</h2>
           <input placeholder="Next Level Hardware" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 outline-none text-xl" />
           <button onClick={() => setStep(2)} className="w-full bg-black text-white rounded-2xl py-5 font-bold text-lg shadow-xl">Confirm Name <ArrowRight className="inline ml-2" /></button>
        </div>
      </div>
    </div>
  );
}
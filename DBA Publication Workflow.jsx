import React from 'react';
import { Newspaper, CheckCircle2, Clock, Timer } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] p-12">
      <div className="max-w-xl mx-auto space-y-12 text-center">
        <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl"><Newspaper size={40} /></div>
        <h1 className="text-4xl font-black uppercase">Tracking Publication.</h1>
        <div className="bg-white rounded-[40px] p-12 border border-gray-100 shadow-2xl text-left space-y-8">
           <div className="flex items-center gap-4"><CheckCircle2 size={20} className="text-green-500"/><p className="font-black text-xs uppercase">Transmission Complete</p></div>
           <div className="flex items-center gap-4"><Clock size={20} className="text-blue-500 animate-pulse"/><p className="font-black text-xs uppercase">Monitoring Press Run</p></div>
           <div className="p-8 bg-blue-600 text-white rounded-[32px] text-center"><Timer size={24} className="mx-auto mb-2"/><p className="text-2xl font-black tabular-nums">04:12:08</p><p className="text-[9px] uppercase">Next Hub Sync</p></div>
        </div>
      </div>
    </div>
  );
}
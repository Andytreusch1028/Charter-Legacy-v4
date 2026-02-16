import React, { useState, useEffect } from 'react';
import { Shield, Activity, Eye, AlertTriangle, FileText, Lock, CheckCircle2, RefreshCw, X } from 'lucide-react';
import SubscriptionGate from './SubscriptionGate';

const AssetSentryTile = () => {
    const [status, setStatus] = useState('SECURE'); // 'SECURE' | 'WARNING' | 'CRITICAL'
    const [creditScore, setCreditScore] = useState(765);
    const [lastScan, setLastScan] = useState('Just now');
    const [monitoringActive, setMonitoringActive] = useState(true);
    const [showDrilldown, setShowDrilldown] = useState(false);

    // Mock Threat Simulation
    const simulateThreat = () => {
        setStatus('CRITICAL');
        setCreditScore(720); // Score drop
    };

    const resolveThreat = () => {
        setStatus('SECURE');
        setCreditScore(765);
    };

    return (
        <SubscriptionGate feature="asset_sentry">
            <div className={`relative overflow-hidden rounded-3xl p-1 transition-all duration-500 ${
                status === 'CRITICAL' 
                    ? 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.5)] animate-pulse' 
                    : 'bg-gradient-to-br from-gray-800 to-black border border-gray-800'
            }`}>
                {/* Inner Card */}
                <div className="bg-[#0f1115] rounded-[22px] h-full p-6 relative overflow-hidden group">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Asset Sentry</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                        {status === 'CRITICAL' ? 'Active Threat Detected' : 'Monitoring Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Pill */}
                        <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                            status === 'CRITICAL' 
                                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                : 'bg-green-500/10 border-green-500/30 text-green-500'
                        }`}>
                            {status === 'CRITICAL' ? 'ACTION REQUIRED' : 'ALL SYSTEMS GO'}
                        </div>
                    </div>

                    {/* Main Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Credit Score Module */}
                        <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Experian Bus. Credit</span>
                            <div className="flex items-end gap-2">
                                <span className={`text-2xl font-black ${status === 'CRITICAL' ? 'text-red-500' : 'text-white'}`}>
                                    {creditScore}
                                </span>
                                <span className="text-[10px] text-gray-500 mb-1">/ 100</span>
                            </div>
                            {status === 'CRITICAL' && (
                                <div className="mt-2 text-[9px] text-red-400 flex items-center gap-1">
                                    <AlertTriangle size={10} /> -45 pts (Inquiry)
                                </div>
                            )}
                        </div>

                        {/* Sunbiz Monitor Module */}
                        <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Sunbiz Identify</span>
                            <div className="flex items-center gap-2 mb-1">
                                {status === 'CRITICAL' ? (
                                    <X size={16} className="text-red-500" />
                                ) : (
                                    <CheckCircle2 size={16} className="text-green-500" />
                                )}
                                <span className="text-white text-xs font-bold">
                                    {status === 'CRITICAL' ? 'Unauthorized Edit' : 'Verified Match'}
                                </span>
                            </div>
                             <div className="text-[9px] text-gray-500">Last check: {lastScan}</div>
                        </div>
                    </div>

                    {/* Threat Action Center (Only Visible on Alert) */}
                    {status === 'CRITICAL' ? (
                        <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                                <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertTriangle size={12} /> Librarian Threat Analysis
                                </h4>
                                <p className="text-gray-300 text-[10px] leading-relaxed mb-3">
                                    A <strong className="text-white">Notice of Change</strong> was filed on Sunbiz by an unknown party on {new Date().toLocaleDateString()}. Concurrently, a hard credit inquiry was detected.
                                </p>
                                <button className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                    <FileText size={14} /> Auto-Draft Letter of Protest
                                </button>
                            </div>
                            <button 
                                onClick={resolveThreat}
                                className="w-full py-2 border border-gray-700 text-gray-500 rounded-lg text-[10px] font-bold uppercase hover:bg-gray-800 hover:text-white transition-all"
                            >
                                Mark As Resolved (Simulation)
                            </button>
                        </div>
                    ) : (
                        /* Safe State Footer */
                        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-blue-500" />
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Real-Time Monitoring Active</span>
                            </div>
                            <button onClick={simulateThreat} className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-gray-600 hover:text-red-500 font-bold uppercase">
                                Simulate Threat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </SubscriptionGate>
    );
};

export default AssetSentryTile;

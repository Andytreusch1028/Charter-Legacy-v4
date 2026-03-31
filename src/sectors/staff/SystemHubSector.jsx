import React, { useState, useEffect } from 'react';
import { Settings, Folder, Shield, Zap, Globe, Database, Cpu, HardDrive, RefreshCw, Lock, Unlock, DatabaseZap, Search } from 'lucide-react';
import { seedTestData } from '../../lib/seeder';
import { PremiumToast } from '../../shared/design-system/UIPrimitives';

const Waveform = ({ active = false, color = 'bg-blue-500' }) => (
    <div className="flex items-end gap-0.5 h-4">
        {[...Array(12)].map((_, i) => (
            <div 
                key={i}
                className={`w-0.5 rounded-full ${color} ${active ? 'animate-ive-waveform' : 'h-[20%]'}`}
                style={{ 
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.3 + (i * 0.05)
                }}
            />
        ))}
    </div>
);

/**
 * SystemHubSector
 * Centralized configuration for Charter Staff Mission Control.
 */
const SystemHubSector = ({ 
    raSettings, 
    updateRaSettings, 
    scannerDirectoryHandle, 
    scannerPermissionStatus, 
    setScannerDirectoryHandle, 
    reconnectScanner,
    fetchStaffRaData,
    systemMetrics
}) => {
    const [sourcePathInput, setSourcePathInput] = useState('');
    const [toast, setToast] = useState(null);
    const [isSeeding, setIsSeeding] = useState(false);

    // Sync settings from database when they load
    useEffect(() => {
        if (raSettings && raSettings['scanner_source_path']) {
            setSourcePathInput(raSettings['scanner_source_path']);
        }
    }, [raSettings]);

    const handleBrowseScannerSource = async () => {
        try {
            if (window.showDirectoryPicker) {
                const directoryHandle = await window.showDirectoryPicker();
                setScannerDirectoryHandle(directoryHandle);
                
                // Use System Bridge to resolve absolute path
                try {
                    const response = await fetch(`/api-internal/resolve-path?name=${encodeURIComponent(directoryHandle.name)}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSourcePathInput(data.path);
                        updateRaSettings('scanner_source_path', data.path);
                        setToast({ 
                            message: `Path Intelligence: Resolved ${directoryHandle.name} to ${data.path}`, 
                            type: 'success' 
                        });
                        return;
                    }
                } catch (apiErr) {
                    console.warn("System Bridge Connectivity Issue:", apiErr);
                }

                // Fallback to directory name if bridge is unavailable
                setSourcePathInput(directoryHandle.name);
                updateRaSettings('scanner_source_path', directoryHandle.name);
                setToast({ 
                    message: `Linked to ${directoryHandle.name}. Note: Automated system path resolution was skipped.`, 
                    type: 'info' 
                });
            } else {
                setToast({ message: "Native Directory Picker is not supported in this browser version.", type: 'warning' });
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("Directory Picker Error:", err);
                setToast({ message: "Internal System Error accessing File Explorer.", type: 'error' });
            }
        }
    };

    const handleRunSeeder = async () => {
        setIsSeeding(true);
        setToast({ message: "Initializing Robust Fleet Seeding...", type: 'info' });
        
        try {
            const result = await seedTestData();
            
            if (result.success) {
                setToast({ message: result.message, type: 'success' });
                if (fetchStaffRaData) fetchStaffRaData();
            } else {
                setToast({ message: `Seeding Error: ${result.message}`, type: 'error' });
            }
        } catch (err) {
            setToast({ message: `Seeding Failed: ${err.message}`, type: 'error' });
        } finally {
            setIsSeeding(false);
        }
    };

    // Hotkey Engine: Context-aware keyboard listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const key = e.key.toLowerCase();
            if (key === 'b') {
                e.preventDefault();
                handleBrowseScannerSource();
            } else if (key === 's') {
                e.preventDefault();
                handleRunSeeder();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scannerDirectoryHandle]); // Re-bind if handle changes to keep browse logic fresh

    return (
        <div className="space-y-12 pb-24 max-w-5xl mx-auto scroller-zen animate-in fade-in duration-700">
            {toast && (
                <PremiumToast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Header Section */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-8 group">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-black shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500">
                        <Settings size={40} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-[-0.05em] mb-2 leading-none">System Hub</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 flex items-center gap-2">
                            Centralized Mission Control Configuration
                            <span className="w-1 h-1 bg-gray-500 rounded-full" />
                            v4.5.3
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md ${systemMetrics?.bridge === 'Connected' ? 'animate-ive-heartbeat' : ''}`}>
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${systemMetrics?.bridge === 'Connected' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${systemMetrics?.bridge === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>
                            System {systemMetrics?.bridge === 'Connected' ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-4 italic">
                        Latency: {systemMetrics?.bridge === 'Connected' ? '14ms' : '---'} (Synced)
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: RA Operations Config */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="ive-glass rounded-[44px] p-10 relative group hover:border-white/20 transition-all duration-700 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
                            <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
                                <Folder size={120} />
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                                    <Folder size={24} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest">Scanner Intake Configuration</h2>
                            </div>

                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed mb-8 max-w-xl opacity-60">
                                Configure the absolute system path for document ingestion. This location is monitored by background automation agents for new scan events.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 block">
                                        Active Intake Source
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 font-mono text-sm text-blue-400 focus-within:border-blue-500/50 transition-all flex items-center justify-between">
                                            <span>{sourcePathInput || 'No path configured...'}</span>
                                            <div className="flex items-center gap-3">
                                                {scannerDirectoryHandle && scannerPermissionStatus !== 'granted' && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 animate-pulse">
                                                        <Shield size={10} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">Access Locked</span>
                                                    </div>
                                                )}
                                                {raSettings?.scanner_locked === 'true' && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20">
                                                        <Lock size={10} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">Locked</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {raSettings?.scanner_locked === 'true' ? (
                                            <button 
                                                onClick={() => updateRaSettings('scanner_locked', 'false')}
                                                className="px-6 py-4 bg-white/5 text-gray-400 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center gap-2"
                                            >
                                                <Unlock size={14} />
                                                Unlock
                                            </button>
                                        ) : scannerDirectoryHandle && scannerPermissionStatus !== 'granted' ? (
                                            <button 
                                                onClick={reconnectScanner}
                                                className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <RefreshCw size={16} className="animate-spin-slow" />
                                                Reconnect Folder
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={handleBrowseScannerSource}
                                                    className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-3 whitespace-nowrap"
                                                >
                                                    <Search size={18} />
                                                    {scannerDirectoryHandle ? 'Change folder' : 'Browse'}
                                                    <span className="opacity-30 text-[10px]">[B]</span>
                                                </button>
                                                {scannerDirectoryHandle && (
                                                    <button 
                                                        onClick={() => updateRaSettings('scanner_locked', 'true')}
                                                        className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
                                                    >
                                                        <Lock size={14} />
                                                        Lock Source
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-500/10 rounded-2xl flex items-start gap-4">
                                    <Zap className="text-blue-500 shrink-0 mt-1" size={18} />
                                    <p className="text-xs text-blue-200/60 font-medium leading-relaxed">
                                        Path Intelligence is active. Selecting a folder via Browse will automatically attempt to resolve the full absolute system path for cross-agent compatibility.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="ive-glass rounded-[44px] p-10 relative group hover:border-white/20 transition-all duration-700 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
                            <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
                                <Database size={120} />
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                                    <Database size={24} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest">Vault Intelligence Configuration</h2>
                                <HelpBadge content="This card is the 'Global SOP Manager' for the RA Operations / Global File Registry page. **What is being filtered?** The state-wide list of all business entities (LLCs) and individuals in our repository. **How it is used**: Normally, operators must manually filter results every time they open the Vault. By selecting a default here, you 'hard-wire' the starting state for all terminals. **Impact**: If the current mission is LLC verification, setting this to 'LLCs Only' ensures the entire team is instantly aligned on the same priority without manual configuration." />
                            </div>

                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed mb-8 max-w-xl opacity-60">
                                Define the default operational logic for the Global File Registry. These settings will be enforced across all Staff Mission Control terminals.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 block">
                                        Default Registry Filter
                                    </label>
                                    <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1.5 w-max shadow-inner shadow-black/40">
                                        {[
                                            { id: 'all', label: 'All Entities' },
                                            { id: 'llc', label: 'LLCs Only' },
                                            { id: 'individual', label: 'Individuals' }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => updateRaSettings('vault_default_filter', f.id)}
                                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${raSettings?.vault_default_filter === f.id ? 'bg-white text-black shadow-2xl' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-purple-500/10 rounded-2xl flex items-start gap-4 border border-purple-500/20">
                                    <Shield className="text-purple-500 shrink-0 mt-1" size={18} />
                                    <div className="space-y-1">
                                        <p className="text-xs text-purple-200 font-bold uppercase tracking-tight">Configuration Locked</p>
                                        <p className="text-[10px] text-purple-200/40 font-medium leading-relaxed">
                                            Registry defaults are synchronized with the central cloud database. Changes are applied instantly to all active operator sessions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="ive-glass rounded-[44px] p-10 relative group hover:border-white/20 transition-all duration-700 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
                            <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
                                <Cpu size={120} />
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                                    <Cpu size={24} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-widest">Execution Capacity Configuration</h2>
                            </div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed mb-8 max-w-xl opacity-60">
                                Define the maximum number of concurrent operator threads and automated fulfillment pipelines the system should allocate resources for.
                            </p>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 block">
                                        Max Operator Threads
                                    </label>
                                    <div className="flex bg-black/40 border border-white/10 rounded-2xl p-2 w-max shadow-inner shadow-black/40 backdrop-blur-sm">
                                        {[4, 8, 16, 32, 64].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => updateRaSettings('max_auth_threads', val.toString())}
                                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ (parseInt(raSettings?.max_auth_threads) || 8) === val ? 'bg-white text-black shadow-2xl' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {val}
                                                <span className="ml-2 opacity-30">[{[4,8,1,3,6]['48136'.indexOf(val.toString()[0]) === -1 ? 0 : '48136'.indexOf(val.toString()[0]) == 2 ? '1' : '48136'.indexOf(val.toString()[0]) === 3 ? '3' : '48136'.indexOf(val.toString()[0]) === 4 ? '6' : '0']}]</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6 bg-green-500/10 rounded-2xl flex items-start gap-4 border border-green-500/20">
                                    <Zap className="text-green-500 shrink-0 mt-1" size={18} />
                                    <div className="space-y-1">
                                        <p className="text-xs text-green-200 font-bold uppercase tracking-tight">Dynamic Scaling Active</p>
                                        <p className="text-[10px] text-green-200/40 font-medium leading-relaxed">
                                            Adjusting these values will instantly re-calculate system-wide progress bars and availability percentages across all Staff Mission Control terminals.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: System Status */}
                <div className="space-y-8">
                    <div className="ive-glass rounded-[44px] p-8 group hover:border-white/20 transition-all duration-700">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8 flex items-center gap-2">
                            <span className="w-3 h-3 bg-white rounded-full flex items-center justify-center text-black">
                                <Shield size={8} />
                            </span>
                            System Health
                        </h3>
                        <div className="space-y-4">
                            <StatusItem 
                                label="Compliance Engine" 
                                status={systemMetrics?.compliance || 'Unknown'} 
                                color={systemMetrics?.compliance === 'Online' ? 'bg-green-500' : 'bg-amber-500'} 
                                tooltip="The 'Auto-Auditor': Scans every document for legal filing errors before humans see it, preventing legal mistakes."
                            />
                            <StatusItem 
                                label="RA Automation" 
                                status={scannerPermissionStatus === 'granted' ? 'Active' : 'Locked'} 
                                color={scannerPermissionStatus === 'granted' ? 'bg-green-500' : 'bg-amber-500'} 
                                tooltip="The 'Mail Sorter': Automatically directs incoming Registered Agent mail to the correct client folders."
                            />
                            <StatusItem 
                                label="OCR Pipeline" 
                                status={systemMetrics?.ocr || 'Offline'} 
                                color={systemMetrics?.ocr === 'Processing' ? 'bg-green-500' : (systemMetrics?.ocr === 'Online' ? 'bg-blue-500' : 'bg-red-500')} 
                                tooltip="The 'Text Reader': Turns scanned photos into searchable text, allowing you to find keywords inside any document."
                            />
                            <StatusItem 
                                label="System Bridge" 
                                status={systemMetrics?.bridge || 'Error'} 
                                color={systemMetrics?.bridge === 'Connected' ? 'bg-green-500' : 'bg-red-500'} 
                                tooltip="The 'Data Link': The secure connection that allows this terminal to save and load data from the cloud repository."
                            />
                        </div>
                    </div>

                    <div className="ive-glass rounded-[44px] p-8 group hover:border-white/20 transition-all duration-700">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8 flex items-center gap-2">
                             <span className="w-3 h-3 bg-white rounded-full flex items-center justify-center text-black">
                                <DatabaseZap size={8} />
                            </span>
                            Resource Allocation
                        </h3>
                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] mb-4 group cursor-help">
                                    <div className="flex items-center gap-2">
                                        <span>OCR Capacity</span>
                                        <HelpBadge content="'Brain Power Availability': Shows how much document processing is left. High % means we're ready for bulk uploads." />
                                    </div>
                                    <Waveform active={systemMetrics?.ocr === 'Processing'} color="bg-blue-500" />
                                    <span className="text-blue-500">{(systemMetrics?.capacity || 0).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ width: `${systemMetrics?.capacity || 0}%` }} />
                                </div>
                            </div>
                             <div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] mb-4 group cursor-help">
                                    <div className="flex items-center gap-2">
                                        <span>Auth Threads</span>
                                        <HelpBadge content="'Active Desks': Shows how many team members or automated tasks are currently signed in and working." />
                                    </div>
                                    <Waveform active={true} color="bg-purple-500" />
                                    <span className="text-purple-500">{systemMetrics?.authThreads || 0}/{systemMetrics?.maxThreads || 0}</span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                                    <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 shadow-[0_0_15px_rgba(168,85,247,0.3)]" style={{ width: `${(systemMetrics?.authThreads && systemMetrics?.maxThreads) ? (systemMetrics.authThreads / systemMetrics.maxThreads) * 100 : 0}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Developer Seeder Card */}
            <div className="ive-glass rounded-[44px] p-10 relative overflow-hidden group hover:border-white/20 transition-all duration-700 mt-12">
                <div className="absolute top-0 right-0 p-8 text-white/[0.03] group-hover:text-white/10 transition-colors">
                    <DatabaseZap size={140} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/5 border border-white/10 text-white rounded-2xl">
                                <DatabaseZap size={24} />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-widest text-white">Developer Fleet Seeder</h2>
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
                            Generate a robust, multi-entity test dataset including new customers, LLC registries, and a linked history of audit logs. This allows you to verify the system's "LLC-Aware" filtering and search capabilities across all sectors.
                        </p>
                    </div>

                    <button 
                        onClick={handleRunSeeder}
                        disabled={isSeeding}
                        className={`px-12 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-3 whitespace-nowrap ${isSeeding ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSeeding ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Synchronizing...
                            </>
                        ) : (
                            <>
                                <Zap size={18} />
                                Sync Robust Test Dataset
                                <span className="opacity-30 text-[10px]">[S]</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * HelpBadge
 * A minimalist interactive badge that reveals an explanation on hover.
 */
const HelpBadge = ({ content }) => {
    return (
        <div className="relative group/badge">
            <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center text-[8px] font-black text-white/40 group-hover/badge:border-white/60 group-hover/badge:text-white transition-all cursor-help">
                ?
            </div>
            
            {/* Tooltip Popup */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[400px] p-4 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/badge:opacity-100 group-hover/badge:translate-y-0 transition-all z-50">
                <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Technical Insight</div>
                <p className="text-[11px] text-gray-300 font-medium leading-relaxed normal-case tracking-normal">
                    {content}
                </p>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </div>
        </div>
    );
};

const StatusItem = ({ label, status, color, tooltip }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 group/item relative">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
            {tooltip && <HelpBadge content={tooltip} />}
        </div>
        <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">{status}</span>
        </div>
    </div>
);

export default SystemHubSector;

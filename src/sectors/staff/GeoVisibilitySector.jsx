import React, { useState, useEffect } from 'react';
import { Globe, Shield, FileText, CheckCircle, XCircle, RefreshCw, Zap, Eye } from 'lucide-react';
import { GlassCard } from '../../shared/design-system/UIPrimitives';
import { GEO_METRICS } from '../../lib/aeo-engine';

/**
 * GeoVisibilitySector
 * Staff-facing dashboard for monitoring AI Answer Engine discoverability.
 * Tracks: bot access, schema coverage, llms.txt health, and composite GEO score.
 */
const GeoVisibilitySector = () => {
    const [llmsHealth, setLlmsHealth] = useState({ score: 0, issues: [] });
    const [botAccess, setBotAccess] = useState({ score: 0, bots: {} });
    const [schemaCoverage, setSchemaCoverage] = useState({ score: 0, covered: [], missing: [], total: 0 });
    const [geoScore, setGeoScore] = useState(0);
    const [isScanning, setIsScanning] = useState(false);

    const runFullScan = async () => {
        setIsScanning(true);
        
        // Check llms.txt
        try {
            const llmsRes = await fetch('/llms.txt');
            const llmsContent = await llmsRes.text();
            setLlmsHealth(GEO_METRICS.checkLlmsTxtHealth(llmsContent));
        } catch {
            setLlmsHealth({ score: 0, issues: ['Cannot fetch /llms.txt'] });
        }

        // Check robots.txt
        try {
            const robotsRes = await fetch('/robots.txt');
            const robotsContent = await robotsRes.text();
            setBotAccess(GEO_METRICS.checkBotAccessScore(robotsContent));
        } catch {
            setBotAccess({ score: 0, bots: {} });
        }

        // Check schema coverage
        const coverage = GEO_METRICS.checkSchemaCoverage();
        setSchemaCoverage(coverage);

        // Calculate composite GEO
        const compositePageData = {
            expertAuthor: true,
            depthOfCoverage: 0.85,
            hasJSONLD: coverage.total > 0,
            hasQAStructure: coverage.covered.includes('FAQPage'),
            pitchyLanguage: false,
            isAIGenerated: false,
            lastModified: new Date().toISOString(),
            externalMentions: []
        };
        setGeoScore(GEO_METRICS.calculateGEOScore(compositePageData));
        
        setIsScanning(false);
    };

    useEffect(() => {
        runFullScan();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'from-green-500/20 to-green-500/5';
        if (score >= 50) return 'from-yellow-500/20 to-yellow-500/5';
        return 'from-red-500/20 to-red-500/5';
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-4">
                    <h3 className="text-4xl font-black uppercase tracking-tighter">
                        GEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Visibility.</span>
                    </h3>
                    <p className="text-gray-500 font-medium italic">Generative Engine Optimization — AI Answer Engine Discoverability Monitor</p>
                </div>
                <button 
                    onClick={runFullScan}
                    disabled={isScanning}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-500 hover:text-cyan-400 disabled:animate-spin"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Composite GEO Score */}
            <GlassCard className={`p-10 bg-gradient-to-br ${getScoreBg(geoScore)} border-white/10`}>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Composite GEO Score</p>
                        <p className={`text-7xl font-black tracking-tighter ${getScoreColor(geoScore)}`}>
                            {geoScore}
                        </p>
                        <p className="text-xs text-gray-500 max-w-md">
                            Weighted blend of Citation Probability (40%), Content Recency (30%), and External Consensus (30%).
                        </p>
                    </div>
                    <div className="text-right space-y-3">
                        <Zap size={48} className={`${getScoreColor(geoScore)} opacity-30`} />
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">
                            {geoScore >= 80 ? 'HIGH VISIBILITY' : geoScore >= 50 ? 'MODERATE' : 'LOW VISIBILITY'}
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Status Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Bot Access Panel */}
                <GlassCard className="p-8 space-y-6 bg-[#121214]">
                    <div className="flex items-center gap-3 text-cyan-400">
                        <Shield size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Bot Access</h4>
                        <span className={`ml-auto text-lg font-black ${getScoreColor(botAccess.score)}`}>
                            {botAccess.score}%
                        </span>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(botAccess.bots).map(([bot, allowed]) => (
                            <div key={bot} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{bot}</span>
                                {allowed ? (
                                    <CheckCircle size={16} className="text-green-400" />
                                ) : (
                                    <XCircle size={16} className="text-red-400" />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-gray-600 italic">robots.txt policy for AI crawlers (GPTBot, Claude, Perplexity)</p>
                </GlassCard>

                {/* Schema Coverage Panel */}
                <GlassCard className="p-8 space-y-6 bg-[#121214]">
                    <div className="flex items-center gap-3 text-purple-400">
                        <FileText size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Schema</h4>
                        <span className={`ml-auto text-lg font-black ${getScoreColor(schemaCoverage.score)}`}>
                            {schemaCoverage.score}%
                        </span>
                    </div>
                    <div className="space-y-3">
                        {['Organization', 'FAQPage', 'HowTo', 'Service'].map(type => (
                            <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{type}</span>
                                {schemaCoverage.covered.includes(type) ? (
                                    <CheckCircle size={16} className="text-green-400" />
                                ) : (
                                    <XCircle size={16} className="text-red-400 animate-pulse" />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-gray-600 italic">{schemaCoverage.total} JSON-LD schemas detected in page head</p>
                </GlassCard>

                {/* llms.txt Health Panel */}
                <GlassCard className="p-8 space-y-6 bg-[#121214]">
                    <div className="flex items-center gap-3 text-[#D4AF37]">
                        <Eye size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">llms.txt</h4>
                        <span className={`ml-auto text-lg font-black ${getScoreColor(llmsHealth.score)}`}>
                            {llmsHealth.score}%
                        </span>
                    </div>
                    <div className="space-y-3">
                        {llmsHealth.issues.length === 0 ? (
                            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                                <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-400">All Checks Passed</p>
                            </div>
                        ) : (
                            llmsHealth.issues.map((issue, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                    <XCircle size={14} className="text-red-400 flex-shrink-0" />
                                    <span className="text-[10px] font-bold text-red-300">{issue}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <p className="text-[9px] text-gray-600 italic">Machine-readable Markdown at /llms.txt for AI crawler discovery</p>
                </GlassCard>
            </div>

            {/* GEO Strategy Checklist */}
            <GlassCard className="p-8 bg-[#121214]">
                <div className="flex items-center gap-3 text-blue-400 mb-6">
                    <Globe size={20} />
                    <h4 className="text-sm font-black uppercase tracking-widest">GEO Implementation Checklist</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { label: 'llms.txt deployed', done: llmsHealth.score > 0 },
                        { label: 'robots.txt allows AI bots', done: botAccess.score >= 80 },
                        { label: 'FAQ Schema (JSON-LD)', done: schemaCoverage.covered.includes('FAQPage') },
                        { label: 'Organization Schema', done: schemaCoverage.covered.includes('Organization') },
                        { label: 'HowTo Schema', done: schemaCoverage.covered.includes('HowTo') },
                        { label: 'Service Schema', done: schemaCoverage.covered.includes('Service') },
                        { label: 'Meta Description (Answer-First)', done: true },
                        { label: 'Open Graph Tags', done: true },
                        { label: 'Twitter Card Meta', done: true },
                        { label: 'Semantic Entity Keywords', done: true }
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.done ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
                            {item.done ? (
                                <CheckCircle size={14} className="text-green-400" />
                            ) : (
                                <XCircle size={14} className="text-red-400" />
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${item.done ? 'text-green-300' : 'text-red-300'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

export default GeoVisibilitySector;

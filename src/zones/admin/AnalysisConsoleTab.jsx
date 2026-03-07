import React, { useState } from 'react';
import { Brain, Activity, Target, Zap, Loader2, Sparkles, Compass, MessageSquare } from 'lucide-react';
import { generateGrowthAnalysis } from '../../lib/localAI';

const AnalysisConsoleTab = ({ activeVariants }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerateAnalysis = async () => {
        if (!activeVariants || activeVariants.length === 0) {
            setError("You need at least one Active A/B test variant to generate an analysis.");
            return;
        }

        setAnalyzing(true);
        setError(null);
        try {
            // Strip out irrelevant Supabase timestamps to save context window tokens
            const simplifiedData = activeVariants.map(v => ({
                headline: v.headline,
                subheading: v.subheading,
                metric_value: v.metric_value,
                metric_score: v.metric_score,
                metric_usability: v.metric_usability,
                metric_draw: v.metric_draw,
            }));
            
            const generatedInsights = await generateGrowthAnalysis(simplifiedData);
            setInsights(generatedInsights);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to generate AI analysis.");
        } finally {
            setAnalyzing(false);
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'observation': return <Activity className="text-blue-400" size={24} />;
            case 'strategy': return <Target className="text-emerald-400" size={24} />;
            case 'forecast': return <Compass className="text-purple-400" size={24} />;
            default: return <Sparkles className="text-amber-400" size={24} />;
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'observation': return 'border-blue-500/20 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
            case 'strategy': return 'border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
            case 'forecast': return 'border-purple-500/20 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
            default: return 'border-gray-500/20 bg-[#1D1D1F]';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-[#1D1D1F] p-8 rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-fuchsia-400 bg-fuchsia-400/10 px-3 py-1.5 rounded-full mb-4">
                            <Brain size={14} /> Local Inference Engine
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">CMO Growth Secretary</h2>
                        <p className="text-gray-400 text-sm mt-2 max-w-xl leading-relaxed">
                            Deploy your local Llama 3 model to ingest your active A/B testing matrix. The AI will cross-reference metric performance and output a raw strategic directive.
                        </p>
                    </div>

                    <button 
                        onClick={handleGenerateAnalysis}
                        disabled={analyzing}
                        className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                        {analyzing ? 'Synthesizing Analytics...' : 'Generate Strategic Directive'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex flex-col justify-center items-center text-center">
                   <p>{error}</p>
                   <p className="text-xs font-medium text-red-500/80 mt-1">Ensure Ollama is running and accessible.</p>
                </div>
            )}

            {!insights && !analyzing && !error && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-[#FBFBFD]">
                    <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mb-6">
                        <MessageSquare className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-gray-400 font-black uppercase tracking-widest text-sm mb-2">No Directive Generated</h3>
                    <p className="text-gray-500 text-xs max-w-sm italic">Click the button above to authorize the AI engine to read your active testing data.</p>
                </div>
            )}

            {insights && (
                 <div className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">
                    {insights.map((insight, idx) => (
                        <div key={idx} className={`p-8 rounded-[32px] border ${getTypeColor(insight.type)} flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500`}>
                            <div className="mb-6 bg-white w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-900/5 shadow-sm">
                                {getTypeIcon(insight.type)}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{insight.type}</span>
                            <h3 className="text-lg font-black text-gray-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{insight.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed italic border-t border-gray-900/10 pt-4">"{insight.content}"</p>
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
};

export default AnalysisConsoleTab;

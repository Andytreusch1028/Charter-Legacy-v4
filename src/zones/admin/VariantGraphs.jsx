import React, { useState } from 'react';
import { BarChart3, Hexagon } from 'lucide-react';

const VariantGraphs = ({ variants }) => {
    const [graphType, setGraphType] = useState('bar'); 
    
    if (!variants || variants.length === 0) return null;

    const metrics = ['metric_value', 'metric_score', 'metric_usability', 'metric_draw'];
    const metricLabels = ['Value', 'Score', 'Usability', 'Draw'];
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B']; // Purple, Blue, Green, Amber
    // We also use a variant color palette for the radar chart shapes
    const variantColors = ['#F43F5E', '#14B8A6', '#EC4899', '#6366F1', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

    // SVG parameters for radar chart
    const size = 300;
    const center = size / 2;
    const radius = size / 2 - 40;
    const angleStep = (Math.PI * 2) / metrics.length;
    
    const getPoint = (value, index) => {
        const r = (value / 100) * radius;
        const angle = index * angleStep - Math.PI / 2;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    };

    return (
        <div className="bg-[#1D1D1F] p-8 rounded-3xl mb-12 relative border border-white/5 shadow-2xl overflow-hidden mt-6">
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                    <h3 className="text-white font-black lg:text-lg uppercase tracking-widest flex items-center gap-3">
                        <BarChart3 size={20} className="text-indigo-400" /> AI Geometric Performance Matrix
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 italic">Comparative analysis based on true AI-driven 0-100 metric grading.</p>
                </div>
                <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/10 shadow-inner">
                    <button 
                        onClick={() => setGraphType('bar')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${graphType === 'bar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Bar Chart
                    </button>
                    <button 
                        onClick={() => setGraphType('radar')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${graphType === 'radar' ? 'bg-indigo-500 text-white shadow-lg flex items-center gap-2' : 'text-gray-500 hover:text-white flex items-center gap-2'}`}
                    >
                        Radar Web
                    </button>
                </div>
            </div>

            <div className="relative z-10 flex flex-col justify-center min-h-[350px]">
                {graphType === 'bar' ? (
                    <div className="w-full flex items-end justify-around h-64 border-b-2 border-white/10 pb-4 relative mt-10">
                        {/* Y-axis grid lines mapping 0 to 100 */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-4 opacity-5">
                            {[100, 75, 50, 25, 0].map(tick => (
                                <div key={tick} className="w-full border-t-2 border-white" />
                            ))}
                        </div>

                        {variants.map((v, i) => (
                            <div key={v.id} className="flex flex-col items-center gap-4 relative group">
                                <div className="flex items-end gap-2 h-64 group-hover:opacity-100 opacity-80 transition-opacity">
                                    {metrics.map((m, mIdx) => {
                                        const val = v[m] || 0;
                                        return (
                                            <div key={m} className="relative group/bar flex flex-col items-center justify-end h-full">
                                                <div 
                                                    className="w-5 rounded-t-md transition-all duration-700 ease-out overlay-bar shadow-sm"
                                                    style={{ height: `${val}%`, backgroundColor: colors[mIdx] }}
                                                />
                                                {/* Tooltip */}
                                                <div className="absolute top-0 -translate-y-full opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-[130%] transition-all bg-black px-3 py-1.5 rounded-lg text-xs text-white font-black whitespace-nowrap shadow-2xl z-50 pointer-events-none border border-white/10">
                                                    {metricLabels[mIdx]}: <span style={{color: colors[mIdx]}}>{val}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <span className="text-[11px] text-gray-300 font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]" title={v.variant_code || 'GEN'}>
                                    {v.variant_code || 'GEN'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    // RADAR CHART
                    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-16 mt-4">
                         <svg width={size} height={size} className="overflow-visible">
                            {/* Grid Webs */}
                            {[0.2, 0.4, 0.6, 0.8, 1].map(level => {
                                const points = metrics.map((_, i) => getPoint(level * 100, i)).join(' ');
                                return (
                                    <polygon key={level} points={points} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                                );
                            })}
                            
                            {/* Axis Lines & Labels */}
                            {metrics.map((m, i) => {
                                const endPoint = getPoint(100, i);
                                const labelPoint = getPoint(115, i); // Push slightly further out for text
                                const [lx, ly] = labelPoint.split(',');
                                return (
                                    <g key={m}>
                                        <line x1={center} y1={center} x2={endPoint.split(',')[0]} y2={endPoint.split(',')[1]} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
                                        <text x={lx} y={ly} fill="gray" fontSize="12" fontWeight="900" textAnchor="middle" dominantBaseline="middle" className="uppercase tracking-[0.2em] fill-gray-400">
                                            {metricLabels[i]}
                                        </text>
                                    </g>
                                )
                            })}

                            {/* Data Polygons */}
                            {variants.map((v, i) => {
                                const points = metrics.map((m, mIdx) => getPoint(v[m] || 0, mIdx)).join(' ');
                                const variantColor = variantColors[i % variantColors.length];
                                return (
                                    <g key={v.id} className="group transition-all hover:z-50 cursor-pointer">
                                        <polygon 
                                            points={points} 
                                            fill={variantColor} 
                                            fillOpacity="0.1"
                                            stroke={variantColor}
                                            strokeWidth="3"
                                            className="group-hover:fill-opacity-[0.25] transition-all duration-300"
                                        />
                                        {/* Optional dots connecting vertices */}
                                        {metrics.map((m, mIdx) => {
                                            const [cx, cy] = getPoint(v[m] || 0, mIdx).split(',');
                                            const val = v[m] || 0;
                                            return (
                                                <g key={mIdx}>
                                                    <circle cx={cx} cy={cy} r="4" fill={variantColor} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <text x={Number(cx) + 10} y={Number(cy) - 10} fill={variantColor} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black">{val}</text>
                                                </g>
                                            );
                                        })}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Radar Chart Variant Legend */}
                        <div className="flex flex-col gap-4 min-w-[200px] bg-black/20 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-1">Testing Pool Plotted</h4>
                            {variants.map((v, i) => (
                                <div key={v.id} className="flex items-center gap-4 group">
                                    <div className="w-4 h-4 rounded-full border border-white/20 group-hover:scale-110 transition-transform flex-shrink-0" style={{ backgroundColor: variantColors[i % variantColors.length] }} />
                                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{v.variant_code || 'GEN'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Metric Legend for Bar Chart only */}
            {graphType === 'bar' && (
                <div className="flex justify-center gap-8 mt-10 border-t border-white/5 pt-6 bg-black/10 -mx-8 -mb-8 pb-8">
                    {metricLabels.map((lbl, idx) => (
                        <div key={lbl} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: colors[idx] }} />
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">{lbl}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VariantGraphs;

import { Navigation, Clock } from "lucide-react";
import React from "react";

interface AnalysisPanelProps {
    routeData: any;
    transportMode: string;
    trafficLevel: string;
}

function AnalysisPanel({ routeData, transportMode, trafficLevel }: AnalysisPanelProps) {
    return (
        <div className={`space-y-6 ${routeData ? 'opacity-100 translate-y-0 transition-all duration-500 ease-out' : 'opacity-40 translate-y-2 grayscale blur-[0.5px] transition-all duration-500 ease-out'}`}>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3 before:h-[1px] before:w-8 before:bg-slate-200 after:flex-1 after:h-[1px] after:bg-slate-100">
                Analysis Results
            </h3>

            <div className={`grid grid-cols-2 gap-4 ${routeData ? 'animate-fadeInUp' : ''}`}>
                <div className="glass-panel p-5 rounded-2xl border border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 group relative overflow-hidden active-press">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-125 duration-500"></div>
                    <div className="p-2.5 bg-blue-50 rounded-xl w-fit mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                        <Navigation size={18} className="transition-transform group-hover:rotate-12" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Distance</span>
                    <div className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
                        {routeData ? routeData.distance_km : "0.00"}
                        <span className="text-xs font-bold text-slate-400">KM</span>
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 group relative overflow-hidden active-press">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-125 duration-500"></div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl w-fit mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                        <Clock size={18} className="transition-transform group-hover:scale-110" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Est. Response</span>
                    <div className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
                        {routeData ? routeData.time_min : "0.0"}
                        <span className="text-xs font-bold text-slate-400">MIN</span>
                    </div>
                </div>
            </div>

            {routeData && (
                <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="p-4 glass-dark text-slate-300 text-[11px] rounded-2xl flex gap-4 shadow-xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="w-1.5 h-full bg-blue-500 rounded-full shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <div className="space-y-1.5 relative z-10">
                            <p className="font-bold text-white tracking-wide uppercase text-[10px]">Active Route Protocol</p>
                            <p className="opacity-80 leading-relaxed font-medium">
                                {transportMode.toUpperCase()} optimization active.
                                {transportMode === 'drive' && trafficLevel === 'heavy' ?
                                    <span className="text-red-400 font-bold block mt-1 animate-pulse">⚠️ Priority Traffic Navigation Engaged</span> :
                                    <span className="text-emerald-400 font-bold block mt-1">✓ Standard Clear Passage</span>
                                }
                            </p>
                        </div>
                    </div>

                    {routeData.instructions && routeData.instructions.length > 0 && (
                        <div className="glass-panel rounded-2xl border border-white/50 overflow-hidden shadow-sm transition-all duration-500 hover:shadow-md">
                            <div className="p-4 bg-slate-50/50 border-b border-slate-100/50 font-bold text-[10px] text-slate-400 uppercase tracking-[0.15em] flex justify-between items-center">
                                Detailed Instructions
                                <span className="text-[9px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">{routeData.instructions.length} steps</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {routeData.instructions.map((step: string, idx: number) => (
                                    <div key={idx} className="p-4 border-b border-slate-50/50 text-[11px] text-slate-700 flex gap-4 last:border-0 hover:bg-blue-50/50 transition-colors duration-300 group">
                                        <span className="font-black text-slate-200 group-hover:text-blue-200 transition-colors w-4">{String(idx + 1).padStart(2, '0')}</span>
                                        <span className="font-medium leading-relaxed">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default React.memo(AnalysisPanel);

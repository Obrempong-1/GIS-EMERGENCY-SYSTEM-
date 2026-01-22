import { Navigation, Clock } from "lucide-react";

interface AnalysisPanelProps {
    routeData: any;
    transportMode: string;
    trafficLevel: string;
}

export default function AnalysisPanel({ routeData, transportMode, trafficLevel }: AnalysisPanelProps) {
    return (
        <div className={`transition-all duration-700 ease-out ${routeData ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4 hue-rotate-180 grayscale blur-[1px]'}`}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 before:h-px before:w-4 before:bg-slate-300 after:flex-1 after:h-px after:bg-slate-200">
                Analysis Results
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 group-hover:bg-blue-500/10"></div>
                    <Navigation size={20} className="text-blue-600 mb-3" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Distance</span>
                    <div className="text-3xl font-black text-slate-800 tracking-tight">
                        {routeData ? routeData.distance_km : "0.00"} <span className="text-sm font-medium text-slate-400">km</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 group-hover:bg-emerald-500/10"></div>
                    <Clock size={20} className="text-emerald-600 mb-3" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Est. Response</span>
                    <div className="text-3xl font-black text-slate-800 tracking-tight">
                        {routeData ? routeData.time_min : "0.0"} <span className="text-sm font-medium text-slate-400">min</span>
                    </div>
                </div>
            </div>

            {routeData && (
                <div className="mt-4 space-y-3">
                    <div className="p-4 bg-slate-800 text-slate-300 text-xs rounded-xl flex gap-3 shadow-lg">
                        <div className="w-1 h-full bg-blue-500 rounded-full"></div>
                        <div className="space-y-1">
                            <p className="font-bold text-white">Route Optimized</p>
                            <p className="opacity-80">
                                {transportMode.toUpperCase()} path calculated.
                                {transportMode === 'drive' && trafficLevel === 'heavy' && <span className="text-red-400 block font-bold">⚠️ Heavy Traffic Delays Applied</span>}
                            </p>
                        </div>
                    </div>

                    {routeData.instructions && routeData.instructions.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider">
                                Turn-by-Turn Directions
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {routeData.instructions.map((step: string, idx: number) => (
                                    <div key={idx} className="p-3 border-b border-slate-50 text-xs text-slate-700 flex gap-3 last:border-0 hover:bg-blue-50 transition-colors">
                                        <span className="font-bold text-slate-300">{idx + 1}.</span>
                                        <span>{step}</span>
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

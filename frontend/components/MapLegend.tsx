export default function MapLegend() {
    return (
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 z-[1000] space-y-3 min-w-[160px] animate-in slide-in-from-bottom-4 duration-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Map Legend</p>
            <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 shadow-sm ring-2 ring-blue-100"></span>
                <span className="text-xs font-semibold text-slate-600">Police Unit</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-600 shadow-sm ring-2 ring-red-100"></span>
                <span className="text-xs font-semibold text-slate-600">Medical Center</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 shadow-sm ring-2 ring-yellow-100"></span>
                <span className="text-xs font-semibold text-slate-600">Incident Zone</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500 shadow-sm ring-2 ring-green-100"></span>
                <span className="text-xs font-semibold text-slate-600">Your Location</span>
            </div>
        </div>
    );
}

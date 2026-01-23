export default function MapLegend() {
    return (
        <div className="absolute bottom-12 right-6 md:right-10 bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-xl border border-white/50 z-[1000] space-y-2 md:space-y-3 min-w-[140px] md:min-w-[160px] animate-in slide-in-from-bottom-4 duration-700">
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 md:pb-2 mb-1.5 md:mb-2">Map Legend</p>
            <div className="flex items-center gap-2 md:gap-3">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-sm bg-blue-600 shadow-sm ring-2 ring-blue-100"></span>
                <span className="text-[10px] md:text-xs font-semibold text-slate-600">Police Unit</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-sm bg-red-600 shadow-sm ring-2 ring-red-100"></span>
                <span className="text-[10px] md:text-xs font-semibold text-slate-600">Medical Center</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-sm bg-orange-500 shadow-sm ring-2 ring-orange-100"></span>
                <span className="text-[10px] md:text-xs font-semibold text-slate-600">Fire Station</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-sm bg-amber-400 shadow-sm ring-2 ring-amber-100"></span>
                <span className="text-[10px] md:text-xs font-semibold text-slate-600">Incident Zone</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-sm bg-blue-500 shadow-sm ring-2 ring-blue-100 uppercase animate-pulse"></span>
                <span className="text-[10px] md:text-xs font-semibold text-slate-600">Your Location</span>
            </div>
        </div>
    );
}

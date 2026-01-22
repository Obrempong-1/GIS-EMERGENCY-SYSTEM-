import { ShieldAlert, MapPin, LocateFixed, ChevronRight, Stethoscope, Navigation, AlertTriangle } from "lucide-react";

interface RouteConfigProps {
    locations: any[];
    origin: string;
    setOrigin: (val: string) => void;
    destination: string;
    setDestination: (val: string) => void;
    transportMode: string;
    setTransportMode: (val: string) => void;
    trafficLevel: string;
    setTrafficLevel: (val: string) => void;
    loading: boolean;
    handleRoute: (isSilent: boolean) => void;
    getUserLocation: () => void;
    isWatching: boolean;
    useUserLocation: boolean;
    setUseUserLocation: (val: boolean) => void;
    error: string;
}

export default function RouteConfig({
    locations,
    origin,
    setOrigin,
    destination,
    setDestination,
    transportMode,
    setTransportMode,
    trafficLevel,
    setTrafficLevel,
    loading,
    handleRoute,
    getUserLocation,
    isWatching,
    useUserLocation,
    setUseUserLocation,
    error
}: RouteConfigProps) {

    // Group only 'facility' types for dropdowns
    const facilities = locations.filter(l => l.category === 'facility');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-800">
                <ShieldAlert size={20} className="text-red-600" />
                <h2 className="font-bold text-lg">Route Configuration</h2>
            </div>

            <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-red-100 transition-all">

                <div className="space-y-2 group">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                            <MapPin size={14} className="text-yellow-500" /> Start Location
                        </label>
                        <button
                            onClick={getUserLocation}
                            className={`text-[10px] flex items-center gap-1 font-bold uppercase transition-all ${isWatching
                                ? "text-emerald-500 hover:text-emerald-600 animate-pulse"
                                : "text-blue-600 hover:text-blue-800"
                                }`}
                        >
                            {isWatching ? (
                                <>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span>Live Tracking Active</span>
                                </>
                            ) : (
                                <>
                                    <LocateFixed size={12} /> Use My Location
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            className={`block w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-700 focus:border-red-500 focus:ring-red-500 cursor-pointer hover:bg-white hover:shadow-md transition-all appearance-none outline-none ${useUserLocation ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' : ''}`}
                            value={origin}
                            onChange={(e) => {
                                setOrigin(e.target.value);
                                setUseUserLocation(false);
                            }}
                        >
                            <option value="">Select Start Point...</option>
                            {useUserLocation && <option value="Current Location">📍 Current Location (GPS)</option>}
                            {facilities.map((f, i) => <option key={i} value={f.name}>{f.name} ({f.type})</option>)}
                        </select>
                        <ChevronRight className="absolute right-3 top-3.5 text-slate-400 pointer-events-none w-4 h-4 rotate-90" />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                        <Stethoscope size={14} className="text-red-500" /> Destination Facility
                    </label>
                    <div className="relative">
                        <select
                            className="block w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-700 focus:border-red-500 focus:ring-red-500 cursor-pointer hover:bg-white hover:shadow-md transition-all appearance-none outline-none"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        >
                            <option value="">Select Hospital / Service...</option>
                            {facilities.map((f, i) => <option key={i} value={f.name}>{f.name} ({f.type})</option>)}
                        </select>
                        <ChevronRight className="absolute right-3 top-3.5 text-slate-400 pointer-events-none w-4 h-4 rotate-90" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 bg-slate-50 p-1 rounded-xl flex border border-slate-200">
                        {['drive', 'walk', 'bike'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setTransportMode(m)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${transportMode === m
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {m === 'drive' && <Navigation size={14} />}
                                {m === 'walk' && <MapPin size={14} />}
                                {m === 'bike' && <Navigation size={14} className="rotate-45" />}
                                {m}
                            </button>
                        ))}
                    </div>

                    {transportMode === 'drive' && (
                        <div className="col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-500 uppercase">Heavy Traffic?</span>
                            <button
                                onClick={() => setTrafficLevel(trafficLevel === 'normal' ? 'heavy' : 'normal')}
                                className={`w-10 h-6 rounded-full transition-colors relative ${trafficLevel === 'heavy' ? 'bg-red-500' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${trafficLevel === 'heavy' ? 'translate-x-4' : 'translate-x-0'}`}></span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={() => handleRoute(false)}
                disabled={loading || !origin || !destination}
                className="w-full relative group overflow-hidden rounded-xl bg-slate-900 p-4 transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:shadow-red-500/20 active:scale-[0.98]"
            >
                <div className="relative z-10 flex items-center justify-center gap-2 font-bold text-white tracking-wide">
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>CALCULATING...</span>
                        </>
                    ) : (
                        <>
                            <span>START NAVIGATION</span>
                            <Navigation size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </div>
            </button>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-xs animate-in slide-in-from-top-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}

import { ShieldAlert, MapPin, LocateFixed, ChevronRight, Stethoscope, Navigation, AlertTriangle, ChevronDown, Check, Siren, Target, Car, Zap, Bike } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

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
    locationsLoading?: boolean;
    handleRoute: (isSilent: boolean) => void;
    getUserLocation: () => void;
    isWatching: boolean;
    useUserLocation: boolean;
    setUseUserLocation: (val: boolean) => void;
    error: string;
}

const LocationDropdown = ({
    label,
    icon: Icon,
    value,
    placeholder,
    options,
    onChange,
    loading = false,
    useUserLocationActive = false
}: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div
                    className={`
                        flex items-center w-full rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden p-[1px]
                        ${isOpen ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-200 hover:border-slate-300'}
                        ${loading ? 'opacity-70 pointer-events-none' : ''}
                        ${useUserLocationActive ? 'border-blue-500 ring-4 ring-blue-500/10' : 'bg-slate-50/50'}
                    `}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center flex-1 p-3 bg-white/80 rounded-[15px]">
                        <Icon className={`w-4 h-4 mr-3 transition-colors duration-300 ${isOpen || useUserLocationActive ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className={`text-[13px] font-semibold truncate flex-1 ${value ? 'text-slate-700' : 'text-slate-400'}`}>
                            {value || placeholder}
                        </span>
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin ml-2" />
                        ) : (
                            <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-90 text-blue-500' : ''}`} />
                        )}
                    </div>
                </div>

                <div className={`
                    absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] max-h-60 overflow-hidden transition-all duration-300 origin-top
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                `}>
                    <div className="overflow-y-auto max-h-60 custom-scrollbar p-1.5">
                        {options.map((opt: any, i: number) => (
                            <div
                                key={i}
                                className={`
                                    p-3 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center justify-between group/opt
                                    ${value === opt.name ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}
                                `}
                                onClick={() => {
                                    onChange(opt.name);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="flex items-center">
                                    <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${value === opt.name ? 'bg-blue-500 scale-110' : 'bg-slate-200 group-hover/opt:bg-slate-300'}`} />
                                    {opt.name}
                                </div>
                                <span className="text-[9px] text-slate-300 uppercase font-black opacity-0 group-hover/opt:opacity-100 transition-opacity">{opt.type}</span>
                            </div>
                        ))}
                        {options.length === 0 && <div className="p-8 text-center text-slate-400 italic text-xs">Loading data...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

function RouteConfig({
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
    locationsLoading = false,
    handleRoute,
    getUserLocation,
    isWatching,
    useUserLocation,
    setUseUserLocation,
    error
}: RouteConfigProps) {

    const facilities = locations.filter(l => l.category === 'facility');

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-slate-800">
                <ShieldAlert size={20} className="text-red-600" />
                <h2 className="font-bold text-lg">Route Configuration</h2>
            </div>

            <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-red-100 transition-all">

                <div className="space-y-3">
                    <LocationDropdown
                        label="Start Point"
                        icon={MapPin}
                        value={origin}
                        placeholder="Search start point..."
                        options={facilities}
                        onChange={(val: string) => {
                            setOrigin(val);
                            setUseUserLocation(false);
                        }}
                        loading={locationsLoading}
                        useUserLocationActive={useUserLocation}
                    />

                    <button
                        onClick={getUserLocation}
                        className={`
                            flex items-center gap-2 text-[11px] font-bold px-4 py-2 rounded-xl transition-all active-press
                            ${useUserLocation ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                        `}
                    >
                        <LocateFixed size={14} className={isWatching ? 'animate-pulse' : ''} />
                        {isWatching ? 'Live Tracking Active' : 'Use Current Location'}
                    </button>
                </div>

                <LocationDropdown
                    label="Destination Facility"
                    icon={Target}
                    value={destination}
                    placeholder="Select destination..."
                    options={facilities}
                    onChange={setDestination}
                    loading={locationsLoading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    <div className="space-y-2 flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Transport Mode</label>
                        <div className="flex flex-col flex-1 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <button
                                onClick={() => setTransportMode('drive')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 active-press ${transportMode === 'drive' ? 'bg-white text-blue-600 shadow-md transform scale-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Car size={14} /> Drive
                            </button>
                            <button
                                onClick={() => setTransportMode('walk')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 active-press ${transportMode === 'walk' ? 'bg-white text-emerald-600 shadow-md transform scale-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Zap size={14} /> Walk
                            </button>
                            <button
                                onClick={() => setTransportMode('bike')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 active-press ${transportMode === 'bike' ? 'bg-white text-orange-600 shadow-md transform scale-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Bike size={14} /> Bike
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Traffic Impact</label>
                        <div className="flex flex-col flex-1 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setTrafficLevel('normal')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active-press ${trafficLevel === 'normal' ? 'bg-white text-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Low
                            </button>
                            <button
                                onClick={() => setTrafficLevel('heavy')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active-press ${trafficLevel === 'heavy' ? 'bg-white text-red-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                High
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => handleRoute(false)}
                disabled={loading || !origin || !destination}
                className={`
                    w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl active-press relative overflow-hidden group
                    ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-500/20'}
                    ${!origin || !destination ? 'opacity-50 grayscale' : ''}
                `}
            >
                {loading && <div className="absolute inset-0 animate-shimmer opacity-30"></div>}
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldAlert size={18} className="group-hover:animate-pulse" />}
                {loading ? "Processing Route..." : "Calculate Emergency Response Route"}
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

export default React.memo(RouteConfig);

import { ShieldAlert, MapPin, LocateFixed, ChevronRight, Stethoscope, Navigation, AlertTriangle, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
    onChange,
    options,
    loading,
    placeholder,
    specialOption,
    onSpecialOptionClick
}: {
    label: string,
    icon: any,
    value: string,
    onChange: (val: string) => void,
    options: any[],
    loading: boolean,
    placeholder: string,
    specialOption?: { label: string, icon: any, active: boolean },
    onSpecialOptionClick?: () => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.name === value);
    const displayValue = specialOption?.active ? specialOption.label : (selectedOption ? `${selectedOption.name} (${selectedOption.type})` : value || placeholder);

    return (
        <div className="space-y-2 group" ref={dropdownRef}>
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <Icon size={14} className={label.includes("Start") ? "text-yellow-500" : "text-red-500"} /> {label}
                </label>
                {specialOption && (
                    <button
                        onClick={onSpecialOptionClick}
                        className={`text-[10px] flex items-center gap-1 font-bold uppercase transition-all ${specialOption.active
                            ? "text-emerald-500 hover:text-emerald-600 animate-pulse"
                            : "text-blue-600 hover:text-blue-800"
                            }`}
                    >
                        {specialOption.active ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>Live Tracking</span>
                            </>
                        ) : (
                            <>
                                <specialOption.icon size={12} /> Use My Location
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() => !loading && setIsOpen(!isOpen)}
                    disabled={loading}
                    className={`relative w-full text-left rounded-xl border transition-all duration-200 p-3 text-sm font-semibold flex items-center justify-between
                        ${loading ? "bg-slate-50 border-slate-200 cursor-wait" : "bg-white border-slate-200 hover:border-red-300 hover:shadow-md cursor-pointer"}
                        ${isOpen ? "ring-2 ring-red-100 border-red-500" : ""}
                        ${specialOption?.active ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/50" : ""}
                    `}
                >
                    {loading ? (
                        <div className="flex items-center gap-3 w-full">
                            <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                    ) : (
                        <span className={`truncate ${!value && !specialOption?.active ? "text-slate-400" : "text-slate-700"}`}>
                            {displayValue}
                        </span>
                    )}
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && !loading && (
                    <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                        {specialOption && (
                            <div
                                onClick={() => {
                                    onChange("Current Location");
                                    if (onSpecialOptionClick) onSpecialOptionClick();
                                    setIsOpen(false);
                                }}
                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex items-center justify-between group/item"
                            >
                                <div className="flex items-center gap-2 text-blue-600">
                                    <LocateFixed size={14} />
                                    <span className="font-semibold text-sm">Target Current Location</span>
                                </div>
                                {value === "Current Location" && <Check size={14} className="text-blue-500" />}
                            </div>
                        )}

                        {options.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs">No locations found</div>
                        ) : (
                            options.map((option, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        onChange(option.name);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors
                                        ${value === option.name ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                                    `}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{option.name}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400">{option.type}</span>
                                    </div>
                                    {value === option.name && <Check size={14} className="text-red-500" />}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

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
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-800">
                <ShieldAlert size={20} className="text-red-600" />
                <h2 className="font-bold text-lg">Route Configuration</h2>
            </div>

            <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-red-100 transition-all">

                <LocationDropdown
                    label="Start Location"
                    icon={MapPin}
                    value={origin}
                    onChange={(val) => {
                        setOrigin(val);
                        if (val !== "Current Location") setUseUserLocation(false);
                    }}
                    options={facilities}
                    loading={locationsLoading}
                    placeholder="Select Start Point..."
                    specialOption={{
                        label: "Current Location (GPS)",
                        icon: LocateFixed,
                        active: isWatching || useUserLocation
                    }}
                    onSpecialOptionClick={getUserLocation}
                />

                <LocationDropdown
                    label="Destination Facility"
                    icon={Stethoscope}
                    value={destination}
                    onChange={setDestination}
                    options={facilities}
                    loading={locationsLoading}
                    placeholder="Select Hospital / Service..."
                />

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

import { Siren, X, Search, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SidebarHeaderProps {
    onClose?: () => void;
    locations: any[];
    onLocationSelect: (loc: any) => void;
}

export default function SidebarHeader({ onClose, locations, onLocationSelect }: SidebarHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredLocations = searchQuery.length > 1
        ? locations.filter(loc =>
            loc.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="p-6 bg-slate-900 text-white shadow-md relative shrink-0 flex flex-col gap-6" ref={containerRef}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-[inherit]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white lg:hidden transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            <div className="relative z-10 flex items-center gap-4">
                <div className="p-2.5 bg-red-600 rounded-xl shadow-lg ring-4 ring-red-600/20">
                    <Siren className="text-white h-6 w-6 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight leading-none text-white">KNUST<br /><span className="text-red-500">Response</span></h1>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-[0.2em] mt-1 opacity-80">Emergency GIS System</p>
                </div>
            </div>

            <div className={`relative ${isOpen && searchQuery.length > 1 ? 'z-[100]' : 'z-20'}`}>
                {isOpen && searchQuery.length > 1 && (
                    <div
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[90]"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                <div className="relative z-[100]">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Quickly find facility..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            className={`w-full border rounded-2xl py-3 pl-12 pr-12 text-sm font-medium focus:outline-none transition-all placeholder:text-slate-500 ${isOpen && searchQuery.length > 1
                                ? 'bg-slate-800 border-red-500/50 shadow-2xl text-white ring-4 ring-red-500/10'
                                : 'bg-slate-800/50 border-slate-700/50 text-slate-200 focus:ring-2 focus:ring-red-500/50 focus:bg-slate-800'
                                }`}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setIsOpen(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {isOpen && searchQuery.length > 1 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-700/50">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Results</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>

                            {filteredLocations.length > 0 ? (
                                <div className="p-1.5">
                                    {filteredLocations.map((loc, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                onLocationSelect(loc);
                                                setSearchQuery("");
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 transition-colors text-left group"
                                        >
                                            <div className="p-2 bg-slate-900 rounded-lg text-slate-400 group-hover:text-red-500 transition-colors">
                                                <MapPin size={14} />
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-semibold text-slate-200">{loc.name}</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{loc.type.replace('_', ' ')}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-xs italic">
                                    No facilities found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

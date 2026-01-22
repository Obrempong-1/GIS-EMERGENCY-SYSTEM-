import { Siren } from "lucide-react";

export default function SidebarHeader() {
    return (
        <div className="p-8 bg-slate-900 text-white shadow-md relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-red-600 rounded-xl shadow-lg ring-4 ring-red-600/20">
                    <Siren className="text-white h-8 w-8 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight leading-none">KNUST<br /><span className="text-red-500">Response</span></h1>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] mt-1.5 opacity-80">Emergency GIS System</p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api, RouteResponse } from '@/lib/api';
import { Navigation, MapPin, X } from 'lucide-react';

if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

const hospitalIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}) : null;

const policeIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}) : null;

const incidentIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}) : null;

const fireIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}) : null;

const userIcon = typeof window !== 'undefined' ? new L.DivIcon({
    className: 'pulsing-dot-marker',
    html: `
        <div class="relative flex flex-col items-center">
            <div class="user-pulse"></div>
            <div class="user-dot"></div>
            <span class="mt-5 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-lg border border-white whitespace-nowrap">You</span>
        </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
}) : null;

const center: [number, number] = [6.6745, -1.5716];
const knustBounds: L.LatLngBoundsExpression = [
    [6.6500, -1.6000],
    [6.7200, -1.5200]
];

function MapContent({
    locations,
    routePath,
    activeLocation,
    onUserLocationUpdate,
    loadingRoute,
    handleNavigate,
    routeData,
    setIsNavigating,
    isNavigating,
    setRouteData
}: any) {
    const map = useMap();
    const [zoomLevel, setZoomLevel] = useState(16);

    useEffect(() => {
        if (!map) return;
        const handleZoom = () => setZoomLevel(map.getZoom());
        map.on('zoomend', handleZoom);
        return () => { map.off('zoomend', handleZoom); };
    }, [map]);

    useEffect(() => {
        if (activeLocation && map) {
            map.flyTo([activeLocation.lat, activeLocation.lon], 17, {
                animate: true,
                duration: 2.0,
                easeLinearity: 0.25
            });
        }
    }, [activeLocation, map]);

    const activeRoutePath = routeData?.path || routePath;

    return (
        <>
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Satellite (Hybrid)">
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        maxNativeZoom={19}
                        maxZoom={22}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Street Map">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxNativeZoom={19}
                        maxZoom={22}
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            <ZoomControl position="topright" />

            {locations.map((loc: any, idx: number) => {
                const isUser = loc.type === 'user';
                const isSpecial = ['medical', 'police', 'fire_station', 'incident', 'user'].includes(loc.type);
                const isNavigationActive = activeRoutePath && activeRoutePath.length > 0;
                const showLabel = (zoomLevel >= 17) && !isNavigationActive;

                if (isSpecial) {
                    let icon = new L.Icon.Default();
                    if (loc.type === 'medical' && hospitalIcon) icon = hospitalIcon;
                    else if (loc.type === 'police' && policeIcon) icon = policeIcon;
                    else if (loc.type === 'fire_station' && fireIcon) icon = fireIcon;
                    else if (loc.type === 'incident' && incidentIcon) icon = incidentIcon;
                    else if (loc.type === 'user' && userIcon) icon = userIcon;

                    return (
                        <Marker
                            key={`marker-${idx}-${loc.name}`}
                            position={[loc.lat, loc.lon]}
                            icon={icon}
                            draggable={isUser}
                            eventHandlers={isUser ? {
                                dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    if (onUserLocationUpdate) {
                                        onUserLocationUpdate({ lat: position.lat, lon: position.lng });
                                    }
                                }
                            } : undefined}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[240px]">
                                    <div className="mb-3">
                                        <h3 className="font-bold text-lg leading-tight">{loc.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">
                                            {isUser ? "Your Location" : loc.type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    {!isUser && (
                                        <div className="mb-3 space-y-2 text-sm">
                                            {loc.description && (
                                                <p className="text-gray-700 italic border-l-2 border-blue-500 pl-2 text-xs">
                                                    "{loc.description}"
                                                </p>
                                            )}
                                            {loc.opening_hours && (
                                                <div className="flex items-center gap-2 text-green-700 font-medium bg-green-50 px-2 py-1 rounded-md mb-1">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    {loc.opening_hours}
                                                </div>
                                            )}
                                            {loc.phone && (
                                                <a href={`tel:${loc.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold group bg-blue-50 px-2 py-1 rounded-md">
                                                    <div className="p-1 bg-white rounded-full group-hover:scale-110 transition">📞</div>
                                                    {loc.phone}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-2 text-xs text-gray-400 mb-3 border-t pt-2 border-gray-100">
                                        <span>Lat: {loc.lat.toFixed(4)}</span>
                                        <span>Lon: {loc.lon.toFixed(4)}</span>
                                    </div>
                                    {!isUser && (
                                        <button
                                            className="w-full bg-slate-900 text-white py-2 px-3 rounded-lg text-sm font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
                                            onClick={() => handleNavigate(loc)}
                                            disabled={loadingRoute}
                                        >
                                            {loadingRoute ? 'Calculating...' : (
                                                <>
                                                    <Navigation size={16} />
                                                    Directions Here
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                } else {
                    const facilityIcon = L.divIcon({
                        className: 'bg-transparent',
                        html: `
                        <div class="flex items-center group" style="transform: translate(-50%, -50%);">
                            <div class="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_2px_rgba(0,0,0,0.5)] border border-gray-400 flex-shrink-0 z-10 transition-transform"></div>
                            ${showLabel ? `
                                <span class="ml-1 text-[10px] font-bold text-white whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" 
                                      style="text-shadow: 0 0 2px black;">
                                    ${loc.name}
                                </span>
                            ` : ''}
                        </div>
                    `,
                        iconSize: [0, 0],
                        iconAnchor: [0, 0]
                    });

                    return (
                        <Marker
                            key={`fac-${idx}-${showLabel}-${loc.name}`}
                            position={[loc.lat, loc.lon]}
                            icon={facilityIcon}
                            zIndexOffset={showLabel ? 100 : 0}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[240px]">
                                    <div className="mb-3">
                                        <h3 className="font-bold text-lg leading-tight">{loc.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">{loc.type.replace('_', ' ')}</p>
                                    </div>
                                    {(loc.opening_hours || loc.phone || loc.description) && (
                                        <div className="mb-3 space-y-2 text-sm">
                                            {loc.description && (
                                                <p className="text-gray-700 italic border-l-2 border-blue-500 pl-2 text-xs">
                                                    "{loc.description}"
                                                </p>
                                            )}
                                            {loc.opening_hours && (
                                                <div className="flex items-center gap-2 text-green-700 font-medium bg-green-50 px-2 py-1 rounded-md mb-1">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    {loc.opening_hours}
                                                </div>
                                            )}
                                            {loc.phone && (
                                                <a href={`tel:${loc.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold group bg-blue-50 px-2 py-1 rounded-md">
                                                    <div className="p-1 bg-white rounded-full group-hover:scale-110 transition">📞</div>
                                                    {loc.phone}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-2 text-xs text-gray-400 mb-3 border-t pt-2 border-gray-100">
                                        <span>Lat: {loc.lat.toFixed(4)}</span>
                                        <span>Lon: {loc.lon.toFixed(4)}</span>
                                    </div>
                                    <button
                                        className="w-full bg-slate-900 text-white py-2 px-3 rounded-lg text-sm font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
                                        onClick={() => handleNavigate(loc)}
                                        disabled={loadingRoute}
                                    >
                                        {loadingRoute ? 'Calculating...' : (
                                            <>
                                                <Navigation size={16} />
                                                Directions Here
                                            </>
                                        )}
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }
            })}

            {activeRoutePath && (
                <Polyline
                    positions={activeRoutePath}
                    color="#00ffff"
                    weight={6}
                    opacity={0.8}
                />
            )}

            {
                routeData && isNavigating && (
                    <div className="absolute top-4 left-4 z-[1000] w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 text-2xl font-bold mb-1">
                                    <span className="text-3xl">{routeData.time_min}</span> <span className="text-sm font-normal opacity-90">min</span>
                                </div>
                                <div className="text-sm opacity-90">
                                    {routeData.distance_km} km • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} arrival
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setRouteData(null);
                                    setIsNavigating(false);
                                }}
                                className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto bg-gray-50">
                            {routeData.instructions.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {routeData.instructions.map((inst: any, i: number) => (
                                        <div key={i} className="p-3 flex gap-3 hover:bg-white transition cursor-default">
                                            <div className="mt-1 text-gray-400">
                                                {i === routeData.instructions.length - 1 ? <MapPin size={18} /> : <Navigation size={18} />}
                                            </div>
                                            <div className="text-sm text-gray-700 leading-snug">
                                                {inst}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    Direct route (no turns)
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default function MapComponent({ locations, routePath, activeLocation, onUserLocationUpdate, transportMode = 'drive' }: any) {
    const [mounted, setMounted] = useState(false);
    const [routeData, setRouteData] = useState<RouteResponse | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);

    const userLocation = locations.find((l: any) => l.type === 'user');

    useEffect(() => {
        setMounted(true);
        return () => {
            if (mapRef.current) {
                const container = mapRef.current;
                // @ts-ignore
                if (container._leaflet_id) {
                    // @ts-ignore
                    delete container._leaflet_id;
                }
            }
        };
    }, []);

    const handleNavigate = async (destination: any) => {
        let startLat = userLocation?.lat;
        let startLon = userLocation?.lon;

        if (!startLat || !startLon) {
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    });
                });
                startLat = pos.coords.latitude;
                startLon = pos.coords.longitude;
                if (onUserLocationUpdate) {
                    onUserLocationUpdate({ lat: startLat, lon: startLon });
                }
            } catch (err) {
                console.error("Locating failed", err);
                alert("Could not detect your location. Please enable GPS permissions to use 'Directions Here'.");
                return;
            }
        }

        const MIN_LAT = 6.65, MAX_LAT = 6.72;
        const MIN_LON = -1.60, MAX_LON = -1.52;

        if (startLat < MIN_LAT || startLat > MAX_LAT || startLon < MIN_LON || startLon > MAX_LON) {
            alert("📍 You seem to be outside the KNUST Campus area.\n\nOur navigation system is optimized for campus routes. Please get closer to use this feature!");
            return;
        }

        setLoadingRoute(true);
        try {
            const data = await api.calculateRoute({
                origin_lat: startLat,
                origin_lon: startLon,
                dest_lat: destination.lat,
                dest_lon: destination.lon,
                transport_mode: transportMode,
                mode: 'fastest'
            });
            setRouteData(data);
            setIsNavigating(true);
        } catch (error) {
            console.error("Navigation failed", error);
            alert("Failed to calculate route.");
        } finally {
            setLoadingRoute(false);
        }
    };

    if (!mounted) return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>;

    return (
        <div className="relative h-full w-full" ref={mapRef}>
            <MapContainer
                key="knust-map-v4"
                center={center}
                zoom={16}
                minZoom={15}
                maxZoom={22}
                maxBounds={knustBounds}
                maxBoundsViscosity={1.0}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                zoomControl={false}
                preferCanvas={true}
            >
                <MapContent
                    locations={locations}
                    routePath={routePath}
                    activeLocation={activeLocation}
                    onUserLocationUpdate={onUserLocationUpdate}
                    transportMode={transportMode}
                    loadingRoute={loadingRoute}
                    handleNavigate={handleNavigate}
                    routeData={routeData}
                    setIsNavigating={setIsNavigating}
                    isNavigating={isNavigating}
                    setRouteData={setRouteData}
                />
            </MapContainer>
        </div>
    );
}

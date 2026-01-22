"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "../lib/api";

import SidebarHeader from "../components/sidebar/SidebarHeader";
import RouteConfig from "../components/sidebar/RouteConfig";
import AnalysisPanel from "../components/sidebar/AnalysisPanel";
import CreatorFooter from "../components/sidebar/CreatorFooter";
import MapLegend from "../components/MapLegend";

const MapComponent = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [locations, setLocations] = useState<any[]>([]);
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [transportMode, setTransportMode] = useState<string>("drive");
  const [trafficLevel, setTrafficLevel] = useState<string>("normal");

  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [useUserLocation, setUseUserLocation] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    api.getLocations()
      .then(data => setLocations(data))
      .catch(err => console.error("API Error:", err));

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    if (isWatching) {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setIsWatching(false);
      setWatchId(null);
      return;
    }

    setLoading(true);
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;

        // KNUST Geofence (Approximate)
        const MIN_LAT = 6.65, MAX_LAT = 6.72;
        const MIN_LON = -1.60, MAX_LON = -1.52;

        const isInside = lat >= MIN_LAT && lat <= MAX_LAT && lon >= MIN_LON && lon <= MAX_LON;

        if (!isInside) {
          setError("📍 You seem to be outside the KNUST Campus area. Our navigation system is optimized for campus routes. Please get closer to use Live Tracking!");
          setLoading(false);
          setUseUserLocation(false);
          setOrigin("");
          navigator.geolocation.clearWatch(id);
          setIsWatching(false);
          setWatchId(null);
          return;
        }

        const loc = { lat, lon };
        setUserLocation(loc);
        setUseUserLocation(true);
        setOrigin("Current Location");
        setLoading(false);
        setIsWatching(true);
      },
      (err) => {
        console.error("Geolocation Error Code:", err.code, "Message:", err.message);
        let msg = "Could not retrieve your location.";
        if (err.code === 1) msg = "Location permission denied. Please allow access.";
        if (err.code === 2) msg = "Location unavailable. Check your GPS/network.";
        if (err.code === 3) msg = "Location request timed out. Move outdoors?";

        setError(msg);
        setLoading(false);
        setIsWatching(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    );
    setWatchId(id);
  };

  useEffect(() => {
    if (isWatching && userLocation && destination && !loading) {
      const timeoutId = setTimeout(() => {
        handleRoute(true);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [userLocation, isWatching, destination, transportMode, trafficLevel]);

  const handleRoute = async (isSilent = false) => {
    if (!origin || !destination) return;

    if (!isSilent) {
      setLoading(true);
      setRouteData(null);
    }
    setError("");

    let startLoc;

    if (useUserLocation && userLocation) {
      startLoc = { lat: userLocation.lat, lon: userLocation.lon, name: "Current Location" };
    } else {
      startLoc = locations.find(l => l.name === origin);
    }

    const endLoc = locations.find(l => l.name === destination);

    if (!startLoc || !endLoc) {
      if (!isSilent) setLoading(false);
      return;
    }

    try {
      const data = await api.calculateRoute({
        origin_lat: startLoc.lat,
        origin_lon: startLoc.lon,
        dest_lat: endLoc.lat,
        dest_lon: endLoc.lon,
        mode: "fastest",
        transport_mode: transportMode as any,
        traffic_level: trafficLevel as any
      });
      setRouteData(data);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Network Error: Could not reach routing server.";
      if (!isSilent) setError(msg);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const mapLocations = [...locations];
  if (userLocation) {
    mapLocations.push({
      name: "Current Location",
      type: "user",
      lat: userLocation.lat,
      lon: userLocation.lon,
      category: "user"
    });
  }

  return (
    <main className="flex h-screen w-full bg-slate-100 relative overflow-hidden font-sans text-slate-900">

      <aside className="w-[400px] bg-white shadow-2xl z-30 flex flex-col border-r border-slate-200 h-full">

        <SidebarHeader />

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gradient-to-b from-white to-slate-50">

          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-4">
            <span>System Status</span>
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </span>
          </div>

          <RouteConfig
            locations={locations}
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            transportMode={transportMode}
            setTransportMode={setTransportMode}
            trafficLevel={trafficLevel}
            setTrafficLevel={setTrafficLevel}
            loading={loading}
            handleRoute={handleRoute}
            getUserLocation={getUserLocation}
            isWatching={isWatching}
            useUserLocation={useUserLocation}
            setUseUserLocation={setUseUserLocation}
            error={error}
          />

          <AnalysisPanel
            routeData={routeData}
            transportMode={transportMode}
            trafficLevel={trafficLevel}
          />

        </div>

        <CreatorFooter />
      </aside>

      <div className="flex-1 relative h-full bg-slate-200">
        <MapComponent
          locations={mapLocations}
          routePath={routeData?.path}
          activeLocation={locations.find(l => l.name === destination) || ((useUserLocation && userLocation) ? { lat: userLocation.lat, lon: userLocation.lon } : null)}
          onUserLocationUpdate={(newLoc: { lat: number, lon: number }) => {
            console.log("User updated location manually:", newLoc);
            setUserLocation(newLoc);
            setUseUserLocation(true);
          }}
          transportMode={transportMode}
        />

        <MapLegend />
      </div>

    </main>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import dynamic from "next/dynamic";
import { api } from "../lib/api";

import SidebarHeader from "../components/sidebar/SidebarHeader";
import RouteConfig from "../components/sidebar/RouteConfig";
import AnalysisPanel from "../components/sidebar/AnalysisPanel";
import CreatorFooter from "../components/sidebar/CreatorFooter";
import MapLegend from "../components/MapLegend";
import { Menu, X } from "lucide-react";

const MapComponent = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [locations, setLocations] = useState<any[]>([]);
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true); // New state for initial data fetch
  const [error, setError] = useState("");

  const [transportMode, setTransportMode] = useState<string>("drive");
  const [trafficLevel, setTrafficLevel] = useState<string>("normal");

  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [useUserLocation, setUseUserLocation] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    api.getLocations()
      .then(data => {
        setLocations(data);
        setLocationsLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setLocationsLoading(false);
      });

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

  const mapLocations = React.useMemo(() => {
    const locs = [...locations];
    if (userLocation) {
      locs.push({
        name: "Current Location",
        type: "user",
        lat: userLocation.lat,
        lon: userLocation.lon,
        category: "user"
      });
    }
    return locs;
  }, [locations, userLocation]);

  return (
    <main className="flex h-screen w-full bg-slate-100 relative overflow-hidden font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-3 bg-slate-900 text-white rounded-2xl shadow-2xl lg:hidden hover:bg-slate-800 active:scale-95 transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      <aside className={`
        fixed inset-y-0 left-0 w-full max-w-[340px] lg:max-w-[400px] bg-white shadow-[30px_0_70px_rgba(0,0,0,0.08)] z-50 flex flex-col border-r border-slate-200 h-full transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>

        <SidebarHeader
          locations={locations}
          onLocationSelect={(loc) => {
            setDestination(loc.name);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-gradient-to-b from-white to-slate-50">

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
            locationsLoading={locationsLoading} 
            handleRoute={() => {
              handleRoute();
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
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

        <div className={isSidebarOpen ? "hidden lg:block" : "block"}>
          <MapLegend />
        </div>
      </div>

    </main>
  );
}

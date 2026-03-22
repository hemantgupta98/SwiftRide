"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
  },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

type EarningsEntry = {
  id: string;
  date: string;
  amount: number;
  distanceKm: number;
  durationMinutes: number;
};

const EARNINGS_STORAGE_KEY = "rider_earnings_history";

const riderMarkerIcon = divIcon({
  html: '<span style="display:block;width:18px;height:18px;background:#22c55e;border:3px solid #ffffff;border-radius:9999px;box-shadow:0 0 0 2px #15803d;"></span>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function Dashboard() {
  const [online, setOnline] = useState(false);
  const [liveCoords, setLiveCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [earningsHistory, setEarningsHistory] = useState<EarningsEntry[]>([]);
  const watchIdRef = useRef<number | null>(null);

  const mapCenter = useMemo<[number, number]>(
    () => liveCoords ?? [23.3441, 85.3096],
    [liveCoords],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadEarnings = () => {
      try {
        const rawData = localStorage.getItem(EARNINGS_STORAGE_KEY);
        const parsedData = rawData ? JSON.parse(rawData) : [];
        setEarningsHistory(Array.isArray(parsedData) ? parsedData : []);
      } catch {
        setEarningsHistory([]);
      }
    };

    loadEarnings();
    window.addEventListener("storage", loadEarnings);

    return () => {
      window.removeEventListener("storage", loadEarnings);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stopTracking = () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      setLiveCoords(null);
      setIsLocating(false);
    };

    if (!online) {
      stopTracking();
      return;
    }

    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationError("Geolocation is not supported by your browser.");
      setOnline(false);
      return;
    }

    setLocationError("");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLiveCoords([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        setLocationError("Unable to fetch current location.");
        setIsLocating(false);
        setOnline(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLiveCoords([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        setLocationError(
          "Live tracking stopped. Please try going online again.",
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      },
    );

    return () => {
      stopTracking();
    };
  }, [online]);

  return (
    <div className="min-h-screen bg-[#0c2d4a] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/5 p-4">
          <div>
            <p className="text-sm text-gray-300">Rider availability</p>
            <p className="font-semibold">
              Current Status: {online ? "Online" : "Offline"}
            </p>
          </div>

          <button
            onClick={() => setOnline((previous) => !previous)}
            className={`relative min-w-44 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              online
                ? "bg-green-500 text-white shadow-lg shadow-green-900/30"
                : "bg-gray-600 text-white"
            }`}
          >
            <span
              className={`absolute top-1 h-7 w-7 rounded-full bg-white transition-all duration-300 ${
                online ? "right-1" : "left-1"
              }`}
            />
            <span className="relative z-10">
              {online ? "Go Offline" : "Go Online"}
            </span>
          </button>
        </div>

        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-6">
            <p className="text-green-400 bg-green-900/40 inline-block px-4 py-1 rounded-full text-sm">
              New Bonus Available: +$5.00 per ride in Downtown
            </p>

            <h1 className="text-5xl font-bold">
              Earn with <span className="text-green-400">SwiftRide.</span>
            </h1>

            <p className="text-gray-300 max-w-lg">
              Go online and start accepting rides instantly. You&apos;re in
              control of your schedule and your earnings.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setOnline(true)}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold"
              >
                Go Online Now
              </button>

              <button className="border border-gray-400 px-6 py-3 rounded-lg">
                View Promotions →
              </button>
            </div>

            <p className="text-sm text-gray-400">
              Join{" "}
              <span className="text-white font-semibold">1,200+ drivers</span>{" "}
              online in your city.
            </p>
          </div>

          {/* STATUS CARD */}
          <div className="bg-white text-gray-800 rounded-2xl p-8 shadow-lg text-center">
            <div className="text-5xl mb-4">🚗</div>

            <h2 className="text-xl font-semibold mb-2">
              {online ? "You are Online" : "You are Offline"}
            </h2>

            <p className="text-gray-500 mb-6">
              Connect to the network to start receiving ride requests in your
              area.
            </p>

            <button
              onClick={() => setOnline(!online)}
              className="bg-green-500 text-white w-full py-3 rounded-lg font-semibold"
            >
              {online ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>

        {/* PERFORMANCE */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Today&apos;s Performance</h2>
          <p className="text-green-400 cursor-pointer">Detailed Stats →</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Today's Earnings" value="$142.50" icon="💰" />

          <StatCard title="Total Rides" value="12" icon="🚘" />

          <StatCard title="Hours Online" value="6.5h" icon="⏰" />

          <StatCard title="Rider Rating" value="4.95" icon="⭐" />
        </div>

        {/* MAP + SIDE CARDS */}

        {/* MOBILE DASHBOARD */}
        <div className="lg:hidden space-y-6">
          <h2 className="text-lg font-semibold">Start Earning</h2>

          <div className="bg-white text-gray-800 rounded-xl p-6 text-center">
            <h3 className="font-semibold mb-2">
              {online ? "Online Mode Active" : "You are currently Offline"}
            </h3>

            <button
              onClick={() => setOnline(!online)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg mt-4"
            >
              {online ? "Go Offline" : "Go Online"}
            </button>
          </div>

          {/* Mobile Map */}

          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Today's Pay" value="$142.80" icon="💰" />
            <StatCard title="Rides" value="12" icon="🚗" />
            <StatCard title="Online" value="5.2h" icon="⏱" />
            <StatCard title="Rating" value="4.95" icon="⭐" />
          </div>

          <div className="bg-green-900/40 text-green-300 rounded-xl p-4">
            Downtown rides have a <b>1.5x multiplier</b>. Head there for maximum
            earnings!
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 md:p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Live Location Map
            </h2>
            {isLocating && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Fetching location...
              </span>
            )}
          </div>

          <div className="relative h-90 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {online && liveCoords ? (
              <MapContainer
                key={`${liveCoords[0]}-${liveCoords[1]}`}
                center={mapCenter}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="© OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={liveCoords} icon={riderMarkerIcon}>
                  <Popup>You are here</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-lg font-medium text-gray-600">
                  Go online to earn more money
                </p>
              </div>
            )}

            {locationError && (
              <div className="absolute left-3 top-3 rounded-md bg-red-100 px-3 py-2 text-xs text-red-700 shadow">
                {locationError}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 md:p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900">
            Earnings History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Completed rides and your earnings summary.
          </p>

          {earningsHistory.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-lg font-semibold text-gray-700">
                No earnings yet
              </p>
              <p className="text-sm text-gray-500">
                Start riding to earn money
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="border-b text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-2 py-3">Date</th>
                    <th className="px-2 py-3">Amount</th>
                    <th className="px-2 py-3">Distance</th>
                    <th className="px-2 py-3">Duration</th>
                  </tr>
                </thead>

                <tbody>
                  {earningsHistory.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-none">
                      <td className="px-2 py-3">{entry.date}</td>
                      <td className="px-2 py-3 font-semibold text-green-600">
                        ₹{entry.amount.toFixed(2)}
                      </td>
                      <td className="px-2 py-3">
                        {entry.distanceKm.toFixed(2)} km
                      </td>
                      <td className="px-2 py-3">{entry.durationMinutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white text-gray-800 rounded-xl p-5 flex flex-col gap-2 shadow">
      <div className="text-2xl">{icon}</div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function AlertCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white text-gray-800 rounded-xl p-4 shadow">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

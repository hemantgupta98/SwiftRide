"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Download, Calendar, MapPin } from "lucide-react";
import { getEarningsStorageKey, getRiderId } from "@/lib/userStorage";

type EarningsEntry = {
  id: string;
  date: string;
  amount: number;
  distanceKm: number;
  durationMinutes: number;
  startedAt?: string;
};

type DisplayRide = {
  id: string;
  status: "Completed";
  date: string;
  pickup: string;
  drop: string;
  distance: string;
  duration: string;
  earnings: string;
};

export default function RideHistoryPage() {
  const [earningsHistory, setEarningsHistory] = useState<EarningsEntry[]>([]);
  const [search, setSearch] = useState("");
  const riderId = useMemo(() => getRiderId(), []);

  useEffect(() => {
    if (typeof window === "undefined" || !riderId) {
      return;
    }

    const loadEarnings = () => {
      try {
        const storageKey = getEarningsStorageKey(riderId);
        const rawData = localStorage.getItem(storageKey);
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
  }, [riderId]);

  const displayRides: DisplayRide[] = earningsHistory.map((entry) => ({
    id: `#SR-${entry.id.slice(0, 4).toUpperCase()}`,
    status: "Completed" as const,
    date: entry.date,
    pickup: "Pickup Location",
    drop: "Drop-off Destination",
    distance: `${entry.distanceKm.toFixed(2)} km`,
    duration: `${entry.durationMinutes} mins`,
    earnings: `₹${entry.amount.toFixed(2)}`,
  }));

  const totalRides = earningsHistory.length;
  const totalEarnings = earningsHistory.reduce(
    (sum, entry) => sum + (Number.isFinite(entry.amount) ? entry.amount : 0),
    0,
  );
  const totalDistance = earningsHistory.reduce(
    (sum, entry) =>
      sum + (Number.isFinite(entry.distanceKm) ? entry.distanceKm : 0),
    0,
  );

  const filteredRides = displayRides.filter(
    (ride) =>
      ride.id.toLowerCase().includes(search.toLowerCase()) ||
      ride.pickup.toLowerCase().includes(search.toLowerCase()) ||
      ride.drop.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0B2A4A] text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ride History</h1>
          <p className="text-gray-400 text-sm">
            Review your past trips and earnings summary.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-400 text-blue-300 hover:bg-blue-500/10">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-black font-medium">
            <Calendar size={16} /> Date Range
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#123B63] rounded-xl p-4 shadow-md">
          <p className="text-sm text-gray-400">Total Rides</p>
          <h2 className="text-xl font-semibold mt-2">{totalRides}</h2>
        </div>
        <div className="bg-[#123B63] rounded-xl p-4 shadow-md">
          <p className="text-sm text-gray-400">Total Earnings</p>
          <h2 className="text-xl font-semibold mt-2">
            ₹{totalEarnings.toFixed(2)}
          </h2>
        </div>
        <div className="bg-[#123B63] rounded-xl p-4 shadow-md">
          <p className="text-sm text-gray-400">Distance Covered</p>
          <h2 className="text-xl font-semibold mt-2">
            {totalDistance.toFixed(2)} km
          </h2>
        </div>
        <div className="bg-[#123B63] rounded-xl p-4 shadow-md">
          <p className="text-sm text-gray-400">Avg. Rating</p>
          <h2 className="text-xl font-semibold mt-2">4.95</h2>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-3 flex items-center gap-3 mb-6">
        <Search className="text-gray-500" />
        <input
          type="text"
          placeholder="Search by passenger, route, or ride ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-black"
        />
        <button className="px-4 py-2 bg-gray-200 rounded-lg text-black text-sm">
          All Status
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded-lg text-black text-sm">
          Last 30 Days
        </button>
      </div>

      {/* Ride List */}
      {filteredRides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#123B63] rounded-xl">
          <MapPin size={48} className="text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {earningsHistory.length === 0
              ? "No Rides Yet"
              : "No Matching Rides"}
          </h3>
          <p className="text-gray-400 text-center max-w-sm">
            {earningsHistory.length === 0
              ? "You haven't completed any rides yet. Start accepting rides to see your history here."
              : "No rides match your search. Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRides.map((ride) => (
            <div
              key={ride.id}
              className="bg-white text-black rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      ride.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {ride.status}
                  </span>
                  <span className="text-sm text-gray-500">{ride.id}</span>
                </div>

                <p className="text-xs text-gray-400 mb-2">{ride.date}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-green-500" />
                    <p className="text-sm">{ride.pickup}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    <p className="text-sm">{ride.drop}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between items-end">
                <div className="text-right">
                  <p className="text-lg font-semibold">{ride.earnings}</p>
                  <p className="text-xs text-gray-500">Net Earnings</p>
                </div>

                <div className="text-right text-sm text-gray-600 mt-2">
                  <p>Distance: {ride.distance}</p>
                  <p>Duration: {ride.duration}</p>
                </div>

                <button className="mt-3 text-blue-600 text-sm hover:underline">
                  Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

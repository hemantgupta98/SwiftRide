"use client";

import { useState } from "react";
import { Search, Download, Calendar, MapPin } from "lucide-react";

type Ride = {
  id: string;
  status: "Completed" | "Cancelled";
  date: string;
  pickup: string;
  drop: string;
  distance: string;
  duration: string;
  earnings: string;
};

const rides: Ride[] = [
  {
    id: "#SR-9921",
    status: "Completed",
    date: "Oct 24, 2023",
    pickup: "Downtown Central Station, 5th Ave",
    drop: "Greenwood Corporate Park, Building B",
    distance: "8.4 miles",
    duration: "22 mins",
    earnings: "$32.50",
  },
  {
    id: "#SR-9918",
    status: "Completed",
    date: "Oct 24, 2023",
    pickup: "Westside Shopping Mall",
    drop: "Grand View Apartments, Unit 402",
    distance: "4.2 miles",
    duration: "12 mins",
    earnings: "$18.20",
  },
  {
    id: "#SR-9915",
    status: "Cancelled",
    date: "Oct 23, 2023",
    pickup: "Northside Arena Entrance",
    drop: "Riverside Pub & Grill",
    distance: "0.0 miles",
    duration: "0 mins",
    earnings: "$5.00",
  },
  {
    id: "#SR-9912",
    status: "Completed",
    date: "Oct 23, 2023",
    pickup: "Oak Ridge Residential Area",
    drop: "International Airport, Terminal 2",
    distance: "15.8 miles",
    duration: "38 mins",
    earnings: "$45.75",
  },
];

export default function RideHistoryPage() {
  const [search, setSearch] = useState("");

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
        {[
          "Total Rides",
          "Earnings (Oct)",
          "Distance Covered",
          "Avg. Rating",
        ].map((item, i) => (
          <div key={i} className="bg-[#123B63] rounded-xl p-4 shadow-md">
            <p className="text-sm text-gray-400">{item}</p>
            <h2 className="text-xl font-semibold mt-2">--</h2>
          </div>
        ))}
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
      <div className="space-y-4">
        {rides.map((ride) => (
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

      {/* Load More */}
      <div className="flex justify-center mt-8">
        <button className="px-6 py-2 border border-blue-400 rounded-lg text-blue-300 hover:bg-blue-500/10">
          Load More History
        </button>
      </div>
    </div>
  );
}

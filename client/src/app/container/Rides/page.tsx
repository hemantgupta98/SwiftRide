"use client";

import { IndianRupee } from "lucide-react";
import React from "react";

type Ride = {
  id: number;
  date: string;
  day: string;
  time: string;
  pickup: string;
  drop: string;
  distance: string;
  fare: number;
  status: string;
};

const rides: Ride[] = [
  {
    id: 1,
    date: "08/03/2026",
    day: "Sunday",
    time: "10:30 AM",
    pickup: "Ranchi Railway Station",
    drop: "Birsa Chowk",
    distance: "5.4 km",
    fare: 92,
    status: "Completed",
  },
  {
    id: 2,
    date: "07/03/2026",
    day: "Saturday",
    time: "03:10 PM",
    pickup: "Kanke Road",
    drop: "Lalpur",
    distance: "6.1 km",
    fare: 105,
    status: "Completed",
  },
  {
    id: 3,
    date: "06/03/2026",
    day: "Friday",
    time: "07:40 PM",
    pickup: "Main Road",
    drop: "Harmu Housing Colony",
    distance: "4.8 km",
    fare: 86,
    status: "Completed",
  },
  {
    id: 4,
    date: "05/03/2026",
    day: "Thursday",
    time: "01:15 PM",
    pickup: "Ratu Road",
    drop: "Doranda",
    distance: "7.2 km",
    fare: 120,
    status: "Completed",
  },
];

const Page = () => {
  const totalFare = rides.reduce((acc, ride) => acc + ride.fare, 0);
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-100 via-white to-orange-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">
            My Ride History
          </h1>

          <div className="bg-orange-500 text-white px-6 py-2 rounded-xl shadow-lg font-semibold">
            Total Rides : {rides.length}
          </div>
        </div>
        <div className="bg-white shadow-xl rounded-xl p-6 border mb-10">
          <h2 className="text-gray-500">Total Spent</h2>
          <p className="text-3xl font-bold text-orange-500 flex items-center">
            <IndianRupee size={20} />
            {totalFare}
          </p>
        </div>

        {/* Ride Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-2xl transition"
            >
              {/* Ride Header */}
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm">{ride.day}</p>
                  <p className="font-semibold">{ride.date}</p>
                </div>

                <div className="text-right">
                  <p className="text-gray-500 text-sm">Time</p>
                  <p className="font-semibold">{ride.time}</p>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Pickup Location</p>
                  <p className="font-medium text-gray-700">{ride.pickup}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Drop Location</p>
                  <p className="font-medium text-gray-700">{ride.drop}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-bold text-green-600">{ride.status}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t my-4"></div>

              {/* Distance & Fare */}
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-400">Distance</p>
                  <p className="font-semibold text-gray-700">{ride.distance}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Fare</p>
                  <p className="font-bold text-orange-600">₹ {ride.fare}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {rides.length === 0 && (
          <div className="text-center mt-20">
            <h2 className="text-xl font-semibold text-gray-600">
              No rides completed yet
            </h2>
            <p className="text-gray-400 mt-2">
              Book your first ride to see history here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

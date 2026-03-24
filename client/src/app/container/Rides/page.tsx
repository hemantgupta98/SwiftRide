"use client";

import { IndianRupee } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../../lib/api";

type Ride = {
  id: string;
  date: string;
  day: string;
  time: string;
  pickup: string;
  drop: string;
  distance: string;
  fare: number;
  status: string;
};

type RideHistoryApiItem = {
  _id: string;
  pickup?: { coordinates?: [number, number]; label?: string };
  drop?: { coordinates?: [number, number]; label?: string };
  distanceKm?: number;
  fareAmount?: number;
  status?: string;
  createdAt?: string;
};

const formatLocation = (point?: {
  coordinates?: [number, number];
  label?: string;
}) => {
  const safeLabel = (point?.label || "").trim();
  if (safeLabel && safeLabel !== "Pickup" && safeLabel !== "Drop") {
    return safeLabel;
  }

  const coordinates = point?.coordinates;
  if (!coordinates || coordinates.length !== 2) {
    return "N/A";
  }

  const [lng, lat] = coordinates;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return "N/A";
  }

  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

const mapRideForUi = (ride: RideHistoryApiItem): Ride => {
  const created = ride.createdAt ? new Date(ride.createdAt) : new Date();

  return {
    id: ride._id,
    date: created.toLocaleDateString("en-GB"),
    day: created.toLocaleDateString("en-US", { weekday: "long" }),
    time: created.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    pickup: formatLocation(ride.pickup),
    drop: formatLocation(ride.drop),
    distance: `${Number(ride.distanceKm || 0).toFixed(1)} km`,
    fare: Number(ride.fareAmount || 0),
    status: ride.status
      ? `${ride.status.charAt(0).toUpperCase()}${ride.status.slice(1)}`
      : "Unknown",
  };
};

const Page = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRideHistory = async () => {
      try {
        const response = await api.get("/ride/history");
        const items = Array.isArray(response?.data?.data)
          ? (response.data.data as RideHistoryApiItem[])
          : [];

        if (isMounted) {
          setRides(items.map(mapRideForUi));
        }
      } catch {
        if (isMounted) {
          setRides([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRideHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const completedRides = useMemo(
    () =>
      rides.filter((ride) => ride.status.trim().toLowerCase() === "completed"),
    [rides],
  );

  const totalFare = useMemo(
    () => completedRides.reduce((acc, ride) => acc + ride.fare, 0),
    [completedRides],
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-100 via-white to-orange-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">
            My Ride History
          </h1>

          <div className="bg-orange-500 text-white px-6 py-2 rounded-xl shadow-lg font-semibold">
            Total Rides : {completedRides.length}
          </div>
        </div>
        <div className="bg-white shadow-xl rounded-xl p-6 border mb-10">
          <h2 className="text-gray-500">Total Spent</h2>
          <p className="text-3xl font-bold text-orange-500 flex items-center">
            <IndianRupee size={20} />
            {totalFare.toFixed(2)}
          </p>
        </div>

        {/* Ride Cards */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            {completedRides.map((ride) => (
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
                    <p className="font-semibold text-gray-700">
                      {ride.distance}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Fare</p>
                    <p className="font-bold text-orange-600">₹ {ride.fare}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="text-center mt-20">
            <h2 className="text-xl font-semibold text-gray-600">
              Loading your ride history...
            </h2>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && completedRides.length === 0 && (
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

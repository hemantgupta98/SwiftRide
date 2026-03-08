/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { Input } from "../../components/ui/inputApi";
import { MapPin, Flag } from "lucide-react";
import RouteMap from "../../components/ui/routeMap";

const LeafletMap = dynamic(() => import("../../components/ui/map"), {
  ssr: false,
});

const Page = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [dropLocation, setDropLocation] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);

  // 🔎 Search location using Nominatim
  const searchLocation = async (query: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json`,
    );

    const data = await res.json();

    return data[0];
  };

  // 🛣️ Get route using OSRM
  const getRoute = async (pickup: any, drop: any) => {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}?overview=full&geometries=geojson`,
    );

    const data = await res.json();

    const coords = data.routes[0].geometry.coordinates;

    setRoute(coords);
  };

  // 🚕 Book Ride
  const handleBookRide = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!pickup || !drop) return;

    const pickupData = await searchLocation(pickup);
    const dropData = await searchLocation(drop);

    if (!pickupData || !dropData) return;

    setPickupLocation(pickupData);
    setDropLocation(dropData);

    await getRoute(pickupData, dropData);

    setShowMap(true);
  };

  // ❌ Cancel Ride
  const handleCancelRide = (e: React.MouseEvent) => {
    e.preventDefault();

    setRoute(null);
    setPickupLocation(null);
    setDropLocation(null);
    setShowMap(false);

    setPickup("");
    setDrop("");
  };

  return (
    <>
      <div className="min-h-screen rounded-2xl shadow-2xl m-5 p-5 space-y-5">
        <h1 className="text-orange-400 text-3xl font-semibold">
          Book your ride
        </h1>

        <form className="mt-5 p-3">
          {/* Pickup */}
          <label className="block mb-2 font-semibold">Pickup location</label>

          <div className="relative mb-4">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
              size={18}
            />

            <Input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="pl-10"
              placeholder="Pick-up location"
            />
          </div>

          {/* Drop */}
          <label className="block mb-2 font-semibold">Drop location</label>

          <div className="relative">
            <Flag
              className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600"
              size={18}
            />

            <Input
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              className="pl-10"
              placeholder="Drop location"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-5">
            <button
              type="button"
              onClick={handleBookRide}
              className="mt-5 inline-flex items-center gap-2 bg-green-500 text-white rounded-md px-4 py-2 font-semibold"
            >
              Book Ride
            </button>

            <button
              type="button"
              onClick={handleCancelRide}
              className="mt-5 inline-flex items-center gap-2 bg-red-500 text-white rounded-md px-4 py-2 font-semibold"
            >
              Cancel Ride
            </button>
          </div>

          {/* Route Map */}
          <div className="mt-8">
            {showMap && pickupLocation && dropLocation && route && (
              <RouteMap
                route={route}
                pickup={pickupLocation}
                drop={dropLocation}
              />
            )}
          </div>
        </form>

        {/* Default Map */}
        <div className="mt-6">
          <LeafletMap />
        </div>
      </div>
    </>
  );
};

export default Page;

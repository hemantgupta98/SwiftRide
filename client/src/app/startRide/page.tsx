"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { Input } from "../../components/ui/inputApi";

import { MapPin, Flag, MapPinned } from "lucide-react";

const LeafletMap = dynamic(() => import("../../components/ui/map"), {
  ssr: false,
});

const Page = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const searchLocation = async (query: string) => {
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json`,
    );

    const data = await res.json();
    console.log("Search Result:", data);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      console.log("Latitude:", pos.coords.latitude);
      console.log("Longitude:", pos.coords.longitude);
    });
  };

  return (
    <>
      <div className=" min-h-screen rounded-2xl shadow-2xl m-5 p-5 space-y-5">
        <h1 className=" block text-orange-400 text-3xl font-semibold ">
          Book your ride
        </h1>
        <form className="mt-5 p-3">
          <label className="block mb-2 font-semibold">Pickup location</label>
          <div className="relative mb-4">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
              size={18}
            />
            <Input
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                searchLocation(e.target.value);
              }}
              className="pl-10"
              placeholder="Pick-up location"
            />
          </div>

          <label className="block mb-2 font-semibold">Drop location</label>
          <div className="relative">
            <Flag
              className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600"
              size={18}
            />
            <Input
              value={drop}
              onChange={(e) => {
                setDrop(e.target.value);
                searchLocation(e.target.value);
              }}
              className="pl-10"
              placeholder="Drop location"
            />
          </div>

          <div className="flex gap-5">
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2 font-semibold"
            >
              Book Ride
            </button>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2 text-red-400 font-semibold"
            >
              Cancel Ride
            </button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="inline-flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2 font-semibold"
            >
              <MapPinned size={18} className="text-orange-400" />
              current location
            </button>
          </div>
        </form>
        <div className="mt-6">
          <LeafletMap />
        </div>
      </div>
    </>
  );
};

export default Page;

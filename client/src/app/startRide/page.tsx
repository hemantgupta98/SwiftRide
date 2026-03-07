"use client";
import React from "react";
import { Input } from "../../components/ui/input";

import { MapPin, Flag, MapPinned } from "lucide-react";

const page = () => {
  return (
    <>
      <div className=" min-h-screen rounded-2xl shadow-2xl m-5 p-5 space-y-5">
        <h1 className=" block text-orange-400 text-3xl font-semibold ">
          Book your ride
        </h1>
        <form className=" mt-5 p-3">
          <label className="block mb-2 font-semibold">Pickup location</label>
          <div className="relative mb-4">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
              size={18}
              color="#16a34a"
            />
            <Input className="pl-10" placeholder="Pick-up location" />
          </div>

          <label className="block mb-2 font-semibold">Drop location</label>
          <div className="relative">
            <Flag
              className="absolute text-red-600 left-3 top-1/2 -translate-y-1/2"
              size={18}
              color="#dc2626"
            />
            <Input className="pl-10" placeholder="Drop location" />
          </div>
          <div className="flex gap-5">
            <button className=" mt-5 inline-flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2 text-black font-semibold whitespace-nowrap">
              Book Ride
            </button>
            <button className=" mt-5 inline-flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2 text-red-400 font-semibold whitespace-nowrap">
              Cancel Ride
            </button>
          </div>
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className=" mt-5 ">
            <button className="inline-flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2 text-black font-semibold whitespace-nowrap">
              <MapPinned size={18} className=" text-orange-400" />
              current location
            </button>
          </div>
        </form>
        <div className="rounded-2xl border border-orange-100 bg-linear-to-br from-orange-50 via-white mt-5 to-amber-50 p-5 shadow-2xl">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
              SwiftRide
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Rider
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Driver
            </span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
              Admin
            </span>
            <span className="rounded-full  px-3 py-1 text-xs font-semibold text-amber-700">
              Affordable
            </span>
          </div>

          <p className="text-[20px] leading-9 font-medium text-gray-700 tracking-wide [word-spacing:0.22em]">
            <span className="rounded-md px-2 py-1 font-semibold text-orange-600 text-[22px]">
              SwiftRide
            </span>{" "}
            is a ride-booking platform built to deliver fast, reliable, and
            affordable transportation by connecting riders and drivers in one
            seamless system. The platform works through three key roles:
            <span className="rounded-md bg-green-100 px-2 py-1 font-semibold text-green-700">
              Rider
            </span>{" "}
            (customer),
            <span className="rounded-md bg-white px-2 py-1 font-semibold text-blue-700">
              Driver
            </span>{" "}
            (partner), and
            <span className="rounded-md bg-rose-100 px-2 py-1 font-semibold text-rose-700">
              Admin
            </span>
            . Riders can register, log in, set pickup and drop locations, view
            estimated fares, request rides instantly, track drivers in real
            time, communicate when needed, and complete secure payments. Riders
            are expected to share accurate location details and maintain
            respectful behavior during each trip. Drivers accept ride requests,
            provide safe and timely transportation, maintain valid profile and
            vehicle details, follow traffic rules, reach pickup points on time,
            and manage ride status, availability, and earnings through the
            driver interface. Admin oversees the platform by managing accounts,
            monitoring activities, resolving disputes, ensuring security,
            verifying drivers, and maintaining service quality. Overall,
            <span className="rounded-md px-2 py-1 font-semibold text-orange-600">
              SwiftRide
            </span>{" "}
            focuses on a secure, smooth, and convenient mobility experience for
            both riders and drivers.
          </p>
        </div>
      </div>
    </>
  );
};

export default page;

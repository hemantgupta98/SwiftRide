"use client";

import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  return (
    <>
      <div className=" min-h-screen rounded-2xl shadow-2xl m-5 p-5">
        <div className="flex items-center">
          <Search size={18} className="absolute ml-3" />
          <Input
            placeholder="Enter your pickup location"
            className=" rounded-md pl-10 "
            onClick={() => router.push("/startRide")}
          />
        </div>
        <div className="w-full min-h-screen mt-5 flex">
          {/* Left Side - Image */}
          <div className="relative w-1/2 min-h-screen">
            <Image
              src="/riderPromo.jpeg"
              alt="promo"
              fill
              className="object-cover"
            />
          </div>

          {/* Right Side - Text */}
          <div className="w-1/2  min-h-screen flex  items-center justify-center p-10">
            <div className="">
              <p className="text-xl text-gray-700 font-semibold p-2">
                <span className="text-orange-400 text-2xl font-semibold ">
                  SwiftRide{" "}
                </span>{" "}
                is a fast, reliable, and affordable ride-booking platform that
                connects riders and drivers seamlessly. It ensures safe
                journeys, real-time tracking, and smooth payments, making every
                trip convenient and stress-free.
                <span className=" block text-orange-400 text-3xl font-semibold text-center mt-5">
                  #Start-your--Ride
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="relative w-max-4xl min-h-screen  mt-5">
          <Image
            src="/rideBackground.png"
            alt="promo"
            fill
            className="object-cover"
          />
        </div>
        <footer className=" mt-3 text-center text-sm text-gray-300">
          <p>© 2026 SwiftRide Inc. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Page;

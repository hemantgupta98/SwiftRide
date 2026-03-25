"use client";

import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen rounded-2xl shadow-2xl m-2 sm:m-4 lg:m-5 p-3 sm:p-4 lg:p-5">
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-3" />
        <Input
          placeholder="Enter your pickup location"
          className="rounded-md pl-10 text-sm sm:text-base"
          onClick={() => router.push("/startRide")}
        />
      </div>

      <div className="w-full mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="relative w-full min-h-60 sm:min-h-85 lg:min-h-140 overflow-hidden rounded-xl">
          <Image
            src="/promot.webp"
            alt="promo"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="w-full min-h-60 sm:min-h-85 lg:min-h-140 flex items-center justify-center p-4 sm:p-6 lg:p-10">
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 font-semibold leading-relaxed">
            <span className="text-orange-400 text-xl sm:text-2xl font-semibold">
              SwiftRide{" "}
            </span>
            is a fast, reliable, and affordable ride-booking platform that
            connects riders and drivers seamlessly. It ensures safe journeys,
            real-time tracking, and smooth payments, making every trip
            convenient and stress-free.
            <span className="block text-orange-400 text-2xl sm:text-3xl font-semibold text-center mt-5">
              #Start-your--Ride
            </span>
          </p>
        </div>
      </div>

      <div className="relative w-full min-h-55 sm:min-h-80 lg:min-h-110 mt-5 overflow-hidden rounded-xl">
        <Image
          src="/rideBackground.png"
          alt="promo"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <footer className="mt-3 text-center text-xs sm:text-sm text-gray-500">
        <p>© 2026 SwiftRide Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Page;

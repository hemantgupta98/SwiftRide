"use client";

import {
  MapPin,
  Navigation,
  Star,
  ShieldCheck,
  Clock,
  Users,
  Leaf,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#0B1220] overflow-hidden text-white">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_45%)]" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-size-[40px_40px]" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Section */}
        <div>
          <span className="inline-block mb-5 px-4 py-1 text-sm rounded-full bg-green-500/10 text-green-400">
            #1 Bike Ride Platform in the City
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Fast, Affordable <br />
            <span className="text-green-400">& Reliable</span> Bike Rides
          </h1>

          <p className="mt-6 max-w-xl text-gray-300 text-lg">
            Beat the traffic and arrive in style. SwiftRide connects you with
            verified riders for the quickest urban commute at the best prices.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Badge icon={<Star size={16} />} text="4.9/5 Rating" />
            <Badge icon={<ShieldCheck size={16} />} text="Verified Riders" />
            <Badge icon={<Clock size={16} />} text="5 Min Avg. Pickup" />
          </div>

          {/* Users */}
          <div className="flex items-center gap-3 mt-10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={`https://i.pravatar.cc/40?img=${i}`}
                  className="w-10 h-10 rounded-full border-2 border-[#0B1220]"
                  alt="user"
                />
              ))}
            </div>
            <p className="text-gray-300">
              <span className="font-semibold text-white">10,000+</span> Active
              Riders <br />
              <span className="text-sm text-gray-400">
                joining the movement today
              </span>
            </p>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-white text-black rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-1">Where to?</h3>
          <p className="text-sm text-gray-500 mb-4">
            Enter your details to see a ride estimate.
          </p>

          <div className="space-y-3">
            <Input
              icon={<MapPin className="text-green-500" size={18} />}
              placeholder="Enter pickup location"
            />
            <Input
              icon={<Navigation className="text-red-500" size={18} />}
              placeholder="Enter destination"
            />
          </div>

          <button className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
            Book Your Ride →
          </button>

          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span>⏱ 2 min pickup</span>
            <span>✔ Verified Riders</span>
          </div>

          <div className="mt-4 text-xs flex justify-between items-center text-green-600">
            <span className="font-semibold">SPECIAL OFFER</span>
            <span>Get 50% off your first 3 rides!</span>
          </div>
        </div>
      </div>

      {/* Bottom Features */}
      <div className="relative border-t border-white/10 bg-white text-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <Feature icon={<ShieldCheck />} text="SecurePay" />
          <Feature icon={<Clock />} text="TimeSaver" />
          <Feature icon={<Star />} text="TopRated" />
          <Feature icon={<Leaf />} text="EcoMove" />
        </div>
      </div>
    </main>
  );
}

/* ---------- Components ---------- */

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-sm text-gray-200">
      {icon}
      {text}
    </span>
  );
}

function Input({
  icon,
  placeholder,
}: {
  icon: React.ReactNode;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
      {icon}
      <input
        placeholder={placeholder}
        className="w-full outline-none text-sm"
      />
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 font-medium">
      <span className="text-green-500">{icon}</span>
      {text}
    </div>
  );
}

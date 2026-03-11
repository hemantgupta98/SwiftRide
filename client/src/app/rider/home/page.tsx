"use client";

import Image from "next/image";
import { useState } from "react";

export default function Dashboard() {
  const [online, setOnline] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c2d4a] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-6">
            <p className="text-green-400 bg-green-900/40 inline-block px-4 py-1 rounded-full text-sm">
              New Bonus Available: +$5.00 per ride in Downtown
            </p>

            <h1 className="text-5xl font-bold">
              Earn with <span className="text-green-400">SwiftRide.</span>
            </h1>

            <p className="text-gray-300 max-w-lg">
              Go online and start accepting rides instantly. You&apos;re in
              control of your schedule and your earnings.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setOnline(true)}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold"
              >
                Go Online Now
              </button>

              <button className="border border-gray-400 px-6 py-3 rounded-lg">
                View Promotions →
              </button>
            </div>

            <p className="text-sm text-gray-400">
              Join{" "}
              <span className="text-white font-semibold">1,200+ drivers</span>{" "}
              online in your city.
            </p>
          </div>

          {/* STATUS CARD */}
          <div className="bg-white text-gray-800 rounded-2xl p-8 shadow-lg text-center">
            <div className="text-5xl mb-4">🚗</div>

            <h2 className="text-xl font-semibold mb-2">
              {online ? "You are Online" : "You are Offline"}
            </h2>

            <p className="text-gray-500 mb-6">
              Connect to the network to start receiving ride requests in your
              area.
            </p>

            <button
              onClick={() => setOnline(!online)}
              className="bg-green-500 text-white w-full py-3 rounded-lg font-semibold"
            >
              {online ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>

        {/* PERFORMANCE */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Today&apos;s Performance</h2>
          <p className="text-green-400 cursor-pointer">Detailed Stats →</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Today's Earnings" value="$142.50" icon="💰" />

          <StatCard title="Total Rides" value="12" icon="🚘" />

          <StatCard title="Hours Online" value="6.5h" icon="⏰" />

          <StatCard title="Rider Rating" value="4.95" icon="⭐" />
        </div>

        {/* MAP + SIDE CARDS */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* MAP */}
          <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden">
            <Image
              src="/logo.png"
              alt="map"
              width={900}
              height={500}
              className="w-full h-87.5 object-cover"
            />

            <div className="p-4 text-gray-700">
              <p className="text-sm">
                <span className="font-semibold">LIVE REGION</span> — Market
                District
              </p>

              <p className="text-green-500 text-sm">High Demand +$2.50 Surge</p>
            </div>
          </div>

          {/* TIPS */}
          <div className="space-y-4">
            <AlertCard
              title="Peak Hours Approaching"
              desc="Downtown demand usually spikes around 5:00 PM."
            />

            <AlertCard
              title="Update Your Documents"
              desc="Your vehicle insurance expires in 5 days."
            />

            <div className="bg-white text-gray-800 rounded-xl overflow-hidden">
              <Image
                src="/logo.png"
                alt="reward"
                width={400}
                height={200}
                className="w-full h-32 object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold">SwiftRide Rewards Program</h3>

                <p className="text-sm text-gray-500">
                  Maintain 4.9+ rating this week to unlock Silver tier perks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE DASHBOARD */}
        <div className="lg:hidden space-y-6">
          <h2 className="text-lg font-semibold">Start Earning</h2>

          <div className="bg-white text-gray-800 rounded-xl p-6 text-center">
            <h3 className="font-semibold mb-2">
              {online ? "Online Mode Active" : "You are currently Offline"}
            </h3>

            <button
              onClick={() => setOnline(!online)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg mt-4"
            >
              {online ? "Go Offline" : "Go Online"}
            </button>
          </div>

          {/* Mobile Map */}
          <div className="bg-white rounded-xl overflow-hidden">
            <Image
              src="/logo.png"
              alt="map"
              width={400}
              height={300}
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Today's Pay" value="$142.80" icon="💰" />
            <StatCard title="Rides" value="12" icon="🚗" />
            <StatCard title="Online" value="5.2h" icon="⏱" />
            <StatCard title="Rating" value="4.95" icon="⭐" />
          </div>

          <div className="bg-green-900/40 text-green-300 rounded-xl p-4">
            Downtown rides have a <b>1.5x multiplier</b>. Head there for maximum
            earnings!
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white text-gray-800 rounded-xl p-5 flex flex-col gap-2 shadow">
      <div className="text-2xl">{icon}</div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function AlertCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white text-gray-800 rounded-xl p-4 shadow">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

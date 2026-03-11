"use client";

import {
  Menu,
  Heart,
  Bell,
  ArrowRight,
  Home,
  FileText,
  ChevronDown,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="bg-gray-100 min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <Menu className="w-6 h-6" />

        <div className="flex items-center gap-2 border rounded-full px-4 py-1">
          <span className="text-gray-500 text-sm">OFF DUTY</span>
          <div className="w-10 h-5 bg-gray-200 rounded-full relative">
            <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-0.5 left-0.5"></div>
          </div>
        </div>

        <div className="flex gap-4">
          <Heart className="w-6 h-6 text-gray-600" />
          <Bell className="w-6 h-6 text-gray-600" />
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 px-4 py-4 space-y-6">
        {/* ACTION SECTION */}
        <div className="text-center">
          <ChevronDown className="mx-auto text-gray-400" />
        </div>

        <div className="flex items-center gap-2 font-semibold text-lg">
          <span>Take Action Now</span>
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            1
          </span>
        </div>

        {/* LOW BALANCE CARD */}
        <div className="rounded-3xl overflow-hidden flex bg-black text-white">
          <div className="p-6 flex-1">
            <h2 className="text-xl font-bold leading-snug">
              Low Balance- Orders will be blocked
            </h2>

            <p className="text-gray-300 mt-2">Wallet balance is low</p>

            <button className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-full flex items-center gap-2 font-semibold">
              Pay Now <ArrowRight size={18} />
            </button>
          </div>

          <div className="bg-red-800 flex items-center justify-center w-32">
            <span className="text-4xl">₹</span>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-2xl p-4 flex justify-around shadow-sm">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl">
              ⚙️
            </div>
            <span className="text-sm mt-2">Filter</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center text-xl">
              📍
            </div>
            <span className="text-sm mt-2">Go To</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center text-xl">
              📦
            </div>
            <span className="text-sm mt-2">Orders</span>
          </div>
        </div>

        {/* ONLY FOR YOU */}
        <div>
          <h3 className="text-center text-lg font-semibold mb-3">
            ✦ Only for you ✦
          </h3>

          <div className="bg-yellow-100 rounded-2xl p-6 text-center">
            <p className="text-lg font-semibold text-gray-700">
              Extra efforts. Extra income.
            </p>

            <div className="mt-4 h-40 bg-white rounded-xl flex items-center justify-center text-gray-400">
              Promo Image
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="bg-white border-t p-3 flex justify-around items-center">
        <div className="flex flex-col items-center text-black">
          <Home size={22} />
          <span className="text-xs">Home</span>
        </div>

        <div className="flex items-center gap-2 bg-gray-200 px-6 py-2 rounded-full">
          <FileText size={20} />
          <span className="text-sm font-medium">Orders</span>
        </div>
      </nav>
    </main>
  );
}

"use client";

import { Clock, Navigation, DollarSign, Star, TrendingUp } from "lucide-react";

export default function RideControlPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0b2a52] to-[#071b35] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT MAIN RIDE REQUEST CARD */}

        <div className="lg:col-span-2">
          <div className="bg-white text-black rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                  NEW REQUEST
                </span>

                <h1 className="text-3xl font-bold mt-3 text-[#0b2a52]">
                  Premium XL Trip
                </h1>
              </div>

              <span className="text-gray-500 text-lg font-semibold">13s</span>
            </div>

            {/* Locations */}

            <div className="bg-gray-100 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold">
                    PICKUP LOCATION
                  </p>
                  <p className="font-semibold text-[#0b2a52]">
                    Downtown Terminal (Gate 4)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-2"></div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold">
                    DROP-OFF DESTINATION
                  </p>
                  <p className="font-semibold text-[#0b2a52]">
                    Westside Plaza Corporate Hub
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center">
                <Clock size={20} className="text-green-500 mb-1" />
                <p className="text-xs text-gray-500">EST. TIME</p>
                <p className="font-bold">22 mins</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center">
                <Navigation size={20} className="text-green-500 mb-1" />
                <p className="text-xs text-gray-500">DISTANCE</p>
                <p className="font-bold">4.2 mi</p>
              </div>

              <div className="bg-green-200 p-4 rounded-xl flex flex-col items-center">
                <DollarSign size={20} className="text-green-700 mb-1" />
                <p className="text-xs text-green-700">YOUR FARE</p>
                <p className="font-bold text-green-800 text-lg">$18.50</p>
              </div>
            </div>

            {/* Rider Info */}

            <div className="flex justify-between text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                Rider: Michael S.
                <Star size={14} className="text-yellow-400" />
                <span>(4.9)</span>
              </div>

              <span>4 pieces of luggage</span>
            </div>

            {/* Buttons */}

            <div className="flex gap-4">
              <button className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-xl transition">
                ACCEPT RIDE
              </button>

              <button className="w-40 bg-[#0b2a52] text-white rounded-xl font-semibold">
                REJECT
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-center mt-4 text-sm">
            Accepting this ride will maintain your 100% acceptance rate today.
          </p>
        </div>

        {/* RIGHT SIDEBAR CONTENT */}

        <div className="space-y-6">
          {/* Today Progress */}

          <div className="bg-[#1b345a] rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Today&apos;s Progress</h3>
              <TrendingUp size={18} />
            </div>

            <div className="flex justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">EARNINGS</p>
                <p className="text-2xl font-bold">$142.80</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">TRIPS</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              75% of your $200 daily goal reached
            </p>
          </div>

          {/* Nearby Opportunities */}

          <div className="bg-[#1b345a] rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Nearby Opportunities</h3>
              <span className="text-green-400 text-sm">4 LOCAL</span>
            </div>

            <div className="space-y-3">
              <Opportunity
                title="Airport Express"
                distance="0.8 mi away"
                price="$42.00"
              />

              <Opportunity
                title="Short Hop - Grocery"
                distance="1.2 mi away"
                price="$9.50"
              />

              <Opportunity
                title="Westside Commute"
                distance="2.5 mi away"
                price="$21.20"
              />

              <Opportunity
                title="Late Night Ride"
                distance="3.1 mi away"
                price="$15.00"
              />
            </div>
          </div>

          {/* Surge */}

          <div className="bg-[#0f3a2d] rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="font-semibold">Surge Multiplier Active!</p>
              <p className="text-xs text-gray-300">
                Downtown areas are seeing higher fares.
              </p>
            </div>

            <button className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Opportunity({
  title,
  distance,
  price,
}: {
  title: string;
  distance: string;
  price: string;
}) {
  return (
    <div className="bg-[#2a4b75] p-4 rounded-lg flex justify-between items-center hover:bg-[#335a8b] cursor-pointer transition">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-300">{distance}</p>
      </div>

      <p className="text-green-400 font-semibold">{price}</p>
    </div>
  );
}

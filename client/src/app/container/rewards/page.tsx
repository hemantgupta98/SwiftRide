"use client";

import React from "react";
import {
  Gift,
  TicketPercent,
  Sparkles,
  Hotel,
  Bike,
  Trophy,
} from "lucide-react";

const rewards = [
  {
    rides: 5,
    title: "Free Ride Discount",
    description:
      "Complete 5 rides to unlock a scratch coupon that gives you up to ₹50 off on your next ride.",
    icon: TicketPercent,
    color: "from-yellow-400 to-orange-500",
  },
  {
    rides: 10,
    title: "Power Ride Coupon",
    description:
      "After completing 10 rides you will receive a power coupon with 30% discount for your next 3 rides.",
    icon: Bike,
    color: "from-blue-400 to-indigo-500",
  },
  {
    rides: 15,
    title: "Scratch & Win Gift",
    description:
      "Complete 15 rides and unlock a surprise scratch reward. You may win cashback, ride credits or exciting gifts.",
    icon: Sparkles,
    color: "from-pink-400 to-purple-500",
  },
  {
    rides: 20,
    title: "Hotel Discount (Ranchi)",
    description:
      "After completing 20 rides you unlock exclusive hotel discounts in Ranchi with up to 40% off partner hotels.",
    icon: Hotel,
    color: "from-green-400 to-emerald-600",
  },
  {
    rides: 30,
    title: "Premium Reward Gift",
    description:
      "Complete 30 rides and earn premium gifts like travel vouchers, free ride credits and special festival rewards.",
    icon: Gift,
    color: "from-red-400 to-rose-500",
  },
];

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-orange-400 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" />
          Ride Rewards
        </h1>

        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
          Earn exciting rewards every time you ride with our platform. Complete
          rides to unlock scratch coupons, travel discounts, free ride credits,
          and special partner offers in Ranchi.
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map((reward, index) => {
          const Icon = reward.icon;

          return (
            <div
              key={index}
              className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300"
            >
              {/* Gradient Top Bar */}
              <div
                className={`absolute top-0 left-0 w-full h-2 rounded-t-2xl bg-gradient-to-r ${reward.color}`}
              />

              {/* Icon */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-r ${reward.color} mb-4`}
              >
                <Icon size={28} />
              </div>

              {/* Ride milestone */}
              <h2 className="text-xl font-semibold text-orange-400">
                Complete {reward.rides} Rides
              </h2>

              <h3 className="text-lg font-medium mt-2">{reward.title}</h3>

              <p className="text-gray-400 text-sm mt-3 leading-6">
                {reward.description}
              </p>

              {/* Unlock Button */}
              <button className="mt-6 w-full bg-orange-500 hover:bg-orange-600 transition p-2 rounded-lg font-semibold">
                View Reward
              </button>
            </div>
          );
        })}
      </div>

      {/* Scratch Coupon Section */}
      <div className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Sparkles />
          Scratch & Win Coupons
        </h2>

        <p className="mt-3 text-gray-100 max-w-2xl">
          Every milestone unlocks a special scratch coupon where you can win
          ride cashback, free ride credits, travel vouchers, and partner
          discounts. The more you ride, the more rewards you unlock. Try your
          luck and reveal your surprise reward after completing eligible rides.
        </p>

        <button className="mt-6 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:scale-105 transition">
          Try Scratch Coupon
        </button>
      </div>

      {/* Bottom Note */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        Rewards and offers may vary based on city availability and promotional
        campaigns. Currently some partner rewards are available in Ranchi,
        Jharkhand.
      </div>
    </div>
  );
}

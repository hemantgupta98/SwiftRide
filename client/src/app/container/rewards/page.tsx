"use client";

import React, { useState } from "react";
import {
  Gift,
  TicketPercent,
  Sparkles,
  Hotel,
  Bike,
  Trophy,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";

type Reward = {
  rides: number;
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
};

const rewards: Reward[] = [
  {
    rides: 5,
    title: "Free Ride Discount",
    description:
      "Complete 5 rides to unlock a scratch coupon that gives up to ₹50 off.",
    icon: TicketPercent,
    color: "from-yellow-400 to-orange-500",
  },
  {
    rides: 10,
    title: "Power Ride Coupon",
    description:
      "After completing 10 rides you receive 30% discount on next 3 rides.",
    icon: Bike,
    color: "from-blue-400 to-indigo-500",
  },
  {
    rides: 15,
    title: "Scratch & Win Gift",
    description:
      "Complete 15 rides to unlock surprise scratch rewards and cashback.",
    icon: Sparkles,
    color: "from-pink-400 to-purple-500",
  },
  {
    rides: 20,
    title: "Hotel Discount (Ranchi)",
    description:
      "Get up to 40% discount in partner hotels in Ranchi after 20 rides.",
    icon: Hotel,
    color: "from-green-400 to-emerald-600",
  },
  {
    rides: 30,
    title: "Premium Gift Reward",
    description:
      "Complete 30 rides to unlock travel vouchers and premium gifts.",
    icon: Gift,
    color: "from-red-400 to-rose-500",
  },
];

export default function RewardsPage() {
  const [open, setOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Example user rides (later connect backend)
  const userRides = 0;

  const handleOpen = (reward: Reward) => {
    setSelectedReward(reward);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-8">
      <Toaster richColors position="top-center" />
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-orange-400 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" />
          Ride Rewards
        </h1>

        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
          Complete rides to unlock exciting rewards like scratch coupons, travel
          discounts, free ride credits and hotel offers in Ranchi.
        </p>
      </div>

      {/* Reward Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map((reward, index) => {
          const Icon = reward.icon;

          return (
            <div
              key={index}
              className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl hover:scale-105 transition"
            >
              <div
                className={`absolute top-0 left-0 w-full h-2 rounded-t-2xl bg-gradient-to-r ${reward.color}`}
              />

              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-r ${reward.color} mb-4`}
              >
                <Icon size={28} />
              </div>

              <h2 className="text-xl font-semibold text-orange-400">
                Complete {reward.rides} Rides
              </h2>

              <h3 className="text-lg mt-2">{reward.title}</h3>

              <p className="text-gray-400 text-sm mt-3">{reward.description}</p>

              <button
                onClick={() => handleOpen(reward)}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 p-2 rounded-lg font-semibold"
              >
                View Reward
              </button>
            </div>
          );
        })}
      </div>

      {/* POPUP MODAL */}
      {open && selectedReward && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="relative bg-gray-900 border border-gray-700 w-95 rounded-2xl p-6 shadow-2xl animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-orange-400 mb-4">
              Reward Locked
            </h2>

            <p className="text-gray-300 leading-7">
              Sorry, you have completed{" "}
              <span className="text-red-400 font-semibold">0 rides</span>. This
              reward is not available for you yet.
            </p>

            <p className="text-gray-400 mt-3">
              Please complete{" "}
              <span className="text-orange-400 font-semibold">
                {selectedReward.rides} rides
              </span>{" "}
              to unlock this reward.
            </p>

            <div className="mt-6">
              <button
                onClick={() => setOpen(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 p-2 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-16 bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-xl">
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

        <button
          onClick={() => toast.info("No Scratch Coupon")}
          className="mt-6 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:scale-105 transition"
        >
          Try Scratch Coupon
        </button>
      </div>

      <div className="mt-12 text-center text-gray-400 text-sm">
        Rewards and offers may vary based on city availability and promotional
        campaigns. Currently some partner rewards are available in Ranchi,
        Jharkhand.
      </div>
    </div>
  );
}

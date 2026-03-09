"use client";

import React from "react";
import {
  Gift,
  Share2,
  Users,
  IndianRupee,
  Copy,
  CheckCircle,
} from "lucide-react";

const ReferPage = () => {
  const referralCode = "SWIFT100";

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Referral Code Copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 text-white p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-2">
          <Gift size={40} /> Refer & Earn
        </h1>
        <p className="text-lg text-orange-100">
          Invite your friends and earn rewards when they ride with SwiftRide.
        </p>
      </div>

      {/* Reward Card */}
      <div className="max-w-4xl mx-auto mt-10 bg-white text-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-orange-600">
            Earn ₹100 For Every Friend
          </h2>

          <p className="mt-2 text-gray-600">
            Share your referral code with friends. When they sign up and
            complete their first ride, you will get ₹100 in your SwiftRide
            wallet.
          </p>
        </div>

        {/* Referral Code */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="bg-gray-100 px-6 py-3 rounded-lg text-xl font-bold tracking-widest">
            {referralCode}
          </div>

          <button
            onClick={copyCode}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-semibold"
          >
            <Copy size={18} />
            Copy Code
          </button>
        </div>

        {/* Invite Button */}
        <div className="mt-6 text-center">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto">
            <Share2 size={20} />
            Invite Friends
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto mt-14">
        <h2 className="text-3xl font-bold text-center mb-10">
          How Refer & Earn Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white text-gray-800 rounded-2xl p-6 shadow-xl text-center">
            <Users className="mx-auto text-orange-500 mb-3" size={40} />

            <h3 className="text-xl font-bold">Invite Your Friends</h3>

            <p className="text-gray-600 mt-2">
              Share your referral code with your friends, family members,
              cousins or anyone who wants to use SwiftRide.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white text-gray-800 rounded-2xl p-6 shadow-xl text-center">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />

            <h3 className="text-xl font-bold">They Book a Ride</h3>

            <p className="text-gray-600 mt-2">
              When your friend signs up using your referral code and completes
              their first ride on SwiftRide.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white text-gray-800 rounded-2xl p-6 shadow-xl text-center">
            <IndianRupee className="mx-auto text-purple-600 mb-3" size={40} />

            <h3 className="text-xl font-bold">You Earn ₹100</h3>

            <p className="text-gray-600 mt-2">
              After their ride is completed successfully, you will receive ₹100
              in your SwiftRide wallet as a referral reward.
            </p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="max-w-4xl mx-auto mt-16 text-center text-orange-100 text-sm">
        <p>
          * Referral reward will be credited only after the referred user
          completes their first ride. SwiftRide reserves the right to change
          referral rewards and terms at any time.
        </p>
      </div>
    </div>
  );
};

export default ReferPage;

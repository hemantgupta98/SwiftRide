"use client";

import React, { useState } from "react";
import { Gift, Zap, CheckCircle, Ticket } from "lucide-react";

const PowerPassPage = () => {
  const [ridesCompleted, setRidesCompleted] = useState(0); // example rides
  const targetRides = 10;

  const powerPassActive = ridesCompleted >= targetRides;

  const progress = Math.min((ridesCompleted / targetRides) * 100, 100);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-purple-900 via-indigo-900 to-black p-10">
      {/* Main Card */}
      <div className="w-full max-w-3xl rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl p-10">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-yellow-400" size={35} />
          <h1 className="text-3xl font-bold text-white">
            SwiftRide Power Pass
          </h1>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          Complete{" "}
          <span className="text-yellow-400 font-semibold">10 rides</span> and
          unlock the exclusive{" "}
          <span className="text-pink-400 font-semibold">Power Pass</span>. This
          pass gives you{" "}
          <span className="text-green-400 font-semibold">40% discount</span> on
          your next{" "}
          <span className="text-yellow-400 font-semibold">12 rides</span>.
        </p>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Ride Progress</span>
            <span>
              {ridesCompleted} / {targetRides}
            </span>
          </div>

          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-linear-to-r from-pink-500 via-orange-400 to-yellow-400 transition-all duration-500"
            />
          </div>
        </div>

        {/* Reward Section */}
        {powerPassActive ? (
          <div className="bg-linear-to-r from-green-500/20 to-emerald-400/20 border border-green-400 rounded-2xl p-6 flex items-center gap-4">
            <Ticket className="text-green-400" size={40} />

            <div>
              <h2 className="text-xl font-bold text-green-300">
                Power Pass Unlocked 🎉
              </h2>
              <p className="text-gray-200">
                You now have <span className="font-semibold">40% discount</span>{" "}
                for the next <span className="font-semibold">12 rides</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-r from-orange-500/20 to-yellow-400/20 border border-yellow-400 rounded-2xl p-6 flex items-center gap-4">
            <Gift className="text-yellow-400" size={40} />

            <div>
              <h2 className="text-lg font-semibold text-yellow-300">
                Keep Riding 🚗
              </h2>
              <p className="text-gray-200">
                Complete{" "}
                <span className="font-semibold">
                  {targetRides - ridesCompleted} more rides
                </span>{" "}
                to unlock your Power Pass.
              </p>
            </div>
          </div>
        )}

        {/* Completed rides display */}
        <div className="mt-10 grid grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => {
            const completed = index < ridesCompleted;

            return (
              <div
                key={index}
                className={`flex items-center justify-center rounded-xl h-14 border 
                ${
                  completed
                    ? "bg-green-500/30 border-green-400"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                {completed ? (
                  <CheckCircle className="text-green-400" />
                ) : (
                  <span className="text-gray-400">{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PowerPassPage;

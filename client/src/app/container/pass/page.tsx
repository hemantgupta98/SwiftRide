"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Gift, Zap, CheckCircle, Ticket } from "lucide-react";
import { api } from "@/lib/api";

const PowerPassPage = () => {
  const [ridesCompleted, setRidesCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const targetRides = 10;

  useEffect(() => {
    void (async () => {
      setIsLoading(true);

      try {
        const response = await api.get("/ride/history");
        const rides = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        const completedRidesCount = rides.filter(
          (ride: { status?: string }) => ride.status === "completed",
        ).length;

        setRidesCompleted(completedRidesCount);
      } catch {
        setRidesCompleted(0);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const powerPassActive = ridesCompleted >= targetRides;

  const progress = useMemo(
    () => Math.min((ridesCompleted / targetRides) * 100, 100),
    [ridesCompleted],
  );

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
              {isLoading ? "Loading..." : `${ridesCompleted} / ${targetRides}`}
            </span>
          </div>

          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden p-0.5">
            <div className="h-full w-full grid grid-cols-10 gap-0.5">
              {Array.from({ length: targetRides }).map((_, index) => {
                const segmentFilled =
                  index < Math.min(ridesCompleted, targetRides);

                return (
                  <span
                    key={index}
                    className={`h-full rounded-full transition-all duration-500 ${
                      segmentFilled
                        ? "bg-linear-to-r from-pink-500 via-orange-400 to-yellow-400"
                        : "bg-gray-600"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="text-right text-xs text-gray-400 mt-2">
            {Math.round(progress)}%
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
            const boxNumber = index + 1;

            return (
              <div
                key={index}
                className={`relative overflow-hidden flex items-center justify-center rounded-xl h-14 border 
                ${
                  completed
                    ? "bg-green-500/30 border-green-400"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                <span
                  className={`absolute inset-0 flex items-center justify-center text-2xl font-bold select-none 
                  ${completed ? "text-green-100/30" : "text-gray-500/30"}`}
                >
                  {boxNumber}
                </span>

                {completed ? (
                  <CheckCircle className="text-green-300 relative z-10" />
                ) : (
                  <span className="text-transparent relative z-10">
                    {boxNumber}
                  </span>
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

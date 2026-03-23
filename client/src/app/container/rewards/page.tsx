"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bike,
  CheckCircle,
  Gift,
  Hotel,
  Sparkles,
  TicketPercent,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { api } from "@/lib/api";

type Reward = {
  rides: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  rewardMessage: string;
  isUnlocked: boolean;
  isClaimed: boolean;
  canClaim: boolean;
};

type RewardStatusResponse = {
  completedRides: number;
  rewardMessage: string;
  milestones: Array<{
    rides: number;
    title: string;
    description: string;
    rewardMessage: string;
    isUnlocked: boolean;
    isClaimed: boolean;
    canClaim: boolean;
  }>;
};

const rewardUiMeta: Record<number, { icon: LucideIcon; color: string }> = {
  5: { icon: TicketPercent, color: "from-yellow-400 to-orange-500" },
  10: { icon: Bike, color: "from-blue-400 to-indigo-500" },
  15: { icon: Sparkles, color: "from-pink-400 to-purple-500" },
  20: { icon: Hotel, color: "from-green-400 to-emerald-600" },
};

const fallbackRewards: Reward[] = [
  {
    rides: 5,
    title: "Starter Reward",
    description: "Complete 5 rides and unlock 2 days for free rides.",
    icon: TicketPercent,
    color: "from-yellow-400 to-orange-500",
    rewardMessage: "You get 2 days for free rides",
    isUnlocked: false,
    isClaimed: false,
    canClaim: false,
  },
  {
    rides: 10,
    title: "Silver Reward",
    description: "Complete 10 rides and unlock 2 days for free rides.",
    icon: Bike,
    color: "from-blue-400 to-indigo-500",
    rewardMessage: "You get 2 days for free rides",
    isUnlocked: false,
    isClaimed: false,
    canClaim: false,
  },
  {
    rides: 15,
    title: "Gold Reward",
    description: "Complete 15 rides and unlock 2 days for free rides.",
    icon: Sparkles,
    color: "from-pink-400 to-purple-500",
    rewardMessage: "You get 2 days for free rides",
    isUnlocked: false,
    isClaimed: false,
    canClaim: false,
  },
  {
    rides: 20,
    title: "Platinum Reward",
    description: "Complete 20 rides and unlock 2 days for free rides.",
    icon: Hotel,
    color: "from-green-400 to-emerald-600",
    rewardMessage: "You get 2 days for free rides",
    isUnlocked: false,
    isClaimed: false,
    canClaim: false,
  },
];

export default function RewardsPage() {
  const [completedRides, setCompletedRides] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>(fallbackRewards);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const maxTargetRides = 20;

  const progress = useMemo(
    () => Math.min((completedRides / maxTargetRides) * 100, 100),
    [completedRides],
  );

  const fetchRewardsStatus = async () => {
    setIsLoading(true);

    try {
      const response = await api.get("/ride/rewards/status");
      const data = response.data?.data as RewardStatusResponse | undefined;

      const milestones = Array.isArray(data?.milestones) ? data.milestones : [];

      if (Number.isFinite(data?.completedRides)) {
        setCompletedRides(Number(data?.completedRides));
      }

      if (milestones.length > 0) {
        const mappedRewards = milestones.map((milestone) => {
          const uiMeta = rewardUiMeta[milestone.rides] ?? {
            icon: Gift,
            color: "from-orange-500 to-amber-500",
          };

          return {
            rides: milestone.rides,
            title: milestone.title,
            description: milestone.description,
            rewardMessage: milestone.rewardMessage,
            isUnlocked: milestone.isUnlocked,
            isClaimed: milestone.isClaimed,
            canClaim: milestone.canClaim,
            icon: uiMeta.icon,
            color: uiMeta.color,
          };
        });

        setRewards(mappedRewards);
      }
    } catch {
      toast.error("Failed to load rewards status");
      setCompletedRides(0);
      setRewards(fallbackRewards);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRewardsStatus();
  }, []);

  const handleOpen = (reward: Reward) => {
    setSelectedReward(reward);
    setOpen(true);
  };

  const handleClaimReward = async () => {
    if (!selectedReward?.canClaim) {
      return;
    }

    setIsClaiming(true);

    try {
      await api.post("/ride/rewards/claim", {
        targetRides: selectedReward.rides,
      });

      toast.success("Reward claimed: You get 2 days for free rides");
      await fetchRewardsStatus();
    } catch {
      toast.error("Unable to claim reward");
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (!selectedReward) {
      return;
    }

    const latestReward = rewards.find(
      (reward) => reward.rides === selectedReward.rides,
    );

    if (latestReward) {
      setSelectedReward(latestReward);
    }
  }, [rewards, selectedReward]);

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-gray-800 text-white p-8">
      <Toaster richColors position="top-center" />
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-orange-400 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" />
          Ride Rewards
        </h1>

        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
          Complete milestone rides and claim your reward. Every target gives you{" "}
          <span className="text-orange-400 font-semibold">
            2 days for free rides
          </span>
          .
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12 bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Ride Progress</span>
          <span>
            {isLoading ? "Loading..." : `${completedRides} / ${maxTargetRides}`}
          </span>
        </div>

        <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden p-0.5">
          <div className="h-full w-full grid grid-cols-20 gap-0.5">
            {Array.from({ length: maxTargetRides }).map((_, index) => {
              const segmentFilled =
                index < Math.min(completedRides, maxTargetRides);

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
                className={`absolute top-0 left-0 w-full h-2 rounded-t-2xl bg-linear-to-r ${reward.color}`}
              />

              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl bg-linear-to-r ${reward.color} mb-4`}
              >
                <Icon size={28} />
              </div>

              <h2 className="text-xl font-semibold text-orange-400">
                Complete {reward.rides} Rides
              </h2>

              <h3 className="text-lg mt-2">{reward.title}</h3>

              <p className="text-gray-400 text-sm mt-3">{reward.description}</p>

              <div className="mt-4 text-sm">
                {reward.isClaimed ? (
                  <span className="text-green-400 font-semibold">Claimed</span>
                ) : reward.isUnlocked ? (
                  <span className="text-yellow-300 font-semibold">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-gray-400">Locked</span>
                )}
              </div>

              <button
                onClick={() => handleOpen(reward)}
                className="mt-4 w-full bg-orange-500 hover:bg-orange-600 p-2 rounded-lg font-semibold"
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
              Reward Details
            </h2>

            {selectedReward.isClaimed ? (
              <p className="text-gray-200 leading-7">
                ✅ Reward already claimed for{" "}
                <span className="text-green-400 font-semibold">
                  {selectedReward.rides} rides
                </span>
                .
                <br />
                <span className="text-yellow-300 font-semibold">
                  {selectedReward.rewardMessage}
                </span>
              </p>
            ) : selectedReward.canClaim ? (
              <p className="text-gray-200 leading-7">
                🎉 You completed{" "}
                <span className="text-green-400 font-semibold">
                  {selectedReward.rides} rides
                </span>
                .
                <br />
                Claim your reward:{" "}
                <span className="text-yellow-300 font-semibold">
                  {selectedReward.rewardMessage}
                </span>
              </p>
            ) : (
              <p className="text-gray-300 leading-7">
                You have completed{" "}
                <span className="text-red-400 font-semibold">
                  {completedRides} rides
                </span>
                . Complete{" "}
                <span className="text-orange-400 font-semibold">
                  {selectedReward.rides} rides
                </span>{" "}
                to unlock this reward.
              </p>
            )}

            <div className="mt-5 p-4 rounded-xl border border-gray-700 bg-black/20">
              <p className="text-sm text-gray-300 mb-3">All target rides:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {rewards.map((reward) => (
                  <div
                    key={reward.rides}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                  >
                    <span>{reward.rides} rides</span>
                    {reward.isClaimed ? (
                      <span className="text-green-400">Claimed</span>
                    ) : reward.isUnlocked ? (
                      <span className="text-yellow-300">Unlocked</span>
                    ) : (
                      <span className="text-gray-500">Locked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {selectedReward.canClaim && (
                <button
                  onClick={handleClaimReward}
                  disabled={isClaiming}
                  className="w-full mb-3 bg-green-500 hover:bg-green-600 disabled:opacity-70 p-2 rounded-lg font-semibold"
                >
                  {isClaiming ? "Claiming..." : "Get Reward"}
                </button>
              )}

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
          Milestone Reward
        </h2>

        <p className="mt-3 text-gray-100 max-w-2xl">
          Complete 5, 10, 15 and 20 rides to unlock and claim your reward. Once
          you click &quot;View Reward&quot; and then &quot;Get Reward&quot;, you
          receive
          <span className="font-semibold"> 2 days for free rides</span> for each
          unlocked target.
        </p>

        <button
          onClick={() => toast.info("Open any milestone and click View Reward")}
          className="mt-6 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:scale-105 transition"
        >
          How To Claim
        </button>
      </div>

      <div className="mt-12 text-center text-gray-400 text-sm">
        Rewards are milestone-based and available after target completed rides.
      </div>

      <div className="mt-10 grid grid-cols-5 md:grid-cols-10 gap-3 max-w-4xl mx-auto">
        {Array.from({ length: 20 }).map((_, index) => {
          const completed = index < completedRides;
          const boxNumber = index + 1;

          return (
            <div
              key={index}
              className={`relative overflow-hidden flex items-center justify-center rounded-xl h-12 border ${
                completed
                  ? "bg-green-500/30 border-green-400"
                  : "bg-gray-800 border-gray-600"
              }`}
            >
              <span
                className={`absolute inset-0 flex items-center justify-center text-xl font-bold select-none ${
                  completed ? "text-green-100/30" : "text-gray-500/30"
                }`}
              >
                {boxNumber}
              </span>

              {completed ? (
                <CheckCircle
                  className="text-green-300 relative z-10"
                  size={18}
                />
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
  );
}

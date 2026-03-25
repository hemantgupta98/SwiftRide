"use client";

import { ArrowUpRight, Wallet, Download, Filter } from "lucide-react";
import { useEffect, useState } from "react";

type EarningsEntry = {
  id: string;
  date: string;
  amount: number;
  distanceKm: number;
  durationMinutes: number;
};

type PayoutEntry = {
  id: string;
  date: string;
  destination: string;
  amount: string;
  status: string;
};

const EARNINGS_STORAGE_KEY = "rider_earnings_history";
const PAYOUTS_STORAGE_KEY = "rider_payouts_history";

export default function EarningsPage() {
  const [earningsHistory, setEarningsHistory] = useState<EarningsEntry[]>([]);
  const [payoutsHistory, setPayoutsHistory] = useState<PayoutEntry[]>([]);
  const weeklyBarHeights = [
    "h-2/5",
    "h-3/5",
    "h-[55%]",
    "h-[70%]",
    "h-[90%]",
    "h-full",
    "h-[65%]",
  ];

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadEarnings = () => {
      try {
        const rawData = localStorage.getItem(EARNINGS_STORAGE_KEY);
        const parsedData = rawData ? JSON.parse(rawData) : [];
        setEarningsHistory(Array.isArray(parsedData) ? parsedData : []);
      } catch {
        setEarningsHistory([]);
      }
    };

    const loadPayouts = () => {
      try {
        const rawData = localStorage.getItem(PAYOUTS_STORAGE_KEY);
        const parsedData = rawData ? JSON.parse(rawData) : [];
        setPayoutsHistory(Array.isArray(parsedData) ? parsedData : []);
      } catch {
        setPayoutsHistory([]);
      }
    };

    loadEarnings();
    loadPayouts();
    window.addEventListener("storage", loadEarnings);
    window.addEventListener("storage", loadPayouts);

    return () => {
      window.removeEventListener("storage", loadEarnings);
      window.removeEventListener("storage", loadPayouts);
    };
  }, []);

  const completedRidesCount = earningsHistory.length;
  const totalEarnings = earningsHistory.reduce(
    (sum, entry) => sum + (Number.isFinite(entry.amount) ? entry.amount : 0),
    0,
  );
  const hasEarnings = totalEarnings > 0;

  return (
    <div className="min-h-screen bg-[#082c4c] text-white p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Earnings & Wallet</h1>
          <p className="text-gray-300 text-xs sm:text-sm">
            Track your revenue, bonuses, and manage your payouts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button className="flex items-center gap-2 border border-blue-400 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-900">
            <Download size={16} />
            Export CSV
          </button>

          <button className="flex items-center gap-2 border border-blue-400 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-900">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* WALLET CARD */}
        <div className="col-span-12 lg:col-span-8 bg-white text-black rounded-xl p-4 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Wallet size={16} />
                TOTAL EARNINGS
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                ₹{totalEarnings.toFixed(2)}
              </h2>

              <p className="text-sm mt-1 text-gray-600">
                {completedRidesCount > 0
                  ? `${completedRidesCount} rides completed`
                  : "No rides completed"}
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4 mt-6">
                <button className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-green-600 text-sm sm:text-base">
                  Withdraw Funds
                </button>

                <button className="bg-[#082c4c] text-white px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base">
                  Manage Bank Account
                </button>
              </div>
            </div>

            <div className="lg:border-l lg:pl-6 text-sm text-gray-500">
              <p className="mb-3">
                <span className="block text-gray-400 text-xs">
                  NEXT SCHEDULED PAYOUT
                </span>
                Monday, Oct 30
              </p>

              <p>
                <span className="block text-gray-400 text-xs">
                  LINKED ACCOUNT
                </span>
                Chase Bank (****4291)
              </p>
            </div>
          </div>
        </div>

        {/* WEEKLY OVERVIEW */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white text-black rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold mb-4">Weekly Overview</h3>

          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyBarHeights.map((heightClass, i) => (
              <div
                key={i}
                className={`bg-green-500 rounded w-6 ${heightClass}`}
              />
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            {completedRidesCount} Completed Rides{" "}
            <span className="text-green-600">
              ₹{totalEarnings.toFixed(2)} Total
            </span>
          </p>
        </div>

        {/* STATS */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white text-black rounded-xl p-5">
          <p className="text-sm text-gray-500">Base Pay</p>
          <h3 className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</h3>
          <p className="text-xs text-gray-400">
            {completedRidesCount > 0
              ? `${completedRidesCount} Rides Completed`
              : "No rides completed"}
          </p>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white text-black rounded-xl p-5">
          <p className="text-sm text-gray-500">Tips</p>
          <h3 className="text-2xl font-bold">$265.50</h3>
          <p className="text-xs text-gray-400">High Rating Bonus Included</p>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white text-black rounded-xl p-5">
          <p className="text-sm text-gray-500">Bonuses</p>
          <h3 className="text-2xl font-bold">$130.00</h3>
          <p className="text-xs text-gray-400">Weekly Surge Participation</p>
        </div>

        {/* PAYOUT HISTORY */}
        <div className="col-span-12 bg-white text-black rounded-xl p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Payout History</h3>
              <p className="text-gray-500 text-sm">
                Your last 5 successful withdrawals
              </p>
            </div>

            <button className="text-green-600 flex items-center gap-1 text-sm">
              View Full History
              <ArrowUpRight size={14} />
            </button>
          </div>

          {payoutsHistory.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="font-semibold text-gray-700">No payouts yet</p>
              <p className="text-sm text-gray-500">
                You have not withdrawn money yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-sm">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="text-left py-2">Transaction ID</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Destination</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payoutsHistory.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-3">{p.id}</td>
                      <td>{p.date}</td>
                      <td>{p.destination}</td>
                      <td>{p.amount}</td>
                      <td>
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Transfers typically take 1-3 business days depending on your
            bank&apos;s processing time.
          </p>
        </div>

        {/* BOTTOM CARDS */}
        <div className="col-span-12 md:col-span-6 bg-[#0d3a63] rounded-xl p-6">
          <h4 className="font-semibold">Payout Issue?</h4>
          <p className="text-sm text-gray-300">
            Contact our financial support team available 24/7.
          </p>
        </div>

        <div className="col-span-12 md:col-span-6 bg-[#0d3a63] rounded-xl p-6">
          <h4 className="font-semibold">Payment Settings</h4>
          <p className="text-sm text-gray-300">
            Update bank details and automatic withdrawal rules.
          </p>
        </div>

        <div className="col-span-12 bg-white text-black rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold text-lg">Earnings History</h3>
          <p className="text-gray-500 text-sm">
            Completed rides with amount, distance, and duration.
          </p>

          {earningsHistory.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="font-semibold text-gray-700">No earnings yet</p>
              <p className="text-sm text-gray-500">
                No rides completed or ₹0.00 earned
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount Earned</th>
                    <th className="text-left py-2">Distance</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsHistory.map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="py-3">{entry.date}</td>
                      <td className="font-semibold text-green-600">
                        ₹{entry.amount.toFixed(2)}
                      </td>
                      <td>{entry.distanceKm.toFixed(2)} km</td>
                      <td>{entry.durationMinutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-right">
            <p className="text-sm text-gray-600">Total Earning</p>
            <p
              className={`text-xl font-bold ${hasEarnings ? "text-green-600" : "text-gray-700"}`}
            >
              ₹{totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

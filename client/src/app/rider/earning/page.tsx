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

const EARNINGS_STORAGE_KEY = "rider_earnings_history";

export default function EarningsPage() {
  const [earningsHistory, setEarningsHistory] = useState<EarningsEntry[]>([]);
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

    loadEarnings();
    window.addEventListener("storage", loadEarnings);

    return () => {
      window.removeEventListener("storage", loadEarnings);
    };
  }, []);

  const payouts = [
    {
      id: "TX-9082",
      date: "Oct 24, 2023",
      destination: "Chase Bank (****4291)",
      amount: "$1,250.00",
      status: "Completed",
    },
    {
      id: "TX-8921",
      date: "Oct 17, 2023",
      destination: "Chase Bank (****4291)",
      amount: "$980.50",
      status: "Completed",
    },
    {
      id: "TX-8810",
      date: "Oct 10, 2023",
      destination: "Chase Bank (****4291)",
      amount: "$1,105.20",
      status: "Completed",
    },
    {
      id: "TX-8755",
      date: "Oct 03, 2023",
      destination: "Chase Bank (****4291)",
      amount: "$840.00",
      status: "Completed",
    },
    {
      id: "TX-8642",
      date: "Sep 26, 2023",
      destination: "Chase Bank (****4291)",
      amount: "$1,420.75",
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-[#082c4c] text-white p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Earnings & Wallet</h1>
          <p className="text-gray-300 text-sm">
            Track your revenue, bonuses, and manage your payouts.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-900">
            <Download size={16} />
            Export CSV
          </button>

          <button className="flex items-center gap-2 border border-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-900">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* WALLET CARD */}
        <div className="col-span-8 bg-white text-black rounded-xl p-6">
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Wallet size={16} />
                WALLET BALANCE
              </div>

              <h2 className="text-4xl font-bold mt-2">$1,240.50</h2>

              <p className="text-green-600 text-sm mt-1">
                +12.5% from last week
              </p>

              <div className="flex gap-4 mt-6">
                <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600">
                  Withdraw Funds
                </button>

                <button className="bg-[#082c4c] text-white px-6 py-2 rounded-lg font-medium">
                  Manage Bank Account
                </button>
              </div>
            </div>

            <div className="border-l pl-6 text-sm text-gray-500">
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
        <div className="col-span-4 bg-white text-black rounded-xl p-6">
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
            32.5 Total Hours{" "}
            <span className="text-green-600">$1,500 Total</span>
          </p>
        </div>

        {/* STATS */}
        <div className="col-span-4 bg-white text-black rounded-xl p-5">
          <p className="text-sm text-gray-500">Base Pay</p>
          <h3 className="text-2xl font-bold">$845.00</h3>
          <p className="text-xs text-gray-400">72 Trips Completed</p>
        </div>

        <div className="col-span-4 bg-white text-black rounded-xl p-5">
          <p className="text-sm text-gray-500">Tips</p>
          <h3 className="text-2xl font-bold">$265.50</h3>
          <p className="text-xs text-gray-400">High Rating Bonus Included</p>
        </div>

        <div className="col-span-4 bg-white text-black rounded-xl p-5">
          <p className="text-sm text-gray-500">Bonuses</p>
          <h3 className="text-2xl font-bold">$130.00</h3>
          <p className="text-xs text-gray-400">Weekly Surge Participation</p>
        </div>

        {/* PAYOUT HISTORY */}
        <div className="col-span-12 bg-white text-black rounded-xl p-6">
          <div className="flex justify-between mb-4">
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

          <table className="w-full text-sm">
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
              {payouts.map((p) => (
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

          <p className="text-xs text-gray-500 mt-4">
            Transfers typically take 1-3 business days depending on your
            bank&apos;s processing time.
          </p>
        </div>

        {/* BOTTOM CARDS */}
        <div className="col-span-6 bg-[#0d3a63] rounded-xl p-6">
          <h4 className="font-semibold">Payout Issue?</h4>
          <p className="text-sm text-gray-300">
            Contact our financial support team available 24/7.
          </p>
        </div>

        <div className="col-span-6 bg-[#0d3a63] rounded-xl p-6">
          <h4 className="font-semibold">Payment Settings</h4>
          <p className="text-sm text-gray-300">
            Update bank details and automatic withdrawal rules.
          </p>
        </div>

        <div className="col-span-12 bg-white text-black rounded-xl p-6">
          <h3 className="font-semibold text-lg">Earnings History</h3>
          <p className="text-gray-500 text-sm">
            Completed rides with amount, distance, and duration.
          </p>

          {earningsHistory.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="font-semibold text-gray-700">No earnings yet</p>
              <p className="text-sm text-gray-500">
                Start riding to earn money
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
        </div>
      </div>
    </div>
  );
}

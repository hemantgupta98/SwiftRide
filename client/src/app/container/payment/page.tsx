/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Wallet, CreditCard, QrCode, Landmark } from "lucide-react";
import Image from "next/image";

const Page = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  const addMoney = () => {
    if (!amount) return;

    const newBalance = balance + Number(amount);
    setBalance(newBalance);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-yellow-100 to-orange-300 py-10">
      {/* Container */}

      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}

        <h1 className="text-3xl font-bold text-orange-600 mb-8">
          SwiftRide Wallet & Payments
        </h1>

        {/* Wallet + Discount */}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Wallet Card */}

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="text-orange-500" size={30} />
              <h2 className="text-xl font-semibold">Your Wallet Balance</h2>
            </div>

            <p className="text-3xl font-bold text-green-600 mb-2">
              ₹ {balance}
            </p>

            <p className="text-gray-600 text-sm">
              Use your wallet balance to pay for rides.
            </p>
          </div>

          {/* Discount Message */}

          <div className="bg-green-100 border border-green-300 rounded-xl p-6">
            <p className="text-green-800 font-medium text-lg">
              🎉 Pay for rides using your wallet balance and get
              <span className="font-bold"> 5% discount on every ride</span>
            </p>

            <p className="text-red-600 text-sm mt-3">
              ❗ Cash payments are not eligible for discounts.
            </p>
          </div>
        </div>

        {/* Add Money */}

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Add Money to Wallet</h3>

          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-3 rounded-lg w-full"
            />

            <button
              onClick={addMoney}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
            >
              Add Money
            </button>
          </div>
        </div>

        {/* Payment Methods */}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Bank */}

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
            <div className="flex items-center gap-2 mb-3">
              <Landmark className="text-blue-500" />
              <h4 className="font-semibold text-lg">Bank Account</h4>
            </div>

            <p className="text-gray-600 text-sm">
              Add money directly from your bank account using secure payment.
            </p>

            <button className="mt-5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full">
              Pay via Bank
            </button>
          </div>

          {/* UPI */}

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="text-purple-500" />
              <h4 className="font-semibold text-lg">UPI ID</h4>
            </div>

            <input
              placeholder="Enter UPI ID (example@upi)"
              className="border p-2 rounded-md w-full text-sm"
            />

            <button className="mt-5 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg w-full">
              Pay via UPI
            </button>
          </div>

          {/* QR */}

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition text-center">
            <div className="flex justify-center items-center gap-2 mb-3">
              <QrCode className="text-green-600" />
              <h4 className="font-semibold text-lg">Scan QR</h4>
            </div>

            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=swift@upi"
              alt="UPI QR"
              className="mx-auto"
            />

            <p className="text-sm text-gray-500 mt-2">Scan using any UPI app</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

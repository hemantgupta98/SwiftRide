"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  CreditCard,
  Gift,
  RefreshCcw,
  Trash2,
} from "lucide-react";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  time: string;
  read: boolean;
};

const Page = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Ride Completed",
      message: "Your ride from Main Road to Airport has been completed.",
      type: "ride-success",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Ride Failed",
      message: "Driver cancelled your ride due to location issue.",
      type: "ride-failed",
      time: "10 min ago",
      read: false,
    },
    {
      id: 3,
      title: "Payment Successful",
      message: "₹120 has been deducted from your wallet.",
      type: "payment",
      time: "20 min ago",
      read: false,
    },
    {
      id: 4,
      title: "Reward Unlocked",
      message: "Congratulations! You unlocked 20% discount coupon.",
      type: "reward",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 5,
      title: "App Update",
      message: "New features added. Please update the app.",
      type: "update",
      time: "3 hours ago",
      read: false,
    },
    {
      id: 6,
      title: "Special Offer",
      message: "Get 40% OFF on your next 5 rides.",
      type: "offer",
      time: "Yesterday",
      read: false,
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "ride-success":
        return <CheckCircle className="text-green-500" />;
      case "ride-failed":
        return <XCircle className="text-red-500" />;
      case "payment":
        return <CreditCard className="text-blue-500" />;
      case "reward":
        return <Gift className="text-purple-500" />;
      case "update":
        return <RefreshCcw className="text-yellow-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Bell size={28} />
            <h1 className="text-2xl font-bold">Notifications</h1>

            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <button
            onClick={clearAll}
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
            Clear All
          </button>
        </div>

        {/* Notification List */}

        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No Notifications
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition 
                ${n.read ? "bg-gray-100" : "bg-indigo-50 border-indigo-300"}`}
              >
                <div className="mt-1">{getIcon(n.type)}</div>

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{n.title}</h2>
                  <p className="text-gray-600 text-sm">{n.message}</p>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>

                {!n.read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

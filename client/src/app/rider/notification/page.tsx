"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock3,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";

type RiderNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const Page = () => {
  const [notifications, setNotifications] = useState<RiderNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const typeTitleMap: Record<string, string> = {
    RIDE_COMES: "Ride Comes",
    RIDE_ACCEPTED: "Ride Accepted",
    RIDE_CANCELLED: "Ride Cancelled",
    RIDE_TIMEOUT: "Ride Timed Out",
    RIDE_TAKEN: "Ride Taken",
    RIDE_DECLINED: "Ride Declined",
  };

  const formatTime = (isoDate: string) => {
    const timestamp = new Date(isoDate).getTime();
    if (!Number.isFinite(timestamp)) return "Just now";

    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return "Just now";

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day ago`;

    return new Date(isoDate).toLocaleDateString();
  };

  const fetchNotifications = async () => {
    const response = await api.get("/ride-notification");
    const list = Array.isArray(response.data?.data) ? response.data.data : [];
    setNotifications(list as RiderNotification[]);
  };

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      try {
        await fetchNotifications();
      } catch {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/ride-notification/${id}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch {
      return;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/ride-notification/${id}`);
      setNotifications((current) =>
        current.filter((notification) => notification._id !== id),
      );
    } catch {
      return;
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/ride-notification");
      setNotifications([]);
    } catch {
      return;
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "RIDE_ACCEPTED":
        return <CheckCircle className="text-green-500" />;
      case "RIDE_TIMEOUT":
        return <Clock3 className="text-orange-500" />;
      case "RIDE_CANCELLED":
      case "RIDE_TAKEN":
        return <XCircle className="text-red-500" />;
      case "RIDE_DECLINED":
        return <RefreshCcw className="text-yellow-500" />;
      case "RIDE_COMES":
        return <Bell className="text-blue-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Bell size={28} />
            <h1 className="text-2xl font-bold">Rider Notifications</h1>

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

        {isLoading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No Rider Notifications
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition 
                ${n.isRead ? "bg-gray-100" : "bg-indigo-50 border-indigo-300"}`}
              >
                <div className="mt-1">{getIcon(n.type)}</div>

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">
                    {n.title || typeTitleMap[n.type] || "Notification"}
                  </h2>
                  <p className="text-gray-600 text-sm">{n.message}</p>
                  <span className="text-xs text-gray-400">
                    {formatTime(n.createdAt)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void deleteNotification(n._id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>

                {!n.isRead && (
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

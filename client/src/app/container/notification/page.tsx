"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  CreditCard,
  Gift,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";

type CustomerNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const AUTO_NOTIFICATION_TYPES = new Set([
  "PASS_PROGRESS",
  "PASS_UNLOCKED",
  "REWARD_UNLOCKED",
]);

const DISMISSED_AUTO_NOTIFICATIONS_KEY = "dismissed_auto_notifications";

const Page = () => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const typeTitleMap: Record<string, string> = {
    RIDE_BOOKED: "Ride Booked",
    RIDE_ACCEPTED: "Ride Accepted",
    RIDE_CANCELLED: "Ride Cancelled",
    RIDE_COMPLETED: "Ride Completed",
    RIDE_TIMEOUT: "Ride Not Assigned",
    PASS_PROGRESS: "Ride Pass Progress",
    PASS_UNLOCKED: "Ride Pass Unlocked",
    REWARD_UNLOCKED: "Reward Unlocked",
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

  const fetchNotifications = useCallback(async () => {
    const response = await api.get("/notification");
    const list = Array.isArray(response.data?.data) ? response.data.data : [];
    return list as CustomerNotification[];
  }, []);

  const getAutoNotificationSignature = (
    payload: Pick<CustomerNotification, "type" | "message">,
  ) => `${payload.type}::${payload.message}`;

  const getDismissedAutoNotifications = () => {
    if (typeof window === "undefined") {
      return new Set<string>();
    }

    const raw = localStorage.getItem(DISMISSED_AUTO_NOTIFICATIONS_KEY);
    if (!raw) {
      return new Set<string>();
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set<string>();
    }
  };

  const addDismissedAutoNotification = (
    payload: Pick<CustomerNotification, "type" | "message">,
  ) => {
    if (typeof window === "undefined") {
      return;
    }

    const current = getDismissedAutoNotifications();
    current.add(getAutoNotificationSignature(payload));
    localStorage.setItem(
      DISMISSED_AUTO_NOTIFICATIONS_KEY,
      JSON.stringify(Array.from(current)),
    );
  };

  const createIfMissing = useCallback(
    async (
      existing: CustomerNotification[],
      payload: { type: string; title: string; message: string },
    ) => {
      const exists = existing.some(
        (notification) =>
          notification.type === payload.type &&
          notification.message === payload.message,
      );

      const dismissed = getDismissedAutoNotifications().has(
        getAutoNotificationSignature({
          type: payload.type,
          message: payload.message,
        }),
      );

      if (!exists && !dismissed) {
        await api.post("/notification", payload);
      }
    },
    [],
  );

  const syncPassAndRewardNotifications = useCallback(
    async (existing: CustomerNotification[]) => {
      const response = await api.get("/ride/history");
      const rides = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      const completedRides = rides.filter(
        (ride: { status?: string }) => ride.status === "completed",
      ).length;

      if (completedRides < 5) {
        const remaining = 5 - completedRides;
        await createIfMissing(existing, {
          type: "PASS_PROGRESS",
          title: "Ride Pass Progress",
          message: `Complete ${remaining} more rides to unlock your ride pass.`,
        });
        return;
      }

      await createIfMissing(existing, {
        type: "PASS_UNLOCKED",
        title: "Ride Pass Unlocked",
        message: "Congratulations! Your ride pass is unlocked.",
      });

      if (completedRides >= 10) {
        await createIfMissing(existing, {
          type: "REWARD_UNLOCKED",
          title: "Reward Unlocked",
          message: "Great work! You unlocked a rewards milestone.",
        });
      }
    },
    [createIfMissing],
  );

  useEffect(() => {
    void (async () => {
      setIsLoading(true);

      try {
        const list = await fetchNotifications();
        await syncPassAndRewardNotifications(list);
        const refreshedList = await fetchNotifications();
        setNotifications(refreshedList);
      } catch {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchNotifications, syncPassAndRewardNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notification/${id}/read`);
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
      const deletedNotification = notifications.find(
        (notification) => notification._id === id,
      );

      await api.delete(`/notification/${id}`);

      if (
        deletedNotification &&
        AUTO_NOTIFICATION_TYPES.has(deletedNotification.type)
      ) {
        addDismissedAutoNotification({
          type: deletedNotification.type,
          message: deletedNotification.message,
        });
      }

      setNotifications((current) =>
        current.filter((notification) => notification._id !== id),
      );
    } catch {
      return;
    }
  };

  const clearAll = async () => {
    try {
      notifications.forEach((notification) => {
        if (AUTO_NOTIFICATION_TYPES.has(notification.type)) {
          addDismissedAutoNotification({
            type: notification.type,
            message: notification.message,
          });
        }
      });

      await api.delete("/notification");
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
      case "RIDE_COMPLETED":
        return <CheckCircle className="text-green-500" />;
      case "RIDE_CANCELLED":
      case "RIDE_TIMEOUT":
        return <XCircle className="text-red-500" />;
      case "RIDE_BOOKED":
      case "RIDE_ACCEPTED":
        return <CreditCard className="text-blue-500" />;
      case "REWARD_UNLOCKED":
      case "PASS_UNLOCKED":
      case "PASS_PROGRESS":
        return <Gift className="text-purple-500" />;
      case "update":
        return <RefreshCcw className="text-yellow-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 p-8">
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

        {isLoading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No Notifications
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

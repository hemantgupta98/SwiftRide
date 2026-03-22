"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Navigation, DollarSign, Star, TrendingUp } from "lucide-react";
import { socket } from "../../../../lib/socket";

const EARNINGS_STORAGE_KEY = "rider_earnings_history";

type EarningsEntry = {
  id: string;
  date: string;
  amount: number;
  distanceKm: number;
  durationMinutes: number;
  startedAt: string;
  endedAt: string;
};

type RideRequestPayload = {
  rideId: string;
  pickup: {
    coordinates: [number, number];
    label?: string;
  };
  drop: {
    coordinates: [number, number];
    label?: string;
  };
  distanceKm: number;
  fareAmount: number;
  estimatedMinutes: number;
  timeoutSeconds: number;
  message?: string;
};

const parseUserIdFromToken = (token: string) => {
  try {
    const base64UrlPayload = token.split(".")[1] || "";
    const base64Payload = base64UrlPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(base64UrlPayload.length / 4) * 4, "=");

    const payload = JSON.parse(atob(base64Payload));
    return payload?.id ? String(payload.id) : null;
  } catch {
    return null;
  }
};

const formatCoordinates = (
  coordinates?: [number, number],
  fallback = "N/A",
) => {
  if (!coordinates || coordinates.length !== 2) {
    return fallback;
  }

  const [lng, lat] = coordinates;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

export default function RideControlPage() {
  const [activeRide, setActiveRide] = useState<RideRequestPayload | null>(null);
  const [ongoingRide, setOngoingRide] = useState<RideRequestPayload | null>(
    null,
  );
  const [countdown, setCountdown] = useState<number>(0);
  const [serverMessage, setServerMessage] = useState<string>(
    "Waiting for new ride request",
  );
  const [earningsHistory, setEarningsHistory] = useState<EarningsEntry[]>([]);
  const activeRideRef = useRef<RideRequestPayload | null>(null);

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

  useEffect(() => {
    activeRideRef.current = activeRide;
  }, [activeRide]);

  const persistCompletedRide = (ridePayload: RideRequestPayload) => {
    if (typeof window === "undefined") {
      return;
    }

    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + ridePayload.estimatedMinutes * 60 * 1000,
    );

    const completedEntry: EarningsEntry = {
      id: `${ridePayload.rideId}-${startTime.getTime()}`,
      date: startTime.toLocaleDateString(),
      amount: ridePayload.fareAmount,
      distanceKm: ridePayload.distanceKm,
      durationMinutes: Math.max(
        1,
        Math.round((endTime.getTime() - startTime.getTime()) / 60000),
      ),
      startedAt: startTime.toISOString(),
      endedAt: endTime.toISOString(),
    };

    try {
      const existingRaw = localStorage.getItem(EARNINGS_STORAGE_KEY);
      const existingParsed = existingRaw ? JSON.parse(existingRaw) : [];
      const safeEntries = Array.isArray(existingParsed) ? existingParsed : [];

      localStorage.setItem(
        EARNINGS_STORAGE_KEY,
        JSON.stringify([completedEntry, ...safeEntries]),
      );
    } catch {
      localStorage.setItem(
        EARNINGS_STORAGE_KEY,
        JSON.stringify([completedEntry]),
      );
    }
  };

  const riderId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("token") || "";
    return parseUserIdFromToken(token);
  }, []);

  useEffect(() => {
    socket.connect();

    const sendLiveLocation = () => {
      if (
        !riderId ||
        typeof navigator === "undefined" ||
        !navigator.geolocation
      ) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;

          socket.emit("registerRider", {
            riderId,
            location: {
              lng: longitude,
              lat: latitude,
            },
          });

          socket.emit("updateRiderLocation", {
            riderId,
            lng: longitude,
            lat: latitude,
            isOnline: true,
          });
        },
        () => {
          socket.emit("registerRider", { riderId });
          setServerMessage(
            "Location permission denied. You may not receive nearby requests.",
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        },
      );
    };

    const onConnect = () => {
      setServerMessage("Connected. Waiting for new ride request");

      if (riderId) {
        sendLiveLocation();
      } else {
        setServerMessage("Rider session not found. Please login again.");
      }
    };

    const onNewRideRequest = (payload: RideRequestPayload) => {
      setActiveRide(payload);
      setCountdown(payload.timeoutSeconds || 12);
      setServerMessage(payload.message || "New ride request received");
    };

    const onRideTaken = () => {
      setServerMessage("Ride was accepted by another rider");
      setActiveRide(null);
      setCountdown(0);
    };

    const onRideAcceptSuccess = () => {
      if (activeRideRef.current) {
        setOngoingRide(activeRideRef.current);
      }

      setServerMessage("Ride accepted. Complete the ride after drop-off.");
      setActiveRide(null);
      setCountdown(0);
    };

    const onRideNoRider = () => {
      setServerMessage("No rider accepted this request in time");
      setActiveRide(null);
      setCountdown(0);
    };

    const onRideAcceptFailed = (payload: { message?: string }) => {
      setServerMessage(payload?.message || "Ride is no longer available");
      setActiveRide(null);
      setCountdown(0);
    };

    const onRiderRegistrationFailed = (payload: { message?: string }) => {
      setServerMessage(payload?.message || "Rider registration failed");
      setActiveRide(null);
      setCountdown(0);
    };

    socket.on("connect", onConnect);
    socket.on("newRideRequest", onNewRideRequest);
    socket.on("rideTaken", onRideTaken);
    socket.on("rideAcceptSuccess", onRideAcceptSuccess);
    socket.on("rideNoRider", onRideNoRider);
    socket.on("rideAcceptFailed", onRideAcceptFailed);
    socket.on("riderRegistrationFailed", onRiderRegistrationFailed);
    socket.on("connect_error", () => {
      setServerMessage("Socket connection failed. Check backend URL/CORS.");
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("newRideRequest", onNewRideRequest);
      socket.off("rideTaken", onRideTaken);
      socket.off("rideAcceptSuccess", onRideAcceptSuccess);
      socket.off("rideNoRider", onRideNoRider);
      socket.off("rideAcceptFailed", onRideAcceptFailed);
      socket.off("riderRegistrationFailed", onRiderRegistrationFailed);
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [riderId]);

  useEffect(() => {
    if (!activeRide || countdown <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setCountdown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [activeRide, countdown]);

  const handleAcceptRide = () => {
    if (!activeRide || !riderId) {
      return;
    }

    socket.emit("acceptRide", {
      rideId: activeRide.rideId,
      riderId,
    });
  };

  const handleDeclineRide = () => {
    if (!activeRide || !riderId) {
      return;
    }

    socket.emit("declineRide", {
      rideId: activeRide.rideId,
      riderId,
    });

    setServerMessage("Ride declined. Waiting for next request...");
    setActiveRide(null);
    setCountdown(0);
  };

  const handleCompleteRide = () => {
    if (!ongoingRide) {
      return;
    }

    persistCompletedRide(ongoingRide);
    setOngoingRide(null);
    setServerMessage("Ride completed. Earnings added to your history.");
  };

  const todayDateString = new Date().toDateString();

  const todaysEarnings = earningsHistory.reduce((sum, entry) => {
    const entryDate = entry.startedAt
      ? new Date(entry.startedAt)
      : new Date(entry.date);

    if (Number.isNaN(entryDate.getTime())) {
      return sum;
    }

    return entryDate.toDateString() === todayDateString
      ? sum + (Number.isFinite(entry.amount) ? entry.amount : 0)
      : sum;
  }, 0);

  const totalTrips = earningsHistory.length;
  const dailyGoal = 200;
  const progressPercent = Math.min((todaysEarnings / dailyGoal) * 100, 100);

  const pickupText =
    activeRide?.pickup.label ||
    formatCoordinates(activeRide?.pickup.coordinates);
  const dropText =
    activeRide?.drop.label || formatCoordinates(activeRide?.drop.coordinates);

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#0b2a52] to-[#071b35] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT MAIN RIDE REQUEST CARD */}

        <div className="lg:col-span-2">
          <div className="bg-white text-black rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold uppercase">
                  {activeRide ? "New Request" : "Standby"}
                </span>

                <h1 className="text-3xl font-bold mt-3 text-[#0b2a52]">
                  {activeRide ? "Live Ride Opportunity" : "Waiting for Request"}
                </h1>
              </div>

              <span className="text-gray-500 text-lg font-semibold">
                {activeRide ? `${countdown}s` : "--"}
              </span>
            </div>

            {/* Locations */}

            <div className="bg-gray-100 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold">
                    PICKUP LOCATION
                  </p>
                  <p className="font-semibold text-[#0b2a52]">{pickupText}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-2"></div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold">
                    DROP-OFF DESTINATION
                  </p>
                  <p className="font-semibold text-[#0b2a52]">{dropText}</p>
                </div>
              </div>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center">
                <Clock size={20} className="text-green-500 mb-1" />
                <p className="text-xs text-gray-500">EST. TIME</p>
                <p className="font-bold">
                  {activeRide ? `${activeRide.estimatedMinutes} mins` : "--"}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center">
                <Navigation size={20} className="text-green-500 mb-1" />
                <p className="text-xs text-gray-500">DISTANCE</p>
                <p className="font-bold">
                  {activeRide ? `${activeRide.distanceKm.toFixed(2)} km` : "--"}
                </p>
              </div>

              <div className="bg-green-200 p-4 rounded-xl flex flex-col items-center">
                <DollarSign size={20} className="text-green-700 mb-1" />
                <p className="text-xs text-green-700">YOUR FARE</p>
                <p className="font-bold text-green-800 text-lg">
                  {activeRide ? `₹${activeRide.fareAmount.toFixed(2)}` : "--"}
                </p>
              </div>
            </div>

            {/* Rider Info */}

            <div className="flex justify-between text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                Status: {serverMessage}
                <Star size={14} className="text-yellow-400" />
                <span>{activeRide ? "Live" : "Idle"}</span>
              </div>

              <span>
                {activeRide ? `Ride #${activeRide.rideId.slice(-6)}` : "-"}
              </span>
            </div>

            {/* Buttons */}

            <div className="flex gap-4">
              <button
                onClick={handleAcceptRide}
                disabled={!activeRide || countdown <= 0}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition"
              >
                ACCEPT RIDE
              </button>

              <button
                onClick={handleDeclineRide}
                disabled={!activeRide}
                className="w-40 bg-[#0b2a52] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold"
              >
                REJECT
              </button>
            </div>

            {ongoingRide && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  Accepted ride in progress • Fare ₹
                  {ongoingRide.fareAmount.toFixed(2)}
                </p>
                <button
                  onClick={handleCompleteRide}
                  className="mt-3 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                >
                  COMPLETE RIDE
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-400 text-center mt-4 text-sm">
            Accepting this ride will maintain your 100% acceptance rate today.
          </p>
        </div>

        {/* RIGHT SIDEBAR CONTENT */}

        <div className="space-y-6">
          {/* Today Progress */}

          <div className="bg-[#1b345a] rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Today&apos;s Progress</h3>
              <TrendingUp size={18} />
            </div>

            <div className="flex justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">EARNINGS</p>
                <p className="text-2xl font-bold">
                  ₹{todaysEarnings.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">TRIPS</p>
                <p className="text-2xl font-bold">{totalTrips}</p>
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {Math.round(progressPercent)}% of ₹{dailyGoal} daily goal reached
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

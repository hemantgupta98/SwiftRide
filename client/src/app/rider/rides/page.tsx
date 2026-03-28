"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Navigation,
  DollarSign,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { socket } from "../../../../lib/socket";
import { playHindiRideAlert } from "../../../../lib/rideAlertAudio";
import { Toaster, toast } from "sonner";

const EARNINGS_STORAGE_KEY = "rider_earnings_history";
const RIDER_PENDING_RIDE_REQUEST_KEY = "rider_pending_ride_request";
const RIDE_REQUEST_WAIT_SECONDS = 30;

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
  customerId?: string;
  pickupLocation?: {
    coordinates: [number, number];
    label?: string;
  };
  dropLocation?: {
    coordinates: [number, number];
    label?: string;
  };
  distance?: number;
  fare?: number;
  estimatedTime?: number;
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

const RIDER_ACTIVE_RIDE_STORAGE_KEY = "rider_active_navigation_ride";

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
  const router = useRouter();
  const [activeRide, setActiveRide] = useState<RideRequestPayload | null>(null);
  const [ongoingRide, setOngoingRide] = useState<RideRequestPayload | null>(
    null,
  );
  const [countdown, setCountdown] = useState<number>(0);
  const [isRidePopupVisible, setIsRidePopupVisible] = useState(false);
  const [isAcceptingRide, setIsAcceptingRide] = useState(false);
  const [serverMessage, setServerMessage] = useState<string>(
    "Waiting for new ride request",
  );
  const [earningsHistory, setEarningsHistory] = useState<EarningsEntry[]>([]);
  const activeRideRef = useRef<RideRequestPayload | null>(null);
  const countdownRef = useRef<number>(0);
  const rideAlertLoopRef = useRef<number | null>(null);

  const stopRideAlertLoop = useCallback(() => {
    if (rideAlertLoopRef.current !== null) {
      window.clearInterval(rideAlertLoopRef.current);
      rideAlertLoopRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const startRideAlertLoop = useCallback(() => {
    if (rideAlertLoopRef.current !== null) {
      return;
    }

    playHindiRideAlert();

    rideAlertLoopRef.current = window.setInterval(() => {
      if (!activeRideRef.current || countdownRef.current <= 0) {
        stopRideAlertLoop();
        return;
      }

      playHindiRideAlert();
    }, 2000);
  }, [stopRideAlertLoop]);

  const normalizeRidePayload = (payload: RideRequestPayload) => {
    const pickupLocation = payload.pickupLocation || payload.pickup;
    const dropLocation = payload.dropLocation || payload.drop;

    return {
      ...payload,
      pickup: pickupLocation,
      drop: dropLocation,
      pickupLocation,
      dropLocation,
      distanceKm: Number(payload.distance ?? payload.distanceKm ?? 0),
      fareAmount: Number(payload.fare ?? payload.fareAmount ?? 0),
      estimatedMinutes: Number(
        payload.estimatedTime ?? payload.estimatedMinutes ?? 0,
      ),
      timeoutSeconds: Number(
        payload.timeoutSeconds || RIDE_REQUEST_WAIT_SECONDS,
      ),
    };
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const pendingRide = localStorage.getItem(RIDER_PENDING_RIDE_REQUEST_KEY);
    if (!pendingRide) {
      return;
    }

    try {
      const parsedPayload = JSON.parse(pendingRide) as RideRequestPayload;
      const normalizedPayload = normalizeRidePayload(parsedPayload);
      setActiveRide(normalizedPayload);
      setCountdown(
        normalizedPayload.timeoutSeconds || RIDE_REQUEST_WAIT_SECONDS,
      );
      setIsRidePopupVisible(true);
      setServerMessage("New ride request received");
      playHindiRideAlert();
    } catch {
      setServerMessage("Failed to load pending ride request.");
    } finally {
      localStorage.removeItem(RIDER_PENDING_RIDE_REQUEST_KEY);
    }
  }, []);

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

  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  useEffect(() => {
    if (activeRide && countdown > 0) {
      startRideAlertLoop();
      return;
    }

    stopRideAlertLoop();
  }, [activeRide, countdown, startRideAlertLoop, stopRideAlertLoop]);

  useEffect(() => {
    return () => {
      stopRideAlertLoop();
    };
  }, [stopRideAlertLoop]);

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
      const normalizedPayload = normalizeRidePayload(payload);
      setActiveRide(normalizedPayload);
      setCountdown(
        normalizedPayload.timeoutSeconds || RIDE_REQUEST_WAIT_SECONDS,
      );
      setIsRidePopupVisible(true);
      setServerMessage(payload.message || "New ride request received");
      setIsAcceptingRide(false);
      playHindiRideAlert();
      if (typeof window !== "undefined") {
        localStorage.removeItem(RIDER_PENDING_RIDE_REQUEST_KEY);
      }
      toast("New ride request received");
    };

    const onRideTaken = () => {
      setServerMessage("Ride was accepted by another rider");
      setActiveRide(null);
      setCountdown(0);
      setIsRidePopupVisible(false);
      setIsAcceptingRide(false);

      if (typeof window !== "undefined") {
        localStorage.removeItem(RIDER_ACTIVE_RIDE_STORAGE_KEY);
      }

      toast.info("Ride already accepted by another rider.");
    };

    const onRideAcceptSuccess = () => {
      if (activeRideRef.current && riderId) {
        const acceptedRide = activeRideRef.current;
        setOngoingRide(acceptedRide);

        // Store ride with riderId for verification in navigation page
        localStorage.setItem(
          RIDER_ACTIVE_RIDE_STORAGE_KEY,
          JSON.stringify({ ...acceptedRide, riderId }),
        );
      }

      setServerMessage("Ride accepted. Complete the ride after drop-off.");
      setActiveRide(null);
      setCountdown(0);
      setIsRidePopupVisible(false);
      setIsAcceptingRide(false);
      toast.success("Ride accepted. Opening navigation.");
      router.push("/rider/navigation");
    };

    const onRideCancelled = (payload: {
      rideId?: string;
      message?: string;
    }) => {
      const cancelledRideId = payload?.rideId;

      if (!cancelledRideId) {
        return;
      }

      const isActiveRideCancelled =
        activeRideRef.current?.rideId === cancelledRideId ||
        ongoingRide?.rideId === cancelledRideId;

      if (!isActiveRideCancelled) {
        return;
      }

      setServerMessage("Customer cancelled the ride. Sorry!");
      setActiveRide(null);
      setOngoingRide(null);
      setCountdown(0);
      setIsRidePopupVisible(false);
      setIsAcceptingRide(false);

      if (typeof window !== "undefined") {
        localStorage.removeItem(RIDER_ACTIVE_RIDE_STORAGE_KEY);
      }

      toast.error(payload?.message || "Customer cancelled the ride. Sorry!");
    };

    const onRideNoRider = () => {
      setServerMessage("No rider accepted this request in time");
      setActiveRide(null);
      setCountdown(0);
      setIsRidePopupVisible(false);
      setIsAcceptingRide(false);
    };

    const onRideAcceptFailed = (payload: { message?: string }) => {
      setServerMessage(payload?.message || "Ride is no longer available");
      setActiveRide(null);
      setCountdown(0);
      setIsRidePopupVisible(false);
      setIsAcceptingRide(false);
      toast.error(payload?.message || "Ride is no longer available");
    };

    const onRiderRegistrationFailed = (payload: { message?: string }) => {
      setServerMessage(payload?.message || "Rider registration failed");
      setActiveRide(null);
      setCountdown(0);
      setIsRidePopupVisible(false);
    };

    socket.on("connect", onConnect);
    socket.on("newRideRequest", onNewRideRequest);
    socket.on("rideTaken", onRideTaken);
    socket.on("rideAcceptSuccess", onRideAcceptSuccess);
    socket.on("rideNoRider", onRideNoRider);
    socket.on("rideAcceptFailed", onRideAcceptFailed);
    socket.on("riderRegistrationFailed", onRiderRegistrationFailed);
    socket.on("rideCancelled", onRideCancelled);
    socket.on("ride_cancelled", onRideCancelled);
    socket.on("connect_error", () => {
      setServerMessage("Socket connection failed. Check backend URL/CORS.");
    });

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("newRideRequest", onNewRideRequest);
      socket.off("rideTaken", onRideTaken);
      socket.off("rideAcceptSuccess", onRideAcceptSuccess);
      socket.off("rideNoRider", onRideNoRider);
      socket.off("rideAcceptFailed", onRideAcceptFailed);
      socket.off("riderRegistrationFailed", onRiderRegistrationFailed);
      socket.off("rideCancelled", onRideCancelled);
      socket.off("ride_cancelled", onRideCancelled);
      socket.off("connect_error");
    };
  }, [ongoingRide?.rideId, riderId, router]);

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

    setIsAcceptingRide(true);

    socket.emit("rideAccepted", {
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
    setIsRidePopupVisible(false);
    setIsAcceptingRide(false);
    toast.info("Ride request rejected.");
  };

  const handleDismissRidePopup = () => {
    setIsRidePopupVisible(false);
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
      <Toaster richColors position="top-center" />
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

      {activeRide && isRidePopupVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-black shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0b2a52]">
                New Ride Request
              </h2>
              <button
                type="button"
                onClick={handleDismissRidePopup}
                aria-label="Close ride request popup"
                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Respond in {countdown}s to claim this ride.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Pickup</p>
                <p className="font-semibold text-[#0b2a52]">{pickupText}</p>
              </div>
              <div>
                <p className="text-gray-500">Drop</p>
                <p className="font-semibold text-[#0b2a52]">{dropText}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-3">
                <div>
                  <p className="text-gray-500">Distance</p>
                  <p className="font-semibold">
                    {activeRide.distanceKm.toFixed(2)} km
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-semibold">
                    {activeRide.estimatedMinutes} min
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fare</p>
                  <p className="font-semibold">
                    ₹{activeRide.fareAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleAcceptRide}
                disabled={countdown <= 0 || isAcceptingRide}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAcceptingRide ? "Accepting..." : "Accept"}
              </button>
              <button
                type="button"
                onClick={handleDeclineRide}
                disabled={isAcceptingRide}
                className="flex-1 rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

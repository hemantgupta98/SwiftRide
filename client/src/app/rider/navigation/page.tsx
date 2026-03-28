"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { socket } from "../../../../lib/socket";
import { useDistance } from "../../../hooks/useDistance";
import { useLiveLocation } from "../../../hooks/useLiveLocation";
import { useSocket } from "../../../hooks/useSocket";
import { getRiderId, getActiveRideStorageKey } from "@/lib/userStorage";
import "leaflet/dist/leaflet.css";

type LatLng = [number, number];

type StoredRide = {
  rideId: string;
  pickupLocation?: {
    coordinates: [number, number];
    label?: string;
  };
  dropLocation?: {
    coordinates: [number, number];
    label?: string;
  };
  pickup?: {
    coordinates: [number, number];
    label?: string;
  };
  drop?: {
    coordinates: [number, number];
    label?: string;
  };
  riderId?: string;
};

type NavigationStage = "toPickup" | "toDrop" | "cancelled";

const ARRIVAL_THRESHOLD_METERS = 3;

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
  },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

const formatCoordinates = (coords?: [number, number]) => {
  if (!coords || coords.length !== 2) {
    return "N/A";
  }

  const [lng, lat] = coords;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

export default function RiderNavigationPage() {
  const router = useRouter();
  const [ride, setRide] = useState<StoredRide | null>(null);
  const [pickupCoordinates, setPickupCoordinates] = useState<
    [number, number] | null
  >(null);
  const [dropCoordinates, setDropCoordinates] = useState<
    [number, number] | null
  >(null);
  const [pickupLabel, setPickupLabel] = useState("Pickup");
  const [dropLabel, setDropLabel] = useState("Drop");
  const [riderCoordinates, setRiderCoordinates] = useState<
    [number, number] | null
  >(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<NavigationStage>("toPickup");
  const [locationWatcher, setLocationWatcher] = useState<number | null>(null);
  const riderId = useMemo(() => getRiderId(), []);

  const arrivalToastShownRef = useRef(false);

  // Cleanup function to reset all navigation state
  const cleanupNavigation = useCallback(
    (reason: "cancelled" | "completed" = "cancelled") => {
      // 1. Clear ride details from state
      setRide(null);
      setPickupCoordinates(null);
      setDropCoordinates(null);
      setRiderCoordinates(null);
      setRoute([]);
      setError("");
      setPickupLabel("Pickup");
      setDropLabel("Drop");

      // 2. Stop live tracking
      if (locationWatcher !== null) {
        navigator.geolocation.clearWatch(locationWatcher);
        setLocationWatcher(null);
      }

      // 3. Clear storage
      if (typeof window !== "undefined" && riderId) {
        const activeRideKey = getActiveRideStorageKey(riderId);
        localStorage.removeItem(activeRideKey);
      }

      // 4. Reset navigation stage
      setStage("cancelled");

      // 5. Show appropriate toast notification
      if (reason === "completed") {
        toast.success("Ride completed successfully! Great job!", {
          duration: 3000,
        });
      } else {
        toast.error("Customer cancelled the ride. Sorry!", {
          duration: 3000,
        });
      }

      // 6. Redirect to rider home/rides after a short delay
      const redirectTimeout = setTimeout(() => {
        router.push("/rider/home");
      }, 2000);

      return () => clearTimeout(redirectTimeout);
    },
    [locationWatcher, router, riderId],
  );

  useSocket({
    enabled: true,
    onConnect: () => {
      if (riderId) {
        socket.emit("registerRider", { riderId });
      }
    },
    onReconnect: () => {
      if (riderId) {
        socket.emit("registerRider", { riderId });
      }
    },
  });

  const { coords: liveCoords } = useLiveLocation({
    enabled: Boolean(riderId && stage !== "cancelled"),
    throttleMs: 20000,
    minDistanceMeters: 10,
    onUpdate: (coords) => {
      if (!riderId) {
        return;
      }

      setRiderCoordinates([coords.lng, coords.lat]);
      socket.emit("location_update", {
        riderId,
        lng: coords.lng,
        lat: coords.lat,
        isOnline: true,
      });
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!riderId) {
      setError("Rider session not found. Please login again.");
      return;
    }

    const activeRideKey = getActiveRideStorageKey(riderId);
    const rawRide = localStorage.getItem(activeRideKey);
    if (!rawRide) {
      setError("No active accepted ride found.");
      return;
    }

    try {
      const parsedRide = JSON.parse(rawRide) as StoredRide;

      // Reject stale/global localStorage rides that do not carry ownership.
      if (!parsedRide.riderId) {
        setError("Invalid ride data found. Clearing stale ride details.");
        localStorage.removeItem(activeRideKey);
        return;
      }

      if (parsedRide.riderId !== riderId) {
        setError("This ride does not belong to you. Clearing ride data.");
        localStorage.removeItem(activeRideKey);
        return;
      }

      const pickup = parsedRide.pickupLocation || parsedRide.pickup;
      const drop = parsedRide.dropLocation || parsedRide.drop;

      if (!pickup?.coordinates || pickup.coordinates.length !== 2) {
        setError("Accepted ride pickup location is invalid.");
        return;
      }

      if (!drop?.coordinates || drop.coordinates.length !== 2) {
        setError("Accepted ride drop location is invalid.");
        return;
      }

      setRide(parsedRide);
      setPickupCoordinates(pickup.coordinates);
      setDropCoordinates(drop.coordinates);
      setPickupLabel(pickup.label || "Pickup");
      setDropLabel(drop.label || "Drop");
    } catch {
      setError("Unable to load accepted ride details.");
    }
  }, [riderId]);

  useEffect(() => {
    if (!ride?.rideId) {
      return;
    }

    const onRideCancelled = (payload: {
      rideId?: string;
      message?: string;
    }) => {
      if (!payload?.rideId || payload.rideId !== ride.rideId) {
        return;
      }

      cleanupNavigation("cancelled");
    };

    const onRideCompleted = (payload: {
      rideId?: string;
      status?: string;
      message?: string;
    }) => {
      if (!payload?.rideId || payload.rideId !== ride.rideId) {
        return;
      }

      cleanupNavigation("completed");
    };

    const onRideTaken = (payload: {
      rideId?: string;
      acceptedBy?: string;
      message?: string;
    }) => {
      if (!payload?.rideId || payload.rideId !== ride.rideId) {
        return;
      }

      // Another rider accepted this ride while we were in navigation
      cleanupNavigation("cancelled");
    };

    socket.on("rideCancelled", onRideCancelled);
    socket.on("ride_cancelled", onRideCancelled);
    socket.on("rideCompleted", onRideCompleted);
    socket.on("ride_completed", onRideCompleted);
    socket.on("rideTaken", onRideTaken);

    return () => {
      socket.off("rideCancelled", onRideCancelled);
      socket.off("ride_cancelled", onRideCancelled);
      socket.off("rideCompleted", onRideCompleted);
      socket.off("ride_completed", onRideCompleted);
      socket.off("rideTaken", onRideTaken);
    };
  }, [ride?.rideId, cleanupNavigation]);

  const riderPoint = useMemo(() => {
    if (riderCoordinates) {
      return { lat: riderCoordinates[1], lng: riderCoordinates[0] };
    }

    if (liveCoords) {
      return { lat: liveCoords.lat, lng: liveCoords.lng };
    }

    return null;
  }, [liveCoords, riderCoordinates]);

  const pickupPoint = useMemo(() => {
    if (!pickupCoordinates) {
      return null;
    }

    return {
      lat: pickupCoordinates[1],
      lng: pickupCoordinates[0],
    };
  }, [pickupCoordinates]);

  const dropPoint = useMemo(() => {
    if (!dropCoordinates) {
      return null;
    }

    return {
      lat: dropCoordinates[1],
      lng: dropCoordinates[0],
    };
  }, [dropCoordinates]);

  const { isWithin, text: distanceText } = useDistance(riderPoint, pickupPoint);
  const { isWithin: isWithinDrop } = useDistance(riderPoint, dropPoint);

  useEffect(() => {
    if (stage !== "toPickup") {
      return;
    }

    if (!isWithin(ARRIVAL_THRESHOLD_METERS)) {
      return;
    }

    if (arrivalToastShownRef.current) {
      return;
    }

    arrivalToastShownRef.current = true;

    toast.info("You have arrived at pickup location", {
      action: {
        label: "YES",
        onClick: () => {
          if (!ride?.rideId || !riderId) {
            return;
          }

          setStage("toDrop");
          socket.emit("ride_started", {
            rideId: ride.rideId,
            riderId,
          });
        },
      },
      duration: 10000,
    });
  }, [isWithin, ride?.rideId, riderId, stage]);

  // Arrival detection for drop location
  useEffect(() => {
    if (stage !== "toDrop") {
      return;
    }

    if (!isWithinDrop(ARRIVAL_THRESHOLD_METERS)) {
      return;
    }

    toast.info("You have arrived at drop location", {
      action: {
        label: "Mark Complete",
        onClick: () => {
          if (!ride?.rideId || !riderId) {
            return;
          }

          socket.emit("ride_completed", {
            rideId: ride.rideId,
            riderId,
          });
        },
      },
      duration: 15000,
    });
  }, [isWithinDrop, ride?.rideId, riderId, stage]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (stage === "cancelled") {
        return;
      }

      let from: [number, number] | null = riderCoordinates;
      let to: [number, number] | null = null;

      if (stage === "toPickup") {
        to = pickupCoordinates;
      }

      if (stage === "toDrop") {
        from = pickupCoordinates;
        to = dropCoordinates;
      }

      if (!from || !to) {
        return;
      }

      try {
        setIsLoadingRoute(true);
        setError("");

        const [fromLng, fromLat] = from;
        const [toLng, toLat] = to;

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`,
        );

        const data = await response.json();
        const routeGeometry = data?.routes?.[0]?.geometry?.coordinates;

        if (!Array.isArray(routeGeometry) || routeGeometry.length === 0) {
          setError("Route not found for navigation.");
          setRoute([]);
          return;
        }

        setRoute(
          routeGeometry.map((point: [number, number]) => [point[1], point[0]]),
        );
      } catch {
        setError("Failed to fetch navigation route.");
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [dropCoordinates, pickupCoordinates, riderCoordinates, stage]);

  const riderMarkerPosition = useMemo<LatLng | null>(() => {
    if (!riderCoordinates) {
      return null;
    }

    return [riderCoordinates[1], riderCoordinates[0]];
  }, [riderCoordinates]);

  const pickupMarkerPosition = useMemo<LatLng | null>(() => {
    if (!pickupCoordinates) {
      return null;
    }

    return [pickupCoordinates[1], pickupCoordinates[0]];
  }, [pickupCoordinates]);

  const dropMarkerPosition = useMemo<LatLng | null>(() => {
    if (!dropCoordinates) {
      return null;
    }

    return [dropCoordinates[1], dropCoordinates[0]];
  }, [dropCoordinates]);

  const mapCenter: LatLng = riderMarkerPosition ||
    pickupMarkerPosition || [23.3441, 85.3096];

  return (
    <div className="min-h-screen bg-[#0b2a52] p-5 text-white">
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-xl bg-white/10 p-4">
          <h1 className="text-2xl font-bold">
            {stage === "toDrop" ? "Navigation to Drop" : "Navigation to Pickup"}
          </h1>
          <p className="mt-1 text-sm text-gray-200">Pickup: {pickupLabel}</p>
          <p className="mt-1 text-sm text-gray-200">Drop: {dropLabel}</p>
          <p className="mt-1 text-xs text-gray-300">
            Pickup coords: {formatCoordinates(pickupCoordinates || undefined)}
          </p>
          <p className="mt-1 text-xs text-gray-300">
            Rider coords: {formatCoordinates(riderCoordinates || undefined)}
          </p>
          {stage === "toPickup" && (
            <p className="mt-1 text-xs text-blue-200">
              Distance to customer: {distanceText || "Calculating..."}
            </p>
          )}
          {isLoadingRoute && (
            <p className="mt-2 text-sm text-yellow-200">
              Loading navigation route...
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-200">{error}</p>}
          {stage === "cancelled" && (
            <p className="mt-2 text-sm font-semibold text-red-200">
              Customer cancelled the ride. Sorry!
            </p>
          )}

          <button
            type="button"
            onClick={() => router.push("/rider/rides")}
            className="mt-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#0b2a52]"
          >
            Back to Ride Requests
          </button>
        </div>

        <div className="h-[70vh] overflow-hidden rounded-xl border border-white/20">
          <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {riderMarkerPosition && <Marker position={riderMarkerPosition} />}
            {pickupMarkerPosition && <Marker position={pickupMarkerPosition} />}
            {dropMarkerPosition && stage === "toDrop" && (
              <Marker position={dropMarkerPosition} />
            )}
            {route.length > 0 && <Polyline positions={route} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

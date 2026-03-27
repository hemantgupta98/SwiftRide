/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "../../../lib/api";
import { socket } from "../../../lib/socket";
import { useDistance } from "../../hooks/useDistance";
import { useLiveLocation } from "../../hooks/useLiveLocation";
import { useSocket } from "../../hooks/useSocket";

import "leaflet/dist/leaflet.css";
import { MapPin, Flag, MoreVertical } from "lucide-react";
import { Toaster, toast } from "sonner";

type LatLng = [number, number];

type RideStage =
  | "idle"
  | "searching"
  | "accepted"
  | "arrived"
  | "started"
  | "cancelled";

const ARRIVAL_THRESHOLD_METERS = 4;

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
  { ssr: false },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

const tupleToPoint = (value: LatLng | null) => {
  if (!value) {
    return null;
  }

  return {
    lat: value[0],
    lng: value[1],
  };
};

const locationToLatLng = (location: any): LatLng | null => {
  if (!location) {
    return null;
  }

  const lat = Number(location.lat);
  const lng = Number(location.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return [lat, lng];
};

export default function Page() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [isCurrentLocationLoading, setIsCurrentLocationLoading] =
    useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);

  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [dropLocation, setDropLocation] = useState<any>(null);

  const [route, setRoute] = useState<LatLng[]>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState<number | string>("");
  const [isRideBooked, setIsRideBooked] = useState(false);
  const [isRideMenuOpen, setIsRideMenuOpen] = useState(false);
  const [bookedRideId, setBookedRideId] = useState<string | null>(null);
  const [acceptedRideId, setAcceptedRideId] = useState<string | null>(null);
  const [acceptedRiderId, setAcceptedRiderId] = useState<string | null>(null);
  const [riderLocation, setRiderLocation] = useState<LatLng | null>(null);
  const [riderPickupDistanceKm, setRiderPickupDistanceKm] = useState<
    number | null
  >(null);
  const [rideStage, setRideStage] = useState<RideStage>("idle");
  const [socketStatus, setSocketStatus] = useState("connecting");

  const bookedRideIdRef = useRef<string | null>(null);
  const rideRequestTimeoutRef = useRef<number | null>(null);
  const arrivalToastShownRef = useRef(false);

  const userId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("token") || "";
    return parseUserIdFromToken(token);
  }, []);

  const { coords: customerLiveCoords } = useLiveLocation({
    enabled: rideStage === "accepted" || rideStage === "arrived",
    throttleMs: 2500,
    minDistanceMeters: 3,
  });

  const customerPosition = useMemo(() => {
    if (customerLiveCoords) {
      return {
        lat: customerLiveCoords.lat,
        lng: customerLiveCoords.lng,
      };
    }

    const pickup = locationToLatLng(pickupLocation);
    return tupleToPoint(pickup);
  }, [customerLiveCoords, pickupLocation]);

  const riderPosition = useMemo(
    () => tupleToPoint(riderLocation),
    [riderLocation],
  );

  const {
    distanceMeters,
    text: riderDistanceText,
    isWithin,
  } = useDistance(riderPosition, customerPosition);

  const fare = distance ? Number(distance) * 15 : 0;
  const hasBothLocations = Boolean(pickupLocation && dropLocation);

  const { isConnected } = useSocket({
    enabled: true,
    onConnect: () => {
      setSocketStatus("connected");
      if (userId) {
        socket.emit("registerUser", { userId });
      }
    },
    onDisconnect: () => {
      setSocketStatus("disconnected");
    },
    onReconnect: () => {
      setSocketStatus("reconnecting");
      if (userId) {
        socket.emit("registerUser", { userId });
      }
    },
  });

  useEffect(() => {
    if (isConnected && userId) {
      socket.emit("registerUser", { userId });
    }
  }, [isConnected, userId]);

  useEffect(() => {
    bookedRideIdRef.current = bookedRideId;
  }, [bookedRideId]);

  const clearRideRequestTimeout = () => {
    if (rideRequestTimeoutRef.current !== null) {
      window.clearTimeout(rideRequestTimeoutRef.current);
      rideRequestTimeoutRef.current = null;
    }
  };

  const startRideRequestTimeout = (rideId: string) => {
    clearRideRequestTimeout();

    rideRequestTimeoutRef.current = window.setTimeout(() => {
      if (bookedRideIdRef.current !== rideId) {
        return;
      }

      toast.error("No rides in this area.");
      setRideStage("cancelled");
      setIsRideBooked(false);
      setIsRideMenuOpen(false);
      setBookedRideId(null);
    }, 30000);
  };

  const isInRanchiJharkhand = (location: any) => {
    const label = String(location?.display_name || "").toLowerCase();
    return label.includes("ranchi") || label.includes("jharkhand");
  };

  const getRoute = async (from: LatLng, to: LatLng, updateSummary = false) => {
    try {
      setIsRouteLoading(true);
      const [fromLat, fromLng] = from;
      const [toLat, toLng] = to;

      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`,
      );

      const data = await res.json();
      const routeData = data?.routes?.[0];

      if (!routeData) {
        throw new Error("No route found");
      }

      const coords = routeData.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]] as LatLng,
      );

      setRoute(coords);

      if (updateSummary) {
        setDistance((routeData.distance / 1000).toFixed(2));
        setDuration(Math.ceil(routeData.duration / 60));
      }

      return true;
    } catch {
      if (updateSummary) {
        setDistance("");
        setDuration("");
      }
      setRoute([]);
      toast.error("Unable to fetch route. Please try different locations.");
      return false;
    } finally {
      setIsRouteLoading(false);
    }
  };

  useEffect(() => {
    const onRideAccepted = (payload: {
      rideId?: string;
      riderId?: string;
      message?: string;
      riderLocation?: { coordinates?: [number, number] };
    }) => {
      if (!payload?.rideId || payload.rideId !== bookedRideIdRef.current) {
        return;
      }

      clearRideRequestTimeout();
      setAcceptedRideId(payload.rideId);
      setAcceptedRiderId(payload.riderId || null);
      setRideStage("accepted");

      if (payload?.riderLocation?.coordinates?.length === 2) {
        const [riderLng, riderLat] = payload.riderLocation.coordinates;
        setRiderLocation([Number(riderLat), Number(riderLng)]);
      }

      toast.success(
        payload.message || "Your ride is accepted. Rider is coming!",
      );
    };

    const onRideRejected = (payload: { rideId?: string; message?: string }) => {
      if (!payload?.rideId || payload.rideId !== bookedRideIdRef.current) {
        return;
      }

      toast.error(payload.message || "Sorry, ride reject your ride.");
    };

    const onRiderLocationUpdatedForUser = (payload: {
      rideId?: string;
      riderLocation?: { coordinates?: [number, number] };
      distanceToPickupKm?: number | null;
    }) => {
      if (!payload?.rideId || payload.rideId !== bookedRideIdRef.current) {
        return;
      }

      const coordinates = payload?.riderLocation?.coordinates;
      if (Array.isArray(coordinates) && coordinates.length === 2) {
        const [riderLng, riderLat] = coordinates;
        setRiderLocation([Number(riderLat), Number(riderLng)]);
      }

      if (typeof payload.distanceToPickupKm === "number") {
        setRiderPickupDistanceKm(payload.distanceToPickupKm);
      }
    };

    const onRideNoRider = (payload: { rideId?: string; message?: string }) => {
      if (!payload?.rideId || payload.rideId !== bookedRideIdRef.current) {
        return;
      }

      clearRideRequestTimeout();
      toast.error(payload.message || "No Rider in this area.");
      setRideStage("cancelled");
      setIsRideBooked(false);
      setIsRideMenuOpen(false);
      setBookedRideId(null);
      setAcceptedRideId(null);
      setAcceptedRiderId(null);
      setRiderLocation(null);
      setRiderPickupDistanceKm(null);
    };

    const onRideStarted = (payload: { rideId?: string }) => {
      if (!payload?.rideId || payload.rideId !== bookedRideIdRef.current) {
        return;
      }

      setRideStage("started");
      toast.success("Trip started. Heading to drop location.");
    };

    const onRideCancelled = (payload: {
      rideId?: string;
      message?: string;
    }) => {
      if (!payload?.rideId || payload.rideId !== bookedRideIdRef.current) {
        return;
      }

      toast.error(payload.message || "Ride cancelled.");
      setRideStage("cancelled");
      setIsRideBooked(false);
      setAcceptedRideId(null);
      setAcceptedRiderId(null);
      setRiderLocation(null);
      setRiderPickupDistanceKm(null);
    };

    socket.on("rideAccepted", onRideAccepted);
    socket.on("ride_accepted", onRideAccepted);
    socket.on("rideRejected", onRideRejected);
    socket.on("riderLocationUpdatedForUser", onRiderLocationUpdatedForUser);
    socket.on("location_update", onRiderLocationUpdatedForUser);
    socket.on("rideNoRider", onRideNoRider);
    socket.on("rideStarted", onRideStarted);
    socket.on("ride_started", onRideStarted);
    socket.on("rideCancelled", onRideCancelled);
    socket.on("ride_cancelled", onRideCancelled);

    return () => {
      socket.off("rideAccepted", onRideAccepted);
      socket.off("ride_accepted", onRideAccepted);
      socket.off("rideRejected", onRideRejected);
      socket.off("riderLocationUpdatedForUser", onRiderLocationUpdatedForUser);
      socket.off("location_update", onRiderLocationUpdatedForUser);
      socket.off("rideNoRider", onRideNoRider);
      socket.off("rideStarted", onRideStarted);
      socket.off("ride_started", onRideStarted);
      socket.off("rideCancelled", onRideCancelled);
      socket.off("ride_cancelled", onRideCancelled);
      clearRideRequestTimeout();
    };
  }, []);

  useEffect(() => {
    if (rideStage !== "accepted" || !pickupLocation || !riderLocation) {
      return;
    }

    const pickupPoint = locationToLatLng(pickupLocation);
    if (!pickupPoint) {
      return;
    }

    getRoute(riderLocation, pickupPoint, false);
  }, [rideStage, pickupLocation, riderLocation]);

  useEffect(() => {
    if (rideStage !== "started") {
      return;
    }

    const pickupPoint = locationToLatLng(pickupLocation);
    const dropPoint = locationToLatLng(dropLocation);

    if (!pickupPoint || !dropPoint) {
      return;
    }

    getRoute(pickupPoint, dropPoint, false);
  }, [rideStage, pickupLocation, dropLocation]);

  useEffect(() => {
    if (rideStage !== "accepted") {
      return;
    }

    if (!distanceMeters || !isWithin(ARRIVAL_THRESHOLD_METERS)) {
      return;
    }

    if (arrivalToastShownRef.current) {
      return;
    }

    arrivalToastShownRef.current = true;
    setRideStage("arrived");

    toast.info("Rider has arrived at your location", {
      action: {
        label: "YES",
        onClick: () => {
          if (!bookedRideIdRef.current || !acceptedRiderId) {
            return;
          }

          socket.emit("ride_started", {
            rideId: bookedRideIdRef.current,
            riderId: acceptedRiderId,
          });

          setRideStage("started");
        },
      },
      duration: 10000,
    });
  }, [acceptedRiderId, distanceMeters, isWithin, rideStage]);

  const handleUseCurrentLocation = async () => {
    if (!navigator?.geolocation) {
      toast.error("Geolocation is not supported in your browser.");
      return;
    }

    setIsCurrentLocationLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        },
      );

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
      );
      const data = await res.json();

      const currentLocation = {
        ...data,
        lat: String(lat),
        lon: String(lon),
      };

      if (!isInRanchiJharkhand(currentLocation)) {
        toast.error(
          "Sorry, you are not in Ranchi. Our service is only in Ranchi.",
        );
        return;
      }

      setPickupLocation(currentLocation);
      setPickup(currentLocation.display_name || "Current Location");
      setPickupSuggestions([]);
      toast.success("Current location selected as pickup point.");
    } catch {
      toast.error("Unable to fetch your current location. Please try again.");
    } finally {
      setIsCurrentLocationLoading(false);
    }
  };

  const searchLocation = async (query: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query},Ranchi,Jharkhand,India&format=json&limit=5`,
    );
    return res.json();
  };

  const handlePickupChange = async (value: string) => {
    setPickup(value);
    setPickupLocation(null);
    setRoute([]);
    setDistance("");
    setDuration("");
    if (value.length < 3) {
      setPickupSuggestions([]);
      return;
    }

    const results = await searchLocation(value);
    setPickupSuggestions(results);
  };

  const handleDropChange = async (value: string) => {
    setDrop(value);
    setDropLocation(null);
    setRoute([]);
    setDistance("");
    setDuration("");
    if (value.length < 3) {
      setDropSuggestions([]);
      return;
    }

    const results = await searchLocation(value);
    setDropSuggestions(results);
  };

  const resolveSelectedLocation = async (value: string, selected: any) => {
    if (selected) {
      return selected;
    }

    const query = value.trim();
    if (query.length < 3) {
      return null;
    }

    const results = await searchLocation(query);
    return results?.[0] ?? null;
  };

  const handleBookRide = async () => {
    const finalPickup = await resolveSelectedLocation(pickup, pickupLocation);
    const finalDrop = await resolveSelectedLocation(drop, dropLocation);

    if (!finalPickup || !finalDrop) {
      toast.warning("Please select valid pickup and drop locations");
      return;
    }

    if (!pickupLocation) {
      setPickupLocation(finalPickup);
      setPickup(finalPickup.display_name || pickup);
    }

    if (!dropLocation) {
      setDropLocation(finalDrop);
      setDrop(finalDrop.display_name || drop);
    }

    if (!isInRanchiJharkhand(finalPickup) && !isInRanchiJharkhand(finalDrop)) {
      toast.error("Sorry, we are only in Ranchi now.");
      return;
    }

    if (isRouteLoading) {
      toast.warning("Route is loading. Please wait a moment.");
      return;
    }

    const pickupPoint = locationToLatLng(finalPickup);
    const dropPoint = locationToLatLng(finalDrop);
    if (!pickupPoint || !dropPoint) {
      toast.error("Unable to resolve route points.");
      return;
    }

    if (route.length === 0) {
      const routeCreated = await getRoute(pickupPoint, dropPoint, true);
      if (!routeCreated) {
        return;
      }
    }

    if (!userId) {
      toast.error("Please login again to book a ride.");
      return;
    }

    try {
      const pickupLng = Number(finalPickup.lon);
      const pickupLat = Number(finalPickup.lat);
      const dropLng = Number(finalDrop.lon);
      const dropLat = Number(finalDrop.lat);

      const response = await api.post("/ride/book-ride", {
        userId,
        pickup: {
          lng: pickupLng,
          lat: pickupLat,
          label: finalPickup.display_name || "Pickup",
        },
        drop: {
          lng: dropLng,
          lat: dropLat,
          label: finalDrop.display_name || "Drop",
        },
        customerId: userId,
        pickupLocation: {
          coordinates: [pickupLng, pickupLat],
          label: finalPickup.display_name || "Pickup",
        },
        dropLocation: {
          coordinates: [dropLng, dropLat],
          label: finalDrop.display_name || "Drop",
        },
        distance: Number(distance || 0),
        estimatedTime: Number(duration || 0),
        fare: Number(fare.toFixed(2)),
      });

      const rideId = response?.data?.data?.rideId;

      if (!rideId) {
        throw new Error("Ride ID not returned from server");
      }

      const createdRideId = String(rideId);

      arrivalToastShownRef.current = false;
      setBookedRideId(createdRideId);
      setIsRideBooked(true);
      setRideStage("searching");
      setIsRideMenuOpen(false);
      startRideRequestTimeout(createdRideId);
      toast.success("Ride request sent. Waiting for rider acceptance.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to book ride right now";
      toast.error(message);
    }
  };

  const resetRideState = () => {
    clearRideRequestTimeout();
    setRoute([]);
    setPickupLocation(null);
    setDropLocation(null);

    setPickup("");
    setDrop("");
    setPickupSuggestions([]);
    setDropSuggestions([]);
    setDistance("");
    setDuration("");
    setIsRideBooked(false);
    setRideStage("idle");
    setIsRideMenuOpen(false);
    setBookedRideId(null);
    setAcceptedRideId(null);
    setAcceptedRiderId(null);
    setRiderLocation(null);
    setRiderPickupDistanceKm(null);
    arrivalToastShownRef.current = false;
  };

  useEffect(() => {
    if (
      !pickupLocation ||
      !dropLocation ||
      rideStage === "accepted" ||
      rideStage === "arrived"
    ) {
      return;
    }

    if (
      !isInRanchiJharkhand(pickupLocation) &&
      !isInRanchiJharkhand(dropLocation)
    ) {
      setRoute([]);
      setDistance("");
      setDuration("");
      toast.error("Sorry, we are only in Ranchi now.");
      return;
    }

    const pickupPoint = locationToLatLng(pickupLocation);
    const dropPoint = locationToLatLng(dropLocation);

    if (!pickupPoint || !dropPoint) {
      return;
    }

    getRoute(pickupPoint, dropPoint, true);
  }, [pickupLocation, dropLocation, rideStage]);

  const handleCancelRide = (isFromBookedState: boolean) => {
    if (isFromBookedState) {
      const wantsToCancel = window.confirm(
        "Are you sure you want to cancel a ride?",
      );

      if (!wantsToCancel) {
        return;
      }
    }

    if (
      bookedRideIdRef.current &&
      (rideStage === "accepted" ||
        rideStage === "arrived" ||
        rideStage === "started")
    ) {
      socket.emit("ride_cancelled", {
        rideId: bookedRideIdRef.current,
        userId,
        riderId: acceptedRiderId,
      });
    }

    resetRideState();
    if (isFromBookedState) {
      toast.info("Your booked ride has been cancelled.");
    }
  };

  return (
    <div className="relative min-h-screen space-y-6 p-6">
      <Toaster richColors position="top-center" />

      {hasBothLocations && distance && (
        <div className="sticky top-0 z-20 rounded-xl border border-orange-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="text-lg font-semibold">
            Distance: {distance} km | Time: {duration} min | Cost: Rs.{" "}
            {fare.toFixed(2)}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Ride stage: {rideStage.toUpperCase()} | Socket: {socketStatus}
          </p>
        </div>
      )}

      {!isRideBooked && (
        <>
          <h1 className="text-3xl font-bold text-orange-500">
            SwiftRide Booking
          </h1>
          <p className="text-sm text-gray-400">
            Our service in only Ranchi Jharkhand
          </p>
          <label className="mb-2 block font-semibold">Pickup location</label>
          <div className="relative mb-4">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
              size={18}
            />
            <Input
              value={pickup}
              onChange={(e: { target: { value: string } }) =>
                handlePickupChange(e.target.value)
              }
              placeholder="Pickup location"
              className="w-full pl-10"
            />

            {pickupSuggestions.map((item) => (
              <div
                key={item.place_id}
                className="cursor-pointer border p-2 hover:bg-gray-100"
                onClick={() => {
                  setPickup(item.display_name);
                  setPickupLocation(item);
                  setPickupSuggestions([]);
                }}
              >
                {item.display_name}
              </div>
            ))}
          </div>

          <label className="mb-2 block font-semibold">Drop location</label>
          <div className="relative mb-4">
            <Flag
              className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600"
              size={18}
            />
            <Input
              value={drop}
              onChange={(e: { target: { value: string } }) =>
                handleDropChange(e.target.value)
              }
              placeholder="Drop location"
              className="w-full pl-10"
            />

            {dropSuggestions.map((item) => (
              <div
                key={item.place_id}
                className="cursor-pointer border p-2 hover:bg-gray-100"
                onClick={() => {
                  setDrop(item.display_name);
                  setDropLocation(item);
                  setDropSuggestions([]);
                }}
              >
                {item.display_name}
              </div>
            ))}
          </div>
          <div className="flex gap-5">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isCurrentLocationLoading}
              className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCurrentLocationLoading
                ? "Getting Current Location..."
                : "Use Current Location"}
            </button>
          </div>

          <div className="flex gap-5">
            <button
              onClick={handleBookRide}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 font-semibold text-white"
              type="button"
            >
              Book Ride
            </button>

            <button
              type="button"
              onClick={() => handleCancelRide(false)}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 font-semibold text-white"
            >
              Cancel Ride
            </button>
          </div>
        </>
      )}

      {isRideBooked && acceptedRideId && (
        <p className="text-sm font-semibold text-blue-700">
          Rider is{" "}
          {riderDistanceText ||
            `${riderPickupDistanceKm?.toFixed(2) || "0.00"} km`}{" "}
          away
        </p>
      )}

      {hasBothLocations && isRouteLoading && (
        <p className="text-sm text-gray-600">Loading live tracking route...</p>
      )}

      {hasBothLocations && (
        <div className="relative z-0 h-125 w-full">
          <MapContainer
            center={[23.3441, 85.3096]}
            zoom={13}
            className="z-0"
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {pickupLocation && (
              <Marker
                position={[
                  Number(pickupLocation.lat),
                  Number(pickupLocation.lon),
                ]}
              />
            )}

            {dropLocation && (
              <Marker
                position={[Number(dropLocation.lat), Number(dropLocation.lon)]}
              />
            )}

            {riderLocation && isRideBooked && acceptedRideId && (
              <Marker position={riderLocation} />
            )}

            {route.length > 0 && <Polyline positions={route} />}
          </MapContainer>
        </div>
      )}

      {isRideBooked && (
        <div className="fixed bottom-6 right-6 z-1000">
          {isRideMenuOpen && (
            <div className="mb-3 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
              <p className="text-sm font-semibold text-gray-900">
                Cancel your ride
              </p>
              <p className="mt-1 text-xs text-gray-600">
                If your plan changed, you can cancel your booked ride here.
              </p>
              <button
                type="button"
                onClick={() => handleCancelRide(true)}
                className="mt-3 w-full rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Cancel Ride
              </button>
            </div>
          )}

          <button
            type="button"
            aria-label="Ride options"
            onClick={() => setIsRideMenuOpen((prev) => !prev)}
            className="mb-20 ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg"
          >
            <MoreVertical size={22} />
          </button>
        </div>
      )}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <div className="rounded-lg border px-4 py-3">
      <input
        ref={ref}
        {...props}
        className={`w-full text-sm outline-none ${className}`.trim()}
      />
    </div>
  ),
);

Input.displayName = "Input";

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "../../../lib/api";
import { socket } from "../../../lib/socket";

import "leaflet/dist/leaflet.css";
import { MapPin, Flag, MoreVertical } from "lucide-react";
import { Toaster, toast } from "sonner";
type LatLng = [number, number];

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
  const bookedRideIdRef = useRef<string | null>(null);
  const rideRequestTimeoutRef = useRef<number | null>(null);

  const userId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("token") || "";
    return parseUserIdFromToken(token);
  }, []);

  const fare = distance ? Number(distance) * 15 : 0;
  const hasBothLocations = Boolean(pickupLocation && dropLocation);

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
      setIsRideBooked(false);
      setIsRideMenuOpen(false);
      setBookedRideId(null);
    }, 15000);
  };

  useEffect(() => {
    socket.connect();

    const onConnect = () => {
      if (userId) {
        socket.emit("registerUser", { userId });
      }
    };

    const onRideAccepted = (payload: { rideId?: string; message?: string }) => {
      if (!payload?.rideId || payload.rideId !== bookedRideIdRef.current) {
        return;
      }

      clearRideRequestTimeout();
      toast.success(payload.message || "A rider accepted your ride.");
    };

    const onRideNoRider = (payload: { rideId?: string; message?: string }) => {
      if (!payload?.rideId || payload.rideId !== bookedRideIdRef.current) {
        return;
      }

      clearRideRequestTimeout();
      toast.error(payload.message || "No rides in this area.");
      setIsRideBooked(false);
      setIsRideMenuOpen(false);
      setBookedRideId(null);
    };

    socket.on("connect", onConnect);
    socket.on("rideAccepted", onRideAccepted);
    socket.on("rideNoRider", onRideNoRider);

    return () => {
      socket.off("connect", onConnect);
      socket.off("rideAccepted", onRideAccepted);
      socket.off("rideNoRider", onRideNoRider);
      clearRideRequestTimeout();
      socket.disconnect();
    };
  }, [userId]);

  const isInRanchiJharkhand = (location: any) => {
    const label = String(location?.display_name || "").toLowerCase();
    return label.includes("ranchi") || label.includes("jharkhand");
  };

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

  // search location (Ranchi only)
  const searchLocation = async (query: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query},Ranchi,Jharkhand,India&format=json&limit=5`,
    );
    return res.json();
  };

  // pickup search
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

  // drop search
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

  // get route
  const getRoute = async (pickup: any, drop: any) => {
    try {
      setIsRouteLoading(true);
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}?overview=full&geometries=geojson`,
      );

      const data = await res.json();
      const routeData = data?.routes?.[0];

      if (!routeData) {
        throw new Error("No route found");
      }

      const coords = routeData.geometry.coordinates.map((c: any) => [
        c[1],
        c[0],
      ]);

      setRoute(coords);
      setDistance((routeData.distance / 1000).toFixed(2));
      setDuration(Math.ceil(routeData.duration / 60));
      return true;
    } catch {
      setRoute([]);
      setDistance("");
      setDuration("");
      toast.error("Unable to fetch route. Please try different locations.");
      return false;
    } finally {
      setIsRouteLoading(false);
    }
  };

  // Resolve manually typed text to a map location when user does not click suggestions.
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

  // book ride
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

    if (route.length === 0) {
      const routeCreated = await getRoute(finalPickup, finalDrop);
      if (!routeCreated) {
        return;
      }
    }
    if (!userId) {
      toast.error("Please login again to book a ride.");
      return;
    }

    try {
      const response = await api.post("/ride/book-ride", {
        userId,
        pickup: {
          lng: Number(finalPickup.lon),
          lat: Number(finalPickup.lat),
        },
        drop: {
          lng: Number(finalDrop.lon),
          lat: Number(finalDrop.lat),
        },
      });

      const rideId = response?.data?.data?.rideId;

      if (!rideId) {
        throw new Error("Ride ID not returned from server");
      }

      const createdRideId = String(rideId);

      setBookedRideId(createdRideId);
      setIsRideBooked(true);
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
    setIsRideMenuOpen(false);
    setBookedRideId(null);
  };

  // Auto-generate live route details as soon as both locations are selected.
  useEffect(() => {
    if (!pickupLocation || !dropLocation) {
      setRoute([]);
      setDistance("");
      setDuration("");
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

    getRoute(pickupLocation, dropLocation);
  }, [pickupLocation, dropLocation]);

  const handleCancelRide = (isFromBookedState: boolean) => {
    if (isFromBookedState) {
      const wantsToCancel = window.confirm(
        "Are you sure you want to cancel a ride?",
      );

      if (!wantsToCancel) {
        return;
      }
    }

    resetRideState();
    if (isFromBookedState) {
      toast.info("Your booked ride has been cancelled.");
    }
  };

  return (
    <div className="relative p-6 space-y-6 min-h-screen">
      <Toaster richColors position="top-center" />
      {!isRideBooked && (
        <>
          <h1 className="text-3xl font-bold text-orange-500">
            SwiftRide Booking
          </h1>
          <p className=" text-sm text-gray-400">
            Our service in only Ranchi Jharkhand
          </p>
          {/* Pickup */}
          <label className="block mb-2 font-semibold">Pickup location</label>
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
                className="p-2 border cursor-pointer hover:bg-gray-100"
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

          {/* Drop */}
          <label className="block mb-2 font-semibold">Drop location</label>
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
                className="p-2 border cursor-pointer hover:bg-gray-100"
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
              className="mt-2 inline-flex items-center gap-2 bg-blue-500 text-white rounded-md px-4 py-2 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCurrentLocationLoading
                ? "Getting Current Location..."
                : "Use Current Location"}
            </button>
          </div>

          <div className="flex gap-5">
            <button
              onClick={handleBookRide}
              className="mt-5 inline-flex items-center gap-2 bg-green-500 text-white rounded-md px-4 py-2 font-semibold"
              type="button"
            >
              Book Ride
            </button>

            <button
              type="button"
              onClick={() => handleCancelRide(false)}
              className="mt-5 inline-flex items-center gap-2 bg-red-500 text-white rounded-md px-4 py-2 font-semibold"
            >
              Cancel Ride
            </button>
          </div>
        </>
      )}

      {/* Distance + Time */}
      {hasBothLocations && distance && (
        <div className="text-lg font-semibold">
          Distance: {distance} km | Time: {duration} min | Cost: Rs.{" "}
          {fare.toFixed(2)}
        </div>
      )}

      {hasBothLocations && isRouteLoading && (
        <p className="text-sm text-gray-600">Loading live tracking route...</p>
      )}

      {/* Map */}
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

            {/* pickup */}
            {pickupLocation && (
              <Marker
                position={[
                  Number(pickupLocation.lat),
                  Number(pickupLocation.lon),
                ]}
              />
            )}

            {/* drop */}
            {dropLocation && (
              <Marker
                position={[Number(dropLocation.lat), Number(dropLocation.lon)]}
              />
            )}

            {/* route */}
            {route.length > 0 && <Polyline positions={route} />}
          </MapContainer>
        </div>
      )}

      {isRideBooked && (
        <div className="fixed right-6 bottom-6 z-1000">
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
            className="ml-auto flex h-12 w-12 mb-20 items-center justify-center rounded-full bg-black text-white shadow-lg"
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
    <div className="border rounded-lg px-4 py-3">
      <input
        ref={ref}
        {...props}
        className={`w-full outline-none text-sm ${className}`.trim()}
      />
    </div>
  ),
);

Input.displayName = "Input";

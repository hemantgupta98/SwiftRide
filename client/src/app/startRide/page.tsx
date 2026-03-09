/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { forwardRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { MapPin, Flag } from "lucide-react";
import { Toaster, toast } from "sonner";
type LatLng = [number, number];

export default function Page() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);

  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [dropLocation, setDropLocation] = useState<any>(null);

  const [route, setRoute] = useState<LatLng[]>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState<number | string>("");

  const fare = distance ? Number(distance) * 15 : 0;
  const hasBothLocations = Boolean(pickupLocation && dropLocation);

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
    } catch {
      setRoute([]);
      setDistance("");
      setDuration("");
      toast.error("Unable to fetch route. Please try different locations.");
    } finally {
      setIsRouteLoading(false);
    }
  };

  // book ride
  const handleBookRide = () => {
    if (!pickupLocation || !dropLocation) {
      toast.warning("Please select both pickup and drop locations");
      return;
    }

    if (isRouteLoading || route.length === 0) {
      toast.warning("Route is loading. Please wait a moment.");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to book this ride?",
    );

    if (!isConfirmed) {
      return;
    }

    toast.success("Booking ride complete. Your ride is confirmed.");
  };

  // Auto-generate live route details as soon as both locations are selected.
  useEffect(() => {
    if (!pickupLocation || !dropLocation) {
      setRoute([]);
      setDistance("");
      setDuration("");
      return;
    }

    getRoute(pickupLocation, dropLocation);
  }, [pickupLocation, dropLocation]);

  const handleCancelRide = (e: React.MouseEvent) => {
    e.preventDefault();

    setRoute([]);
    setPickupLocation(null);
    setDropLocation(null);

    setPickup("");
    setDrop("");
    setPickupSuggestions([]);
    setDropSuggestions([]);
    setDistance("");
    setDuration("");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-orange-500">SwiftRide Booking</h1>
      <Toaster richColors position="top-center" />
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
      <div className=" flex gap-5">
        <button
          onClick={handleBookRide}
          className="mt-5 inline-flex items-center gap-2 bg-green-500 text-white rounded-md px-4 py-2 font-semibold"
          type="button"
        >
          Book Ride
        </button>

        <button
          type="button"
          onClick={handleCancelRide}
          className="mt-5 inline-flex items-center gap-2 bg-red-500 text-white rounded-md px-4 py-2 font-semibold"
        >
          Cancel Ride
        </button>
      </div>

      {/* Distance + Time */}
      {hasBothLocations && distance && (
        <div className="text-lg font-semibold">
          Distance: {distance} km | Time: {duration} min | Cost: Rs.{" "}
          {fare.toFixed(2)}
        </div>
      )}

      {/* Map */}
      {hasBothLocations && (
        <div className="h-125 w-full">
          <MapContainer
            center={[23.3441, 85.3096]}
            zoom={13}
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

      {hasBothLocations && isRouteLoading && (
        <p className="text-sm text-gray-600">Loading live tracking route...</p>
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

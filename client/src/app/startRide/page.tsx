/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = [number, number];

export default function Page() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);

  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [dropLocation, setDropLocation] = useState<any>(null);

  const [route, setRoute] = useState<LatLng[]>([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState<number | string>("");

  const fare = distance ? Number(distance) * 15 : 0;

  const [userPosition, setUserPosition] = useState<LatLng | null>(null);

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
    if (value.length < 3) return;

    const results = await searchLocation(value);
    setPickupSuggestions(results);
  };

  // drop search
  const handleDropChange = async (value: string) => {
    setDrop(value);
    if (value.length < 3) return;

    const results = await searchLocation(value);
    setDropSuggestions(results);
  };

  // get route
  const getRoute = async (pickup: any, drop: any) => {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}?overview=full&geometries=geojson`,
    );

    const data = await res.json();

    const routeData = data.routes[0];

    const coords = routeData.geometry.coordinates.map((c: any) => [c[1], c[0]]);

    setRoute(coords);

    setDistance((routeData.distance / 1000).toFixed(2));
    setDuration(Math.ceil(routeData.duration / 60));
  };

  // book ride
  const handleBookRide = async () => {
    if (!dropLocation) {
      alert("Please select drop location");
      return;
    }

    // case 1: pickup selected
    if (pickupLocation) {
      await getRoute(pickupLocation, dropLocation);
    }

    // case 2: use current GPS
    else if (userPosition) {
      await getRoute(
        { lat: userPosition[0], lon: userPosition[1] },
        dropLocation,
      );
    } else {
      alert("Location not detected");
    }
  };

  // reroute if user moves
  useEffect(() => {
    if (userPosition && dropLocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      getRoute({ lat: userPosition[0], lon: userPosition[1] }, dropLocation);
    }
  }, [userPosition]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-orange-500">SwiftRide Booking</h1>

      {/* Pickup */}
      <div>
        <input
          value={pickup}
          onChange={(e) => handlePickupChange(e.target.value)}
          placeholder="Pickup location"
          className="border p-2 w-full"
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
      <div>
        <input
          value={drop}
          onChange={(e) => handleDropChange(e.target.value)}
          placeholder="Drop location"
          className="border p-2 w-full"
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

      <button
        onClick={handleBookRide}
        className="bg-green-500 text-white px-6 py-2 rounded"
      >
        Book Ride
      </button>

      {/* Distance + Time */}
      {distance && (
        <div className="text-lg font-semibold">
          Distance: {distance} km | Time: {duration} min | Cost: Rs. {fare.toFixed(2)}
        </div>
      )}

      {/* Map */}
      <div className="h-125 w-full">
        <MapContainer
          center={userPosition || [23.3441, 85.3096]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* user */}
          {userPosition && <Marker position={userPosition} />}

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
    </div>
  );
}

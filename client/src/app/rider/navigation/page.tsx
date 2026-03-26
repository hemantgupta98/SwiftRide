"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

type LatLng = [number, number];

type StoredRide = {
  rideId: string;
  pickupLocation?: {
    coordinates: [number, number];
    label?: string;
  };
  pickup?: {
    coordinates: [number, number];
    label?: string;
  };
};

const RIDER_ACTIVE_RIDE_STORAGE_KEY = "rider_active_navigation_ride";

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
  const [pickupCoordinates, setPickupCoordinates] = useState<
    [number, number] | null
  >(null);
  const [pickupLabel, setPickupLabel] = useState("Pickup");
  const [riderCoordinates, setRiderCoordinates] = useState<
    [number, number] | null
  >(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawRide = localStorage.getItem(RIDER_ACTIVE_RIDE_STORAGE_KEY);
    if (!rawRide) {
      setError("No active accepted ride found.");
      return;
    }

    try {
      const ride = JSON.parse(rawRide) as StoredRide;
      const pickup = ride.pickupLocation || ride.pickup;

      if (!pickup?.coordinates || pickup.coordinates.length !== 2) {
        setError("Accepted ride pickup location is invalid.");
        return;
      }

      setPickupCoordinates(pickup.coordinates);
      setPickupLabel(pickup.label || "Pickup");
    } catch {
      setError("Unable to load accepted ride details.");
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation || !pickupCoordinates) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRiderCoordinates([
          position.coords.longitude,
          position.coords.latitude,
        ]);
      },
      () => {
        setError("Unable to get rider current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [pickupCoordinates]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!riderCoordinates || !pickupCoordinates) {
        return;
      }

      try {
        setIsLoadingRoute(true);

        const [riderLng, riderLat] = riderCoordinates;
        const [pickupLng, pickupLat] = pickupCoordinates;

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${riderLng},${riderLat};${pickupLng},${pickupLat}?overview=full&geometries=geojson`,
        );

        const data = await response.json();
        const routeGeometry = data?.routes?.[0]?.geometry?.coordinates;

        if (!Array.isArray(routeGeometry) || routeGeometry.length === 0) {
          setError("Route not found from your location to pickup.");
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
  }, [riderCoordinates, pickupCoordinates]);

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

  const mapCenter: LatLng = pickupMarkerPosition ||
    riderMarkerPosition || [23.3441, 85.3096];

  return (
    <div className="min-h-screen bg-[#0b2a52] p-5 text-white">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-xl bg-white/10 p-4">
          <h1 className="text-2xl font-bold">Navigation to Pickup</h1>
          <p className="mt-1 text-sm text-gray-200">Pickup: {pickupLabel}</p>
          <p className="mt-1 text-xs text-gray-300">
            Pickup coords: {formatCoordinates(pickupCoordinates || undefined)}
          </p>
          <p className="mt-1 text-xs text-gray-300">
            Rider coords: {formatCoordinates(riderCoordinates || undefined)}
          </p>
          {isLoadingRoute && (
            <p className="mt-2 text-sm text-yellow-200">
              Loading navigation route...
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-200">{error}</p>}

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
            {route.length > 0 && <Polyline positions={route} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

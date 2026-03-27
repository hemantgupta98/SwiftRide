"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = {
  lat: number;
  lng: number;
};

const MAP_ZOOM = 14;
const UPDATE_INTERVAL_MS = 2000;
const ARRIVAL_THRESHOLD_METERS = 15;

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  {
    ssr: false,
  },
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
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const pickupIcon = L.divIcon({
  className: "swift-pickup-icon",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#16a34a;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const dropIcon = L.divIcon({
  className: "swift-drop-icon",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#dc2626;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const riderIcon = L.divIcon({
  className: "swift-rider-icon",
  html: '<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#111827;color:#facc15;border:2px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.28);font-size:14px">🏍️</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const toPolylinePoints = (coords: LatLng[]) =>
  coords.map((point) => [point.lat, point.lng] as [number, number]);

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceMeters = (a: LatLng, b: LatLng) => {
  const earthRadius = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return (
    2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

const moveTowards = (from: LatLng, to: LatLng, ratio: number): LatLng => ({
  lat: from.lat + (to.lat - from.lat) * ratio,
  lng: from.lng + (to.lng - from.lng) * ratio,
});

const interpolatePosition = (
  start: LatLng,
  end: LatLng,
  t: number,
): LatLng => ({
  lat: start.lat + (end.lat - start.lat) * t,
  lng: start.lng + (end.lng - start.lng) * t,
});

export default function LiveTrackingMap() {
  const [riderPosition, setRiderPosition] = useState<LatLng>({
    lat: 23.3492,
    lng: 85.3271,
  });
  const [pickupPosition] = useState<LatLng>({ lat: 23.3441, lng: 85.3096 });
  const [dropPosition] = useState<LatLng>({ lat: 23.3569, lng: 85.3348 });
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [animatedRiderPosition, setAnimatedRiderPosition] =
    useState<LatLng>(riderPosition);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const fetchRoute = useCallback(async (from: LatLng, to: LatLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      const route = data?.routes?.[0];

      if (!route?.geometry?.coordinates) {
        setRouteCoordinates([]);
        setDistanceKm(null);
        setEtaMinutes(null);
        return;
      }

      const coordinates: LatLng[] = route.geometry.coordinates.map(
        (coord: [number, number]) => ({ lat: coord[1], lng: coord[0] }),
      );

      setRouteCoordinates(coordinates);
      setDistanceKm(Number((route.distance / 1000).toFixed(2)));
      setEtaMinutes(Math.ceil(route.duration / 60));
    } catch {
      setRouteCoordinates([]);
      setDistanceKm(null);
      setEtaMinutes(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoute(riderPosition, pickupPosition);
  }, [fetchRoute, riderPosition, pickupPosition]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRiderPosition((current) => {
        const distanceToPickup = getDistanceMeters(current, pickupPosition);
        if (distanceToPickup <= ARRIVAL_THRESHOLD_METERS) {
          return current;
        }

        const stepRatio = Math.min(0.22, 130 / distanceToPickup);
        return moveTowards(current, pickupPosition, stepRatio);
      });
    }, UPDATE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pickupPosition]);

  useEffect(() => {
    const start = animatedRiderPosition;
    const end = riderPosition;
    const duration = 1800;
    const startedAt = performance.now();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const next = interpolatePosition(start, end, progress);
      setAnimatedRiderPosition(next);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [riderPosition]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.flyTo(
      [animatedRiderPosition.lat, animatedRiderPosition.lng],
      mapRef.current.getZoom(),
      {
        duration: 1.1,
        easeLinearity: 0.25,
      },
    );
  }, [animatedRiderPosition]);

  const polylinePositions = useMemo(
    () => toPolylinePoints(routeCoordinates),
    [routeCoordinates],
  );

  return (
    <div className="w-full">
      <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
        <p>
          Live route to pickup{distanceKm !== null ? ` • ${distanceKm} km` : ""}
          {etaMinutes !== null ? ` • ETA ${etaMinutes} min` : ""}
        </p>
      </div>

      <MapContainer
        center={[riderPosition.lat, riderPosition.lng]}
        zoom={MAP_ZOOM}
        style={{ height: "520px", width: "100%", borderRadius: "14px" }}
        ref={(map) => {
          if (map) {
            mapRef.current = map;
          }
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[animatedRiderPosition.lat, animatedRiderPosition.lng]}
          icon={riderIcon}
        >
          <Popup>
            Rider moving to pickup
            <br />
            Lat: {animatedRiderPosition.lat.toFixed(5)}, Lng:{" "}
            {animatedRiderPosition.lng.toFixed(5)}
          </Popup>
        </Marker>

        <Marker
          position={[pickupPosition.lat, pickupPosition.lng]}
          icon={pickupIcon}
        >
          <Popup>Pickup Point</Popup>
        </Marker>

        <Marker position={[dropPosition.lat, dropPosition.lng]} icon={dropIcon}>
          <Popup>Drop Point</Popup>
        </Marker>

        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: "#2563eb", weight: 5 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

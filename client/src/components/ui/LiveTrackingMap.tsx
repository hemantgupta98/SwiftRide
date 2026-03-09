"use client";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

type LatLng = [number, number];

export default function LiveTrackingMap() {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);

  // destination example
  const destination: LatLng = [23.3441, 85.3096]; // Ranchi

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const newPos: LatLng = [lat, lng];
        setPosition(newPos);

        // eslint-disable-next-line react-hooks/immutability
        getRoute(newPos, destination);
      },
      (err) => console.log(err),
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  const getRoute = async (start: LatLng, end: LatLng) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
      );

      const data = await res.json();

      const coords = data.routes[0].geometry.coordinates;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const latlngs = coords.map((c: any) => [c[1], c[0]]);

      setRoute(latlngs);
    } catch (err) {
      console.log(err);
    }
  };

  if (!position) return <p>Getting location...</p>;

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User marker */}
      <Marker position={position} />

      {/* Destination marker */}
      <Marker position={destination} />

      {/* Route */}
      <Polyline positions={route} />
    </MapContainer>
  );
}

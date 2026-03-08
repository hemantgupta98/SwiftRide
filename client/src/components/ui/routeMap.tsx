/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";

interface Props {
  route: any;
  pickup: any;
  drop: any;
}

export default function RouteMap({ route, pickup, drop }: Props) {
  if (!route) return null;

  const positions = route.map((p: any) => [p[1], p[0]]);

  return (
    <MapContainer
      center={positions[0]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={[pickup.lat, pickup.lon]}>
        <Popup>Pickup</Popup>
      </Marker>

      <Marker position={[drop.lat, drop.lon]}>
        <Popup>Drop</Popup>
      </Marker>

      <Polyline positions={positions} />
    </MapContainer>
  );
}

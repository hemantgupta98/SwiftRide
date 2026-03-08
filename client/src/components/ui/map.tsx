"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Map() {
  return (
    <MapContainer
      center={[23.3441, 85.3096]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[23.3441, 85.3096]}>
        <Popup>Ranchi Location</Popup>
      </Marker>
    </MapContainer>
  );
}

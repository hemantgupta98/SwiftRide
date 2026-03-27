"use client";

import { useMemo } from "react";

export type LatLng = {
  lat: number;
  lng: number;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineMeters = (from: LatLng, to: LatLng) => {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (meters: number | null) => {
  if (meters === null || !Number.isFinite(meters)) {
    return "";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} meters`;
  }

  return `${(meters / 1000).toFixed(2)} km`;
};

export const useDistance = (from: LatLng | null, to: LatLng | null) => {
  const distanceMeters = useMemo(() => {
    if (!from || !to) {
      return null;
    }

    if (
      !Number.isFinite(from.lat) ||
      !Number.isFinite(from.lng) ||
      !Number.isFinite(to.lat) ||
      !Number.isFinite(to.lng)
    ) {
      return null;
    }

    return haversineMeters(from, to);
  }, [from, to]);

  const distanceKm =
    distanceMeters === null ? null : Number((distanceMeters / 1000).toFixed(2));

  return {
    distanceMeters,
    distanceKm,
    isWithin: (thresholdMeters: number) =>
      distanceMeters !== null && distanceMeters <= thresholdMeters,
    text: formatDistance(distanceMeters),
  };
};

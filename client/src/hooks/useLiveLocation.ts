"use client";

import { useEffect, useRef, useState } from "react";

export type LiveCoords = {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
};

type UseLiveLocationOptions = {
  enabled?: boolean;
  throttleMs?: number;
  minDistanceMeters?: number;
  highAccuracy?: boolean;
  onUpdate?: (coords: LiveCoords) => void;
  onError?: (error: GeolocationPositionError) => void;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceMeters = (a: LiveCoords, b: LiveCoords) => {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      Math.sin(deltaLng / 2) ** 2;

  return (
    2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

export const useLiveLocation = (options: UseLiveLocationOptions = {}) => {
  const {
    enabled = true,
    throttleMs = 2500,
    minDistanceMeters = 2,
    highAccuracy = true,
    onUpdate,
    onError,
  } = options;

  const [coords, setCoords] = useState<LiveCoords | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isWatching, setIsWatching] = useState(false);

  const lastEmitRef = useRef<number>(0);
  const lastAcceptedCoordsRef = useRef<LiveCoords | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMessage("Geolocation is not supported in this browser.");
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const nextCoords: LiveCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };

      const now = Date.now();
      const lastCoords = lastAcceptedCoordsRef.current;
      const movedEnough =
        !lastCoords || distanceMeters(lastCoords, nextCoords) >= minDistanceMeters;
      const throttledEnough = now - lastEmitRef.current >= throttleMs;

      if (!movedEnough || !throttledEnough) {
        return;
      }

      lastAcceptedCoordsRef.current = nextCoords;
      lastEmitRef.current = now;
      setCoords(nextCoords);
      setErrorMessage("");
      onUpdate?.(nextCoords);
    };

    const handleError = (error: GeolocationPositionError) => {
      setErrorMessage(error.message || "Unable to fetch your location.");
      onError?.(error);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 2000,
      },
    );

    setIsWatching(true);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      setIsWatching(false);
    };
  }, [enabled, highAccuracy, minDistanceMeters, onError, onUpdate, throttleMs]);

  return {
    coords,
    errorMessage,
    isWatching,
  };
};

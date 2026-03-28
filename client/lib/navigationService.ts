/**
 * Service for managing navigation data - syncing with both localStorage and backend
 * This helps bridge the gap between client-side tracking and server-side persistence
 */

import { api } from "./api";
import { AxiosError } from "axios";

interface LocationData {
  coordinates: [number, number];
  label?: string;
}

export interface NavigationUpdatePayload {
  riderLocation?: {
    coordinates: [number, number];
  };
  routePath?: {
    coordinates: Array<[number, number]>;
  };
  distanceKm?: number;
  durationMinutes?: number;
  stage?: "toPickup" | "toDrop" | "completed" | "cancelled";
  status?: "in_progress" | "completed" | "cancelled";
}

/**
 * Create navigation history record on the server
 */
export const createNavigationRecord = async (
  riderId: string,
  rideId: string,
  pickupLocation: LocationData,
  dropLocation: LocationData
) => {
  try {
    const response = await api.post("/navigation", {
      riderId,
      rideId,
      stage: "toPickup",
      pickupLocation,
      dropLocation,
      status: "in_progress",
    });

    return response.data?.data;
  } catch (error) {
    console.error("Error creating navigation record:", error);
    throw error;
  }
};

/**
 * Update navigation with location and route data
 */
export const updateNavigationRecord = async (
  navigationId: string,
  updates: NavigationUpdatePayload
) => {
  try {
    const response = await api.patch(`/navigation/${navigationId}`, updates);
    return response.data?.data;
  } catch (error) {
    console.error("Error updating navigation record:", error);
    throw error;
  }
};

/**
 * Mark navigation as completed
 */
export const completeNavigationRecord = async (
  navigationId: string,
  distanceKm: number,
  durationMinutes: number
) => {
  try {
    const response = await api.put(`/navigation/${navigationId}/complete`, {
      distanceKm,
      durationMinutes,
    });

    return response.data?.data;
  } catch (error) {
    console.error("Error completing navigation record:", error);
    throw error;
  }
};

/**
 * Cancel navigation record
 */
export const cancelNavigationRecord = async (navigationId: string) => {
  try {
    const response = await api.put(`/navigation/${navigationId}/cancel`);
    return response.data?.data;
  } catch (error) {
    console.error("Error cancelling navigation record:", error);
    throw error;
  }
};

/**
 * Get active navigation for current rider
 */
export const getActiveNavigation = async (riderId: string) => {
  try {
    const response = await api.get(`/navigation/rider/${riderId}/active`);
    return response.data?.data;
  } catch (error) {
    // 404 is expected when no active navigation
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error("Error fetching active navigation:", error);
    throw error;
  }
};

/**
 * Get navigation history for rider
 */
export const getNavigationHistory = async (
  riderId: string,
  limit: number = 10,
  skip: number = 0
) => {
  try {
    const response = await api.get(
      `/navigation/rider/${riderId}?limit=${limit}&skip=${skip}`
    );

    return {
      history: response.data?.data,
      pagination: response.data?.pagination,
    };
  } catch (error) {
    console.error("Error fetching navigation history:", error);
    throw error;
  }
};

/**
 * Sync local navigation data with server periodically
 * Call this during active navigation to persist location updates
 */
export const syncNavigationToServer = async (
  navigationId: string | null,
  currentStage: "toPickup" | "toDrop",
  riderLocation: [number, number] | null,
  route: Array<[number, number]>,
  distanceKm: number
) => {
  if (!navigationId) {
    console.warn("No navigation ID provided for sync");
    return;
  }

  try {
    await updateNavigationRecord(navigationId, {
      stage: currentStage,
      riderLocation: riderLocation
        ? {
            coordinates: riderLocation,
          }
        : undefined,
      routePath: route?.length
        ? {
            coordinates: route,
          }
        : undefined,
      distanceKm: distanceKm > 0 ? distanceKm : undefined,
    });
  } catch (error) {
    // Non-critical error - continue with local tracking
    const axiosError = error as AxiosError;
    const errorMessage = axiosError?.message || "Unknown error";
    console.warn("Failed to sync navigation to server:", errorMessage);
  }
};

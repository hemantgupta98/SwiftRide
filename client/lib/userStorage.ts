/**
 * Utility functions for user-specific localStorage management
 * Ensures each rider has isolated, non-conflicting data storage
 */

/**
 * Extract user ID from JWT token
 */
export const parseUserIdFromToken = (token: string): string | null => {
  try {
    const base64UrlPayload = token.split(".")[1] || "";
    const base64Payload = base64UrlPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(base64UrlPayload.length / 4) * 4, "=");

    const payload = JSON.parse(atob(base64Payload));
    return payload?.id ? String(payload.id) : null;
  } catch {
    return null;
  }
};

/**
 * Get rider's user ID from localStorage token
 */
export const getRiderId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("token") || "";
  return parseUserIdFromToken(token);
};

/**
 * Create unique storage key for a specific rider
 * @param baseKey - The base key name (e.g., "earnings_history", "online_history")
 * @param riderId - Optional rider ID (will use current token if not provided)
 */
export const getUserStorageKey = (baseKey: string, riderId?: string): string => {
  const id = riderId || getRiderId();
  if (!id) {
    console.warn(`[userStorage] Could not get rider ID for key: ${baseKey}`);
    return baseKey; // Fallback to base key if no rider ID available
  }
  return `rider_${id}_${baseKey}`;
};

/**
 * Storage keys for rider data
 */
export const getEarningsStorageKey = (riderId?: string): string =>
  getUserStorageKey("earnings_history", riderId);

export const getPayoutsStorageKey = (riderId?: string): string =>
  getUserStorageKey("payouts_history", riderId);

export const getOnlineHistoryStorageKey = (riderId?: string): string =>
  getUserStorageKey("online_history", riderId);

export const getOnlineActiveStartStorageKey = (riderId?: string): string =>
  getUserStorageKey("online_active_start", riderId);

export const getActiveRideStorageKey = (riderId?: string): string =>
  getUserStorageKey("active_navigation_ride", riderId);

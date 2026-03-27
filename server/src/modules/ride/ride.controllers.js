import {
  claimRewardByUserId,
  createRideBooking,
  findRideHistoryByRiderId,
  findRideHistoryByUserId,
  findNearbyOnlineRiders,
  getRewardsStatusByUserId,
  updateRiderLiveLocation,
} from "./ride.service.js";
import { dispatchRideRequestToNearbyRiders } from "../../sockets/ride.socket.js";
import { createNotification } from "../notification/notification.service.js";

const updateRiderLocationController = async (req, res) => {
  try {
    const { lng, lat, isOnline } = req.body;
    const riderId = req.user?.id;

    if (!riderId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (req.user?.role !== "rider") {
      return res.status(403).json({
        success: false,
        message: "Only riders can update rider location",
      });
    }

    if (lng === undefined || lat === undefined) {
      return res.status(400).json({
        success: false,
        message: "lng and lat are required",
      });
    }

    const rider = await updateRiderLiveLocation({
      riderId,
      coordinates: [lng, lat],
      isOnline,
    });

    return res.status(200).json({
      success: true,
      message: "Rider location updated",
      data: rider,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update rider location",
    });
  }
};

const findNearbyRidersController = async (req, res) => {
  try {
    const lng = Number(req.query.lng);
    const lat = Number(req.query.lat);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return res.status(400).json({
        success: false,
        message: "Valid lng and lat query params are required",
      });
    }

    const riders = await findNearbyOnlineRiders({
      pickupCoordinates: [lng, lat],
      radiusKm: 2,
    });

    return res.status(200).json({
      success: true,
      count: riders.length,
      data: riders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch nearby riders",
    });
  }
};

const bookRideController = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      pickup,
      drop,
      distance,
      estimatedTime,
      fare,
    } = req.body;

    const resolvedCustomerId = req.user?.id;

    if (!resolvedCustomerId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can book rides",
      });
    }

    const resolvedPickup =
      pickupLocation ||
      (pickup
        ? {
            coordinates: [pickup.lng, pickup.lat],
            label: pickup.label || "Pickup",
          }
        : null);

    const resolvedDrop =
      dropLocation ||
      (drop
        ? {
            coordinates: [drop.lng, drop.lat],
            label: drop.label || "Drop",
          }
        : null);

    if (!resolvedCustomerId || !resolvedPickup || !resolvedDrop) {
      return res.status(400).json({
        success: false,
        message: "customerId, pickupLocation and dropLocation are required",
      });
    }

    const ride = await createRideBooking({
      customerId: resolvedCustomerId,
      pickupLocation: resolvedPickup,
      dropLocation: resolvedDrop,
      distance,
      estimatedTime,
      fare,
    });

    await createNotification({
      userId: resolvedCustomerId,
      type: "RIDE_BOOKED",
      title: "Ride Booked",
      message: "Your ride request has been created successfully.",
    });

    await dispatchRideRequestToNearbyRiders(ride);

    return res.status(201).json({
      success: true,
      message: "Ride booking created",
      data: {
        rideId: ride._id,
        userId: ride.userId,
        pickup: ride.pickup,
        drop: ride.drop,
        distanceKm: ride.distanceKm,
        fareAmount: ride.fareAmount,
        estimatedMinutes: ride.estimatedMinutes,
        status: ride.status,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to book ride",
    });
  }
};

const getRideHistoryController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    let rides = [];
    if (role === "rider") {
      rides = await findRideHistoryByRiderId(userId);
    } else {
      rides = await findRideHistoryByUserId(userId);
    }

    return res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch ride history",
    });
  }
};

const getRewardsStatusController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can access reward status",
      });
    }

    const rewardStatus = await getRewardsStatusByUserId(userId);

    return res.status(200).json({
      success: true,
      data: rewardStatus,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch rewards status",
    });
  }
};

const claimRewardController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const targetRides = Number(req.body?.targetRides);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can claim rewards",
      });
    }

    if (!Number.isFinite(targetRides)) {
      return res.status(400).json({
        success: false,
        message: "targetRides is required",
      });
    }

    const claimedReward = await claimRewardByUserId({
      userId,
      targetRides,
    });

    return res.status(200).json({
      success: true,
      message: "Reward claimed successfully",
      data: claimedReward,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to claim reward",
    });
  }
};

export {
  bookRideController,
  claimRewardController,
  findNearbyRidersController,
  getRewardsStatusController,
  getRideHistoryController,
  updateRiderLocationController,
};

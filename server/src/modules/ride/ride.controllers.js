import {
  createRideBooking,
  findNearbyOnlineRiders,
  updateRiderLiveLocation,
} from "./ride.service.js";
import { dispatchRideRequestToNearbyRiders } from "../../sockets/ride.socket.js";

const updateRiderLocationController = async (req, res) => {
  try {
    const { riderId, lng, lat, isOnline } = req.body;

    if (!riderId || lng === undefined || lat === undefined) {
      return res.status(400).json({
        success: false,
        message: "riderId, lng and lat are required",
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
    const { userId, pickup, drop } = req.body;

    if (!userId || !pickup || !drop) {
      return res.status(400).json({
        success: false,
        message: "userId, pickup and drop are required",
      });
    }

    const ride = await createRideBooking({
      userId,
      pickupCoordinates: [pickup.lng, pickup.lat],
      dropCoordinates: [drop.lng, drop.lat],
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

export {
  bookRideController,
  findNearbyRidersController,
  updateRiderLocationController,
};

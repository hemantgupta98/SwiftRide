import {
  RIDE_REQUEST_TIMEOUT_MS,
  addRideRequestedRiders,
  acceptRideByRider,
  cancelRideByCustomer,
  declineRideByRider,
  findNearbyOnlineRiders,
  markRideStarted,
  markRideCompleted,
  markRideTimedOut,
  setRiderOnlineState,
  updateRiderLiveLocation,
} from "../modules/ride/ride.service.js";
import Ride from "../modules/ride/ride.model.js";
import { createNotification } from "../modules/notification/notification.service.js";
import { createRideNotification } from "../modules/rideNotification/rideNotification.service.js";

const riderSocketMap = new Map();
const userSocketMap = new Map();
const socketToRiderMap = new Map();
const socketToUserMap = new Map();
const rideTimeoutMap = new Map();

const emitToUser = (io, userId, eventName, payload) => {
  if (!userId) return;

  const userSocketId = userSocketMap.get(String(userId));
  if (userSocketId) {
    io.to(userSocketId).emit(eventName, payload);
  }

  io.to(String(userId)).emit(eventName, payload);
};

const emitToRider = (io, riderId, eventName, payload) => {
  if (!riderId) return;

  const riderSocketId = riderSocketMap.get(String(riderId));
  if (riderSocketId) {
    io.to(riderSocketId).emit(eventName, payload);
  }

  io.to(String(riderId)).emit(eventName, payload);
};

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceKm = (fromCoordinates = [], toCoordinates = []) => {
  const [fromLng, fromLat] = fromCoordinates.map(Number);
  const [toLng, toLat] = toCoordinates.map(Number);

  if (
    !Number.isFinite(fromLng) ||
    !Number.isFinite(fromLat) ||
    !Number.isFinite(toLng) ||
    !Number.isFinite(toLat)
  ) {
    return null;
  }

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(2));
};

const clearRideTimeout = (rideId) => {
  const existingTimeout = rideTimeoutMap.get(String(rideId));
  if (existingTimeout) {
    clearTimeout(existingTimeout);
    rideTimeoutMap.delete(String(rideId));
  }
};

const notifyRidersRideTimedOut = async (ride) => {
  const requestedRiderIds = Array.isArray(ride?.requestedRiderIds)
    ? ride.requestedRiderIds
    : [];

  await Promise.all(
    requestedRiderIds.map((riderId) =>
      createRideNotification({
        riderId,
        rideId: ride._id,
        type: "RIDE_TIMEOUT",
        title: "Ride Timed Out",
        message: "Ride request timed out before confirmation.",
      }),
    ),
  );
};

const emitRideNoRider = async (io, ride) => {
  emitToUser(io, ride.userId, "rideNoRider", {
    rideId: String(ride._id),
    message: "No rider accepted your request",
  });

  await createNotification({
    userId: ride.userId,
    type: "RIDE_TIMEOUT",
    title: "Ride Not Assigned",
    message: "No rider accepted your request. Please try booking again.",
  });

  await notifyRidersRideTimedOut(ride);
};

const startRideRequestTimeout = (io, ride) => {
  clearRideTimeout(ride._id);

  const timeoutId = setTimeout(async () => {
    const timedOutRide = await markRideTimedOut(ride._id);
    if (!timedOutRide) return;

    await emitRideNoRider(io, timedOutRide);
  }, RIDE_REQUEST_TIMEOUT_MS);

  rideTimeoutMap.set(String(ride._id), timeoutId);
};

const dispatchRideRequestToNearbyRiders = async (ride) => {
  const { getIO } = await import("../middleware/socket.js");
  const io = getIO();

  const nearbyRiders = await findNearbyOnlineRiders({
    pickupCoordinates: ride.pickup.coordinates,
    radiusKm: 2,
  });

  if (!nearbyRiders.length) {
    await markRideTimedOut(ride._id);
    await emitRideNoRider(io, ride);
    return;
  }

  const riderIds = nearbyRiders.map((rider) => rider._id);
  await addRideRequestedRiders(ride._id, riderIds);

  const requestPayload = {
    rideId: String(ride._id),
    customerId: String(ride.userId),
    pickupLocation: {
      coordinates: ride.pickup.coordinates,
      label: ride.pickup.label,
    },
    dropLocation: {
      coordinates: ride.drop.coordinates,
      label: ride.drop.label,
    },
    distance: ride.distanceKm,
    fare: ride.fareAmount,
    estimatedTime: ride.estimatedMinutes,
    pickup: ride.pickup,
    drop: ride.drop,
    distanceKm: ride.distanceKm,
    fareAmount: ride.fareAmount,
    estimatedMinutes: ride.estimatedMinutes,
    timeoutSeconds: Math.floor(RIDE_REQUEST_TIMEOUT_MS / 1000),
    message: "New ride request nearby",
  };

  for (const rider of nearbyRiders) {
    const riderSocketId = riderSocketMap.get(String(rider._id));

    if (riderSocketId) {
      io.to(riderSocketId).emit("newRideRequest", requestPayload);
    }

    io.to(String(rider._id)).emit("newRideRequest", requestPayload);

    await createRideNotification({
      riderId: rider._id,
      rideId: ride._id,
      type: "RIDE_COMES",
      title: "New Ride Comes",
      message: "New ride request received near your location.",
      meta: {
        distanceKm: ride.distanceKm,
        fareAmount: ride.fareAmount,
        estimatedMinutes: ride.estimatedMinutes,
      },
    });
  }

  startRideRequestTimeout(io, ride);
};

const handleRiderAcceptRide = async (io, socket, payload) => {
  try {
    const { rideId, riderId } = payload || {};

    const acceptedRide = await acceptRideByRider({
      rideId,
      riderId,
    });

    if (!acceptedRide) {
      socket.emit("rideAcceptFailed", {
        rideId,
        message: "Ride already accepted or unavailable",
      });
      return;
    }

    clearRideTimeout(acceptedRide._id);

    socket.emit("rideAcceptSuccess", {
      rideId: String(acceptedRide._id),
      status: acceptedRide.status,
    });

    await createRideNotification({
      riderId: acceptedRide.riderId,
      rideId: acceptedRide._id,
      type: "RIDE_ACCEPTED",
      title: "Ride Accepted",
      message: "You accepted this ride successfully.",
    });

    const acceptedPayload = {
      rideId: String(acceptedRide._id),
      riderId: String(acceptedRide.riderId),
      pickupLocation: {
        coordinates: acceptedRide.pickup.coordinates,
        label: acceptedRide.pickup.label,
      },
      dropLocation: {
        coordinates: acceptedRide.drop.coordinates,
        label: acceptedRide.drop.label,
      },
      distance: acceptedRide.distanceKm,
      fare: acceptedRide.fareAmount,
      estimatedTime: acceptedRide.estimatedMinutes,
      pickup: acceptedRide.pickup,
      drop: acceptedRide.drop,
      distanceKm: acceptedRide.distanceKm,
      fareAmount: acceptedRide.fareAmount,
      estimatedMinutes: acceptedRide.estimatedMinutes,
      message: "Your ride is accepted. Rider is coming!",
    };

    emitToUser(io, acceptedRide.userId, "rideAccepted", acceptedPayload);
    emitToUser(io, acceptedRide.userId, "ride_accepted", acceptedPayload);

    await createNotification({
      userId: acceptedRide.userId,
      type: "RIDE_ACCEPTED",
      title: "Ride Accepted",
      message: "A rider has accepted your ride request.",
    });

    for (const requestedRiderId of acceptedRide.requestedRiderIds || []) {
      if (String(requestedRiderId) === String(acceptedRide.riderId)) {
        continue;
      }

      io.to(String(requestedRiderId)).emit("rideTaken", {
        rideId: String(acceptedRide._id),
        acceptedBy: String(acceptedRide.riderId),
      });

      await createRideNotification({
        riderId: requestedRiderId,
        rideId: acceptedRide._id,
        type: "RIDE_TAKEN",
        title: "Ride Taken",
        message: "This ride was accepted by another rider.",
      });
    }
  } catch (error) {
    socket.emit("rideAcceptFailed", {
      message: error.message || "Failed to accept ride",
    });
  }
};

const handleRiderDeclineRide = async (io, socket, payload) => {
  try {
    const { rideId, riderId } = payload || {};

    const declinedRide = await declineRideByRider({ rideId, riderId });
    if (!declinedRide) {
      return;
    }

    socket.emit("rideDeclined", {
      rideId: String(declinedRide._id),
      status: declinedRide.status,
    });

    await createRideNotification({
      riderId,
      rideId: declinedRide._id,
      type: "RIDE_DECLINED",
      title: "Ride Declined",
      message: "You declined this ride request.",
    });

    emitToUser(io, declinedRide.userId, "rideRejected", {
      rideId: String(declinedRide._id),
      riderId: String(riderId),
      message: "Sorry, ride reject your ride.",
    });

    const uniqueRequested = new Set(
      (declinedRide.requestedRiderIds || []).map((id) => String(id)),
    );
    const uniqueDeclined = new Set(
      (declinedRide.declinedRiderIds || []).map((id) => String(id)),
    );

    if (
      declinedRide.status === "searching" &&
      uniqueRequested.size > 0 &&
      uniqueRequested.size === uniqueDeclined.size
    ) {
      const timedOutRide = await markRideTimedOut(declinedRide._id);
      if (timedOutRide) {
        clearRideTimeout(timedOutRide._id);
        await emitRideNoRider(io, timedOutRide);
      }
    }
  } catch (error) {
    socket.emit("rideDeclineFailed", {
      message: error.message || "Failed to decline ride",
    });
  }
};

const handleRideCancelledByCustomer = async (io, socket, payload) => {
  try {
    const { rideId, userId } = payload || {};
    const resolvedUserId = userId || socketToUserMap.get(socket.id);

    if (!rideId || !resolvedUserId) {
      socket.emit("rideCancelFailed", {
        message: "rideId and userId are required",
      });
      return;
    }

    const cancelledRide = await cancelRideByCustomer({
      rideId,
      userId: resolvedUserId,
    });

    clearRideTimeout(cancelledRide._id);

    const cancelPayload = {
      rideId: String(cancelledRide._id),
      riderId: cancelledRide?.riderId ? String(cancelledRide.riderId) : null,
      userId: String(cancelledRide.userId),
      message: "Customer cancelled the ride",
      status: cancelledRide.status,
    };

    socket.emit("rideCancelled", cancelPayload);
    socket.emit("ride_cancelled", cancelPayload);

    if (cancelledRide.riderId) {
      emitToRider(io, cancelledRide.riderId, "rideCancelled", {
        ...cancelPayload,
        message: "Customer cancelled the ride. Sorry!",
      });
      emitToRider(io, cancelledRide.riderId, "ride_cancelled", {
        ...cancelPayload,
        message: "Customer cancelled the ride. Sorry!",
      });
    }

    await createNotification({
      userId: cancelledRide.userId,
      type: "RIDE_CANCELLED",
      title: "Ride Cancelled",
      message: "Your ride has been cancelled.",
    });
  } catch (error) {
    socket.emit("rideCancelFailed", {
      message: error.message || "Failed to cancel ride",
    });
  }
};

const handleRideStarted = async (io, socket, payload) => {
  try {
    const { rideId, riderId } = payload || {};
    if (!rideId || !riderId) {
      socket.emit("rideStartFailed", {
        message: "rideId and riderId are required",
      });
      return;
    }

    const startedRide = await markRideStarted({ rideId, riderId });

    const startedPayload = {
      rideId: String(startedRide._id),
      riderId: String(startedRide.riderId),
      userId: String(startedRide.userId),
      status: startedRide.status,
      pickupLocation: startedRide.pickup,
      dropLocation: startedRide.drop,
      message: "Ride started",
    };

    socket.emit("rideStarted", startedPayload);
    socket.emit("ride_started", startedPayload);
    emitToUser(io, startedRide.userId, "rideStarted", startedPayload);
    emitToUser(io, startedRide.userId, "ride_started", startedPayload);
  } catch (error) {
    socket.emit("rideStartFailed", {
      message: error.message || "Failed to start ride",
    });
  }
};

const handleRideCompleted = async (io, socket, payload) => {
  try {
    const { rideId, riderId } = payload || {};

    if (!rideId || !riderId) {
      socket.emit("rideCompleteFailed", {
        message: "rideId and riderId are required",
      });
      return;
    }

    const completedRide = await markRideCompleted({ rideId, riderId });

    const completedPayload = {
      rideId: String(completedRide._id),
      riderId: String(completedRide.riderId),
      userId: String(completedRide.userId),
      status: completedRide.status,
      completedAt: completedRide.completedAt,
      pickupLocation: completedRide.pickup,
      dropLocation: completedRide.drop,
      distanceKm: completedRide.distanceKm,
      fareAmount: completedRide.fareAmount,
      message: "Ride completed successfully",
    };

    // Emit to rider
    socket.emit("rideCompleted", completedPayload);
    socket.emit("ride_completed", completedPayload);

    // Emit to customer
    emitToUser(io, completedRide.userId, "rideCompleted", completedPayload);
    emitToUser(io, completedRide.userId, "ride_completed", completedPayload);

    // Create notification for customer
    await createNotification({
      userId: completedRide.userId,
      type: "RIDE_COMPLETED",
      title: "Ride Completed",
      message: `Your ride has been completed. Fare: ₹${completedRide.fareAmount}`,
    });
  } catch (error) {
    socket.emit("rideCompleteFailed", {
      message: error.message || "Failed to complete ride",
    });
  }
};

const registerRideSocketHandlers = (io, socket) => {
  socket.on("registerRider", async (payload = {}) => {
    try {
      const { riderId, location } = payload;

      if (!riderId) {
        socket.emit("riderRegistrationFailed", {
          message: "riderId is required",
        });
        return;
      }

      riderSocketMap.set(String(riderId), socket.id);
      socketToRiderMap.set(socket.id, String(riderId));
      socket.join(String(riderId));

      if (location?.lng !== undefined && location?.lat !== undefined) {
        await updateRiderLiveLocation({
          riderId,
          coordinates: [location.lng, location.lat],
          isOnline: true,
        });
      } else {
        const rider = await setRiderOnlineState(riderId, true);
        if (!rider) {
          throw new Error("Rider not found");
        }
      }
    } catch (error) {
      socket.emit("riderRegistrationFailed", {
        message: error.message || "Failed to the register rider",
      });
    }
  });

  const registerUserSocket = (payload = {}) => {
    const { userId } = payload;
    if (!userId) {
      return;
    }

    userSocketMap.set(String(userId), socket.id);
    socketToUserMap.set(socket.id, String(userId));
    socket.join(String(userId));
  };

  socket.on("registerUser", registerUserSocket);
  socket.on("registerUserIs", registerUserSocket);

  const handleLocationUpdate = async (payload = {}) => {
    try {
      const { riderId, lng, lat, isOnline } = payload;
      if (!riderId || lng === undefined || lat === undefined) {
        return;
      }

      const rider = await updateRiderLiveLocation({
        riderId,
        coordinates: [lng, lat],
        isOnline,
      });

      socket.emit("riderLocationUpdated", {
        riderId: String(rider._id),
        location: rider.location,
        isOnline: rider.isOnline,
      });

      const activeRide = await Ride.findOne({
        riderId,
        status: {
          $in: ["accepted", "started"],
        },
      })
        .sort({ acceptedAt: -1 })
        .select("_id userId pickup")
        .lean();

      if (activeRide?.userId) {
        const riderCoordinates = rider?.location?.coordinates || [lng, lat];
        const pickupCoordinates = activeRide?.pickup?.coordinates || [];

        const locationPayload = {
          rideId: String(activeRide._id),
          riderId: String(rider._id),
          riderLocation: {
            coordinates: riderCoordinates,
            label: rider?.location?.label || "Rider",
          },
          pickupLocation: {
            coordinates: pickupCoordinates,
            label: activeRide?.pickup?.label || "Pickup",
          },
          distanceToPickupKm: calculateDistanceKm(
            riderCoordinates,
            pickupCoordinates,
          ),
        };

        emitToUser(
          io,
          activeRide.userId,
          "riderLocationUpdatedForUser",
          locationPayload,
        );
        emitToUser(io, activeRide.userId, "location_update", locationPayload);
      }
    } catch (error) {
      socket.emit("riderLocationUpdateFailed", {
        message: error.message || "Failed to update location",
      });
    }
  };

  socket.on("updateRiderLocation", handleLocationUpdate);
  socket.on("location_update", handleLocationUpdate);

  socket.on("acceptRide", (payload) =>
    handleRiderAcceptRide(io, socket, payload),
  );
  socket.on("rideAccepted", (payload) =>
    handleRiderAcceptRide(io, socket, payload),
  );
  socket.on("ride_accepted", (payload) =>
    handleRiderAcceptRide(io, socket, payload),
  );
  socket.on("declineRide", (payload) =>
    handleRiderDeclineRide(io, socket, payload),
  );
  socket.on("ride_cancelled", (payload) =>
    handleRideCancelledByCustomer(io, socket, payload),
  );
  socket.on("ride_started", (payload) =>
    handleRideStarted(io, socket, payload),
  );
  socket.on("rideCompleted", (payload) =>
    handleRideCompleted(io, socket, payload),
  );
  socket.on("ride_completed", (payload) =>
    handleRideCompleted(io, socket, payload),
  );

  socket.on("disconnect", async () => {
    const riderId = socketToRiderMap.get(socket.id);
    if (riderId) {
      riderSocketMap.delete(riderId);
      socketToRiderMap.delete(socket.id);
      await setRiderOnlineState(riderId, false);
    }

    const userId = socketToUserMap.get(socket.id);
    if (userId) {
      userSocketMap.delete(userId);
      socketToUserMap.delete(socket.id);
    }
  });
};

const getOnlineSocketMaps = () => ({
  riderSocketMap,
  userSocketMap,
});

export {
  dispatchRideRequestToNearbyRiders,
  getOnlineSocketMaps,
  registerRideSocketHandlers,
};

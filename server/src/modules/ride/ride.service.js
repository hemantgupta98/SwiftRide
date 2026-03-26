import mongoose from "mongoose";
import { Rider, User, googleDB } from "../auth/auth.model.js";
import Ride from "./ride.model.js";

const RIDE_REQUEST_TIMEOUT_MS = 30000;
const REWARD_MESSAGE = "You get 2 days for free rides";
const REWARD_MILESTONES = [5, 10, 15, 20];

const REWARD_DEFINITIONS = [
  {
    rides: 5,
    title: "Starter Reward",
    description: "Complete 5 rides and unlock 2 days for free rides.",
  },
  {
    rides: 10,
    title: "Silver Reward",
    description: "Complete 10 rides and unlock 2 days for free rides.",
  },
  {
    rides: 15,
    title: "Gold Reward",
    description: "Complete 15 rides and unlock 2 days for free rides.",
  },
  {
    rides: 20,
    title: "Platinum Reward",
    description: "Complete 20 rides and unlock 2 days for free rides.",
  },
];

const toRadians = (value) => (value * Math.PI) / 180;

const normalizeCoordinates = (coordinates = []) => {
  const [lng, lat] = coordinates.map(Number);
  return [lng, lat];
};

const assertCoordinates = (coordinates = []) => {
  const [lng, lat] = normalizeCoordinates(coordinates);

  if (
    !Number.isFinite(lng) ||
    !Number.isFinite(lat) ||
    lng < -180 ||
    lng > 180 ||
    lat < -90 ||
    lat > 90
  ) {
    throw new Error("Invalid coordinates. Use [lng, lat]");
  }

  return [lng, lat];
};

const toGeoPoint = (coordinates, label = "") => ({
  type: "Point",
  coordinates: assertCoordinates(coordinates),
  label,
});

const haversineDistanceKm = (fromCoordinates, toCoordinates) => {
  const [fromLng, fromLat] = assertCoordinates(fromCoordinates);
  const [toLng, toLat] = assertCoordinates(toCoordinates);

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

const estimateRideMetrics = (pickupCoordinates, dropCoordinates) => {
  const distanceKm = haversineDistanceKm(pickupCoordinates, dropCoordinates);
  const baseFare = 35;
  const perKmRate = 12;
  const fareAmount = Number((baseFare + distanceKm * perKmRate).toFixed(2));

  const avgSpeedKmPerHr = 28;
  const estimatedMinutes = Math.max(
    3,
    Math.ceil((distanceKm / avgSpeedKmPerHr) * 60 + 2),
  );

  return {
    distanceKm,
    fareAmount,
    estimatedMinutes,
  };
};

const updateRiderLiveLocation = async ({ riderId, coordinates, isOnline }) => {
  if (!mongoose.Types.ObjectId.isValid(riderId)) {
    throw new Error("Invalid riderId");
  }

  const updatePayload = {
    location: toGeoPoint(coordinates),
  };

  if (typeof isOnline === "boolean") {
    updatePayload.isOnline = isOnline;
  }

  const rider = await Rider.findByIdAndUpdate(riderId, updatePayload, {
    returnDocument: "after",
    runValidators: true,
  }).select("_id name isOnline location");

  if (!rider) {
    throw new Error("Rider not found");
  }

  return rider;
};

const setRiderOnlineState = async (riderId, isOnline) => {
  if (!mongoose.Types.ObjectId.isValid(riderId)) {
    return null;
  }

  return Rider.findByIdAndUpdate(
    riderId,
    { isOnline },
    {
      returnDocument: "after",
    },
  ).select("_id isOnline");
};

const findNearbyOnlineRiders = async ({
  pickupCoordinates,
  radiusKm = 2,
  excludeRiderIds = [],
}) => {
  const safePickupCoordinates = assertCoordinates(pickupCoordinates);
  const maxDistanceMeters = Math.round(radiusKm * 1000);

  const excludeIds = excludeRiderIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const query = {
    isOnline: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: safePickupCoordinates,
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  };

  if (excludeIds.length > 0) {
    query._id = { $nin: excludeIds };
  }

  return Rider.find(query)
    .select("_id name location isOnline vechileType")
    .lean();
};

const createRideBooking = async ({
  customerId,
  userId,
  pickupLocation,
  dropLocation,
  pickupCoordinates,
  dropCoordinates,
  distance,
  estimatedTime,
  fare,
}) => {
  const resolvedCustomerId = customerId || userId;

  if (!mongoose.Types.ObjectId.isValid(resolvedCustomerId)) {
    throw new Error("Invalid customerId");
  }

  const pickupSource = pickupLocation?.coordinates || pickupCoordinates;
  const dropSource = dropLocation?.coordinates || dropCoordinates;

  const pickup = assertCoordinates(pickupSource);
  const drop = assertCoordinates(dropSource);

  const hasProvidedMetrics =
    Number.isFinite(Number(distance)) &&
    Number(distance) >= 0 &&
    Number.isFinite(Number(fare)) &&
    Number(fare) >= 0 &&
    Number.isFinite(Number(estimatedTime)) &&
    Number(estimatedTime) >= 1;

  const calculatedMetrics = estimateRideMetrics(pickup, drop);

  const distanceKm = hasProvidedMetrics
    ? Number(Number(distance).toFixed(2))
    : calculatedMetrics.distanceKm;
  const fareAmount = hasProvidedMetrics
    ? Number(Number(fare).toFixed(2))
    : calculatedMetrics.fareAmount;
  const estimatedMinutes = hasProvidedMetrics
    ? Math.ceil(Number(estimatedTime))
    : calculatedMetrics.estimatedMinutes;

  return Ride.create({
    userId: resolvedCustomerId,
    pickup: toGeoPoint(pickup, pickupLocation?.label || "Pickup"),
    drop: toGeoPoint(drop, dropLocation?.label || "Drop"),
    distanceKm,
    fareAmount,
    estimatedMinutes,
    status: "searching",
    expiresAt: new Date(Date.now() + RIDE_REQUEST_TIMEOUT_MS),
  });
};

const addRideRequestedRiders = async (rideId, riderIds = []) => {
  const validRiderIds = riderIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (validRiderIds.length === 0) {
    return Ride.findById(rideId);
  }

  return Ride.findByIdAndUpdate(
    rideId,
    {
      $addToSet: {
        requestedRiderIds: {
          $each: validRiderIds,
        },
      },
    },
    { returnDocument: "after" },
  );
};

const acceptRideByRider = async ({ rideId, riderId }) => {
  if (
    !mongoose.Types.ObjectId.isValid(rideId) ||
    !mongoose.Types.ObjectId.isValid(riderId)
  ) {
    throw new Error("Invalid rideId or riderId");
  }

  const ride = await Ride.findOneAndUpdate(
    {
      _id: rideId,
      status: "searching",
      riderId: null,
    },
    {
      $set: {
        riderId,
        status: "accepted",
        acceptedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  return ride;
};

const declineRideByRider = async ({ rideId, riderId }) => {
  if (
    !mongoose.Types.ObjectId.isValid(rideId) ||
    !mongoose.Types.ObjectId.isValid(riderId)
  ) {
    throw new Error("Invalid rideId or riderId");
  }

  return Ride.findOneAndUpdate(
    {
      _id: rideId,
      status: "searching",
    },
    {
      $addToSet: {
        declinedRiderIds: riderId,
      },
    },
    { returnDocument: "after" },
  );
};

const markRideTimedOut = async (rideId) => {
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    return null;
  }

  return Ride.findOneAndUpdate(
    {
      _id: rideId,
      status: "searching",
    },
    {
      $set: {
        status: "timeout",
      },
    },
    { returnDocument: "after" },
  );
};

const findRideById = async (rideId) => {
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    return null;
  }

  return Ride.findById(rideId).lean();
};

const findRideHistoryByUserId = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  return Ride.find({ userId })
    .sort({ createdAt: -1 })
    .select(
      "_id pickup drop distanceKm fareAmount estimatedMinutes status createdAt updatedAt",
    )
    .lean();
};

const resolveCustomerModelById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const customer = await User.findById(userId).select("_id rewardClaims");
  if (customer) {
    return {
      customer,
      customerModel: User,
    };
  }

  const googleCustomer = await googleDB
    .findById(userId)
    .select("_id rewardClaims");

  if (googleCustomer) {
    return {
      customer: googleCustomer,
      customerModel: googleDB,
    };
  }

  throw new Error("Customer not found");
};

const countCompletedRidesByUserId = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  return Ride.countDocuments({
    userId,
    status: "completed",
  });
};

const getRewardsStatusByUserId = async (userId) => {
  const [{ customer }, completedRides] = await Promise.all([
    resolveCustomerModelById(userId),
    countCompletedRidesByUserId(userId),
  ]);

  const claimedMilestones = new Set(
    (customer.rewardClaims || []).map((claim) => Number(claim.targetRides)),
  );

  const milestones = REWARD_DEFINITIONS.map((reward) => {
    const isUnlocked = completedRides >= reward.rides;
    const isClaimed = claimedMilestones.has(reward.rides);

    return {
      ...reward,
      rewardMessage: REWARD_MESSAGE,
      isUnlocked,
      isClaimed,
      canClaim: isUnlocked && !isClaimed,
    };
  });

  return {
    completedRides,
    rewardMessage: REWARD_MESSAGE,
    milestones,
  };
};

const claimRewardByUserId = async ({ userId, targetRides }) => {
  const safeTargetRides = Number(targetRides);

  if (!REWARD_MILESTONES.includes(safeTargetRides)) {
    throw new Error("Invalid reward milestone");
  }

  const [{ customer, customerModel }, completedRides] = await Promise.all([
    resolveCustomerModelById(userId),
    countCompletedRidesByUserId(userId),
  ]);

  if (completedRides < safeTargetRides) {
    throw new Error("Target rides not completed yet");
  }

  const alreadyClaimed = (customer.rewardClaims || []).some(
    (claim) => Number(claim.targetRides) === safeTargetRides,
  );

  if (alreadyClaimed) {
    throw new Error("Reward already claimed");
  }

  const updatedCustomer = await customerModel.findOneAndUpdate(
    {
      _id: userId,
      "rewardClaims.targetRides": { $ne: safeTargetRides },
    },
    {
      $push: {
        rewardClaims: {
          targetRides: safeTargetRides,
          rewardMessage: REWARD_MESSAGE,
          claimedAt: new Date(),
        },
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedCustomer) {
    throw new Error("Reward already claimed");
  }

  const reward = REWARD_DEFINITIONS.find(
    (definition) => definition.rides === safeTargetRides,
  );

  return {
    targetRides: safeTargetRides,
    rewardMessage: REWARD_MESSAGE,
    title: reward?.title || "Reward",
    description: reward?.description || "Reward unlocked",
  };
};

export {
  RIDE_REQUEST_TIMEOUT_MS,
  REWARD_MILESTONES,
  addRideRequestedRiders,
  acceptRideByRider,
  claimRewardByUserId,
  createRideBooking,
  countCompletedRidesByUserId,
  declineRideByRider,
  estimateRideMetrics,
  findNearbyOnlineRiders,
  findRideById,
  findRideHistoryByUserId,
  getRewardsStatusByUserId,
  haversineDistanceKm,
  markRideTimedOut,
  resolveCustomerModelById,
  setRiderOnlineState,
  updateRiderLiveLocation,
};

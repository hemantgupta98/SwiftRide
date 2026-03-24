import { getIO } from "../../middleware/socket.js";
import { RideNotification } from "./rideNotification.model.js";

export const createRideNotification = async ({
  riderId,
  rideId = null,
  type,
  title,
  message,
  meta = null,
}) => {
  const notification = await RideNotification.create({
    rider: riderId,
    rideId,
    type,
    title,
    message,
    meta,
  });

  try {
    const io = getIO();
    io.to(String(riderId)).emit("new-rider-notification", notification);
  } catch (error) {
    console.warn("Ride notification socket emit skipped:", error.message);
  }

  return notification;
};

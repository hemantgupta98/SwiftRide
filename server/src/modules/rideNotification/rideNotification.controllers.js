import { RideNotification } from "./rideNotification.model.js";

export const createRideNotificationForRider = async (req, res) => {
  try {
    if (req.user?.role !== "rider") {
      return res.status(403).json({
        success: false,
        message: "Only riders can create rider notifications",
      });
    }

    const { type, title, message, rideId, meta } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: "type and message are required",
      });
    }

    const notification = await RideNotification.create({
      rider: req.user.id,
      type,
      title,
      message,
      rideId: rideId || null,
      meta: meta || null,
    });

    return res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create rider notification",
    });
  }
};

export const getRideNotifications = async (req, res) => {
  try {
    if (req.user?.role !== "rider") {
      return res.status(403).json({
        success: false,
        message: "Only riders can view rider notifications",
      });
    }

    const notifications = await RideNotification.find({
      rider: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rider notifications",
    });
  }
};

export const markRideNotificationAsRead = async (req, res) => {
  try {
    if (req.user?.role !== "rider") {
      return res.status(403).json({
        success: false,
        message: "Only riders can update rider notifications",
      });
    }

    const notification = await RideNotification.findOneAndUpdate(
      {
        _id: req.params.id,
        rider: req.user.id,
      },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Rider notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update rider notification",
    });
  }
};

export const deleteRideNotification = async (req, res) => {
  try {
    if (req.user?.role !== "rider") {
      return res.status(403).json({
        success: false,
        message: "Only riders can delete rider notifications",
      });
    }

    const notification = await RideNotification.findOneAndDelete({
      _id: req.params.id,
      rider: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Rider notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rider notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete rider notification",
    });
  }
};

export const deleteAllRideNotifications = async (req, res) => {
  try {
    if (req.user?.role !== "rider") {
      return res.status(403).json({
        success: false,
        message: "Only riders can delete rider notifications",
      });
    }

    await RideNotification.deleteMany({
      rider: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "All rider notifications deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete rider notifications",
    });
  }
};

import NavigationHistory from "./navigation.model.js";

/**
 * Create a new navigation history record
 */
export const createNavigationHistory = async (req, res) => {
  try {
    const { riderId, rideId, stage, pickupLocation, dropLocation } = req.body;

    if (!riderId || !rideId) {
      return res.status(400).json({
        success: false,
        message: "riderId and rideId are required",
      });
    }

    const navigationRecord = new NavigationHistory({
      riderId,
      rideId,
      stage,
      pickupLocation,
      dropLocation,
    });

    await navigationRecord.save();

    res.status(201).json({
      success: true,
      message: "Navigation history created successfully",
      data: navigationRecord,
    });
  } catch (error) {
    console.error("Error creating navigation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create navigation history",
      error: error.message,
    });
  }
};

/**
 * Get navigation history for a specific rider
 */
export const getRiderNavigationHistory = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    if (!riderId) {
      return res.status(400).json({
        success: false,
        message: "riderId is required",
      });
    }

    const navigationHistory = await NavigationHistory.find({
      riderId,
    })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 })
      .populate("rideId", "customerId distanceKm fareAmount")
      .populate("customerId", "name email");

    const total = await NavigationHistory.countDocuments({ riderId });

    res.status(200).json({
      success: true,
      message: "Navigation history fetched successfully",
      data: navigationHistory,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error("Error fetching navigation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch navigation history",
      error: error.message,
    });
  }
};

/**
 * Update navigation history (add location updates, mark as completed)
 */
export const updateNavigationHistory = async (req, res) => {
  try {
    const { navigationId } = req.params;
    const {
      riderLocation,
      routePath,
      distanceKm,
      durationMinutes,
      stage,
      status,
      completedAt,
    } = req.body;

    if (!navigationId) {
      return res.status(400).json({
        success: false,
        message: "navigationId is required",
      });
    }

    const updatedRecord = await NavigationHistory.findByIdAndUpdate(
      navigationId,
      {
        ...(riderLocation && { riderLocation }),
        ...(routePath && { routePath }),
        ...(distanceKm && { distanceKm }),
        ...(durationMinutes && { durationMinutes }),
        ...(stage && { stage }),
        ...(status && { status }),
        ...(completedAt && { completedAt }),
      },
      { new: true, runValidators: true },
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Navigation history record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Navigation history updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating navigation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update navigation history",
      error: error.message,
    });
  }
};

/**
 * Get active navigation for a rider
 */
export const getActiveNavigation = async (req, res) => {
  try {
    const { riderId } = req.params;

    if (!riderId) {
      return res.status(400).json({
        success: false,
        message: "riderId is required",
      });
    }

    const activeNavigation = await NavigationHistory.findOne({
      riderId,
      status: "in_progress",
    })
      .sort({ createdAt: -1 })
      .populate("rideId")
      .populate("customerId", "name phoneNumber");

    if (!activeNavigation) {
      return res.status(404).json({
        success: false,
        message: "No active navigation found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Active navigation fetched successfully",
      data: activeNavigation,
    });
  } catch (error) {
    console.error("Error fetching active navigation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active navigation",
      error: error.message,
    });
  }
};

/**
 * Complete a navigation record
 */
export const completeNavigation = async (req, res) => {
  try {
    const { navigationId } = req.params;
    const { distanceKm, durationMinutes } = req.body;

    if (!navigationId) {
      return res.status(400).json({
        success: false,
        message: "navigationId is required",
      });
    }

    const completedRecord = await NavigationHistory.findByIdAndUpdate(
      navigationId,
      {
        status: "completed",
        stage: "completed",
        completedAt: new Date(),
        ...(distanceKm && { distanceKm }),
        ...(durationMinutes && { durationMinutes }),
      },
      { new: true, runValidators: true },
    );

    if (!completedRecord) {
      return res.status(404).json({
        success: false,
        message: "Navigation history record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Navigation completed successfully",
      data: completedRecord,
    });
  } catch (error) {
    console.error("Error completing navigation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete navigation",
      error: error.message,
    });
  }
};

/**
 * Cancel a navigation record
 */
export const cancelNavigation = async (req, res) => {
  try {
    const { navigationId } = req.params;

    if (!navigationId) {
      return res.status(400).json({
        success: false,
        message: "navigationId is required",
      });
    }

    const cancelledRecord = await NavigationHistory.findByIdAndUpdate(
      navigationId,
      {
        status: "cancelled",
        stage: "cancelled",
        completedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!cancelledRecord) {
      return res.status(404).json({
        success: false,
        message: "Navigation history record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Navigation cancelled successfully",
      data: cancelledRecord,
    });
  } catch (error) {
    console.error("Error cancelling navigation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel navigation",
      error: error.message,
    });
  }
};

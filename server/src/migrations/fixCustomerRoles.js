// Migration: Add missing role field to customer records
// Run this once to fix legacy user records

import mongoose from "mongoose";
import { User, googleDB, Rider } from "../modules/auth/auth.model.js";

export const fixCustomerRoles = async () => {
  try {
    console.log("🔄 Starting customer role migration...");

    // Fix User collection (customers)
    const userResult = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: "customer" } },
    );
    console.log(
      `✅ Updated ${userResult.modifiedCount} records in User collection`,
    );

    // Fix googleDB collection (customers)
    const googleResult = await googleDB.updateMany(
      { role: { $exists: false } },
      { $set: { role: "customer" } },
    );
    console.log(
      `✅ Updated ${googleResult.modifiedCount} records in googleDB collection`,
    );

    // Fix Rider collection
    const riderResult = await Rider.updateMany(
      { role: { $exists: false } },
      { $set: { role: "rider" } },
    );
    console.log(
      `✅ Updated ${riderResult.modifiedCount} records in Rider collection`,
    );

    console.log("✅ Customer role migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Run migration on server startup (one-time fix)
export const runMigrationOnStartup = async () => {
  try {
    // Check if migration is needed
    const userMissingRole = await User.countDocuments({
      role: { $exists: false },
    });
    const googleMissingRole = await googleDB.countDocuments({
      role: { $exists: false },
    });
    const riderMissingRole = await Rider.countDocuments({
      role: { $exists: false },
    });

    if (userMissingRole > 0 || googleMissingRole > 0 || riderMissingRole > 0) {
      console.log(
        "🔄 Found records with missing role field. Running migration...",
      );
      await fixCustomerRoles();
    } else {
      console.log("✅ All records have role field set correctly.");
    }
  } catch (error) {
    console.error("❌ Migration check failed:", error);
  }
};

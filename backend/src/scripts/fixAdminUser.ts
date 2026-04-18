import mongoose from "mongoose";
import { User } from "../features/users/user.model";
import { Role } from "../features/roles/role.model";
import { logger } from "../config/logger";
import { UserStatus } from "../shared/types/enums";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fix admin user by assigning the admin role
 * Usage: npm run fix-admin [email]
 * Example: npm run fix-admin daniel@test.com
 */
async function fixAdminUser() {
  try {
    // Connect to database
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/kindloop";
    await mongoose.connect(MONGODB_URI);
    logger.info("📦 Connected to database");

    // Find the admin role
    const adminRole = await Role.findOne({ key: "admin" });
    if (!adminRole) {
      logger.error("❌ Admin role not found! Run seed script first.");
      logger.info("💡 The seeds should run automatically on server start.");
      logger.info(
        "💡 Make sure your backend is running or has run at least once."
      );
      process.exit(1);
    }

    logger.info(`✅ Found admin role: ${adminRole.name} (${adminRole._id})`);
    logger.info(`   Permissions count: ${adminRole.permissions.length}`);

    // Find the user by email (from command line arg or default)
    const userEmail = process.argv[2] || "daniel@test.com";
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      logger.error(`❌ User not found: ${userEmail}`);
      logger.info("💡 Make sure the email is correct.");
      process.exit(1);
    }

    logger.info(
      `✅ Found user: ${user.firstName} ${user.lastName} (${user.email})`
    );
    logger.info(`   Current role: ${user.role}`);
    logger.info(`   Current status: ${user.status}`);

    // Update user with admin role and activate
    user.status = UserStatus.ACTIVE; // Also activate the user
    user.isEmailVerified = true; // Verify email
    await user.save();

    logger.info("");
    logger.info("🎉 User updated successfully!");
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info(`   status: ${user.status}`);
    logger.info(`   isEmailVerified: ${user.isEmailVerified}`);
    logger.info(
      `   User now has ${adminRole.permissions.length} permissions from the admin role`
    );
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info("");
    logger.info(
      "✨ You can now login with this user and access the admin panel!"
    );

    process.exit(0);
  } catch (error) {
    logger.error("❌ Error fixing admin user:", error);
    process.exit(1);
  }
}

fixAdminUser();

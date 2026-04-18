import mongoose from "mongoose";
import { Role } from "../features/roles/role.model";
import { Permission } from "../features/permissions/permission.model";
import { logger } from "../config/logger";
import dotenv from "dotenv";

dotenv.config();

/**
 * Update admin role with all permissions (including new ones)
 * This fixes the issue where new permissions were added but admin role wasn't updated
 */
async function updateAdminRole() {
  try {
    // Connect to database
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/kindloop";
    await mongoose.connect(MONGODB_URI);
    logger.info("📦 Connected to database");

    // Find the admin role
    const adminRole = await Role.findOne({ key: "admin" });
    if (!adminRole) {
      logger.error("❌ Admin role not found!");
      logger.info("💡 Run the backend server first to create the admin role.");
      process.exit(1);
    }

    logger.info(`✅ Found admin role: ${adminRole.name}`);
    const oldPermCount = adminRole.permissions.length;
    logger.info(`   Current permissions count: ${oldPermCount}`);

    // Get ALL active permissions
    const allPermissions = await Permission.find({ isActive: true });
    logger.info(
      `✅ Found ${allPermissions.length} active permissions in database`
    );

    // Update admin role with ALL permissions
    adminRole.permissions = allPermissions.map((p) => p._id) as any;
    await adminRole.save();

    logger.info("");
    logger.info("🎉 Admin role updated successfully!");
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info(`   Old permission count: ${oldPermCount}`);
    logger.info(`   New permission count: ${allPermissions.length}`);
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info("");

    // Show the new permissions
    logger.info("📋 New permissions added:");
    const newPerms = ["system.admin", "users.manage"];
    for (const key of newPerms) {
      const perm = allPermissions.find((p) => p.key === key);
      if (perm) {
        logger.info(`   ✅ ${perm.name} (${perm.key})`);
      } else {
        logger.warn(`   ⚠️  ${key} - NOT FOUND! Make sure seeds ran.`);
      }
    }

    logger.info("");
    logger.info("✨ All users with admin role now have these new permissions!");
    logger.info("💡 Logout and login again to load the updated permissions.");

    process.exit(0);
  } catch (error) {
    logger.error("❌ Error updating admin role:", error);
    process.exit(1);
  }
}

updateAdminRole();

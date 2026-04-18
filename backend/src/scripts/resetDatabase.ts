/**
 * Script to reset the database to initial state
 * This will:
 * 1. Drop all collections
 * 2. Reseed permissions and roles
 * 3. Create default admin user
 *
 * WARNING: This will DELETE ALL DATA!
 *
 * Run with: npx ts-node src/scripts/resetDatabase.ts
 */

import "../config/loadEnv";
import mongoose from "mongoose";
import { logger } from "../config/logger";
import { runSeeds } from "../config/seedPermissions";
import { SystemStats } from "../features/statistics/statistics.model";
import {
  getMongoConnectionString,
  redactMongoUri,
} from "../config/database";

const MONGODB_URI = getMongoConnectionString();

async function resetDatabase() {
  try {
    console.log("⚠️  WARNING: This will DELETE ALL DATA from your database!");
    console.log("📍 Database:", redactMongoUri(MONGODB_URI));
    console.log("\n⏳ Starting database reset in 3 seconds...\n");

    // Give user time to cancel
    await new Promise((resolve) => setTimeout(resolve, 3000));

    logger.info("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    // Get list of all collections
    const collections = await db.listCollections().toArray();
    logger.info(`\n📋 Found ${collections.length} collections:`);
    collections.forEach((c) => logger.info(`  - ${c.name}`));

    // Drop all collections
    logger.info("\n🗑️  Dropping all collections...");
    for (const collection of collections) {
      try {
        await db.dropCollection(collection.name);
        logger.info(`  ✓ Dropped: ${collection.name}`);
      } catch (error: any) {
        logger.error(`  ✗ Failed to drop ${collection.name}:`, error.message);
      }
    }

    logger.info("\n✅ All collections dropped successfully!");

    // Reseed the database
    logger.info("\n🌱 Reseeding database with initial data...");
    await runSeeds();

    // Initialize system stats
    logger.info("\n📊 Initializing system statistics...");
    const existingStats = await SystemStats.findOne();
    if (!existingStats) {
      await SystemStats.create({
        users: {
          total: 1, // Admin user
          active: 1,
          inactive: 0,
          suspended: 0,
          drivers: 0,
          businesses: 0,
        },
        donations: {
          total: 0,
          active: 0,
          completed: 0,
          cancelled: 0,
        },
        requests: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
        totalDonations: 0,
        totalRequests: 0,
        totalCompletedDonations: 0,
      });
      logger.info("✅ System statistics initialized");
    }

    logger.info("\n🎉 Database reset completed successfully!");
    logger.info("\n📧 Default Admin User:");
    logger.info("   Email: admin@kindloop.com");
    logger.info("   Password: admin@kindloop.com");
    logger.info("\n⚠️  Please change the admin password after first login!");
  } catch (error) {
    logger.error("\n❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info("\n🔌 Database connection closed.");
    process.exit(0);
  }
}

// Run the reset
resetDatabase();

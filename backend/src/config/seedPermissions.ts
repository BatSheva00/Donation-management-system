import { Permission } from "../features/permissions/permission.model";
import { Role } from "../features/roles/role.model";
import { User } from "../features/users/user.model";
import { logger } from "./logger";
import bcrypt from "bcrypt";

/**
 * Basic permissions for the system
 */
export const basicPermissions = [
  // Permission Management
  {
    name: "View Permissions",
    key: "permissions.view",
    description: "View all permissions in the system",
    category: "permissions",
  },
  {
    name: "Create Permissions",
    key: "permissions.create",
    description: "Create new permissions",
    category: "permissions",
  },
  {
    name: "Edit Permissions",
    key: "permissions.edit",
    description: "Edit existing permissions",
    category: "permissions",
  },
  {
    name: "Delete Permissions",
    key: "permissions.delete",
    description: "Delete permissions",
    category: "permissions",
  },
  {
    name: "Grant Permissions",
    key: "permissions.grant",
    description: "Grant permissions to users",
    category: "permissions",
  },
  {
    name: "Deny Permissions",
    key: "permissions.deny",
    description: "Deny permissions from users",
    category: "permissions",
  },

  // Role Management
  {
    name: "View Roles",
    key: "roles.view",
    description: "View all roles in the system",
    category: "roles",
  },
  {
    name: "Create Roles",
    key: "roles.create",
    description: "Create new roles",
    category: "roles",
  },
  {
    name: "Edit Roles",
    key: "roles.edit",
    description: "Edit existing roles",
    category: "roles",
  },
  {
    name: "Delete Roles",
    key: "roles.delete",
    description: "Delete roles",
    category: "roles",
  },
  {
    name: "Assign Roles",
    key: "roles.assign",
    description: "Assign roles to users",
    category: "roles",
  },

  // User Management
  {
    name: "Manage Users",
    key: "users.manage",
    description: "Full user management access",
    category: "users",
  },
  {
    name: "View Users",
    key: "users.view",
    description: "View all users in the system",
    category: "users",
  },
  {
    name: "Create Users",
    key: "users.create",
    description: "Create new users",
    category: "users",
  },
  {
    name: "Edit Users",
    key: "users.edit",
    description: "Edit existing users",
    category: "users",
  },
  {
    name: "Delete Users",
    key: "users.delete",
    description: "Delete users",
    category: "users",
  },
  {
    name: "View Own Profile",
    key: "users.view.own",
    description: "View own user profile",
    category: "users",
  },
  {
    name: "Edit Own Profile",
    key: "users.edit.own",
    description: "Edit own user profile",
    category: "users",
  },
  {
    name: "Approve Users",
    key: "users.approve",
    description: "Approve user accounts and change status to active",
    category: "users",
  },
  {
    name: "Suspend Users",
    key: "users.suspend",
    description: "Suspend user accounts",
    category: "users",
  },
  {
    name: "Verify User Profiles",
    key: "users.verify",
    description: "Verify and approve user profile submissions",
    category: "users",
  },

  // Donation Management
  {
    name: "View Donations",
    key: "donations.view",
    description: "View all donations",
    category: "donations",
  },
  {
    name: "View Own Donations",
    key: "donations.view.own",
    description: "View own donations",
    category: "donations",
  },
  {
    name: "Create Donations",
    key: "donations.create",
    description: "Create new donations",
    category: "donations",
  },
  {
    name: "Edit Donations",
    key: "donations.edit",
    description: "Edit existing donations",
    category: "donations",
  },
  {
    name: "Edit Own Donations",
    key: "donations.edit.own",
    description: "Edit own donations",
    category: "donations",
  },
  {
    name: "Delete Donations",
    key: "donations.delete",
    description: "Delete donations",
    category: "donations",
  },
  {
    name: "Delete Own Donations",
    key: "donations.delete.own",
    description: "Delete own donations",
    category: "donations",
  },
  {
    name: "Approve Donations",
    key: "donations.approve",
    description: "Approve pending donations",
    category: "donations",
  },

  // Request Management
  {
    name: "View Requests",
    key: "requests.view",
    description: "View all donation requests",
    category: "requests",
  },
  {
    name: "View Own Requests",
    key: "requests.view.own",
    description: "View own donation requests",
    category: "requests",
  },
  {
    name: "Create Requests",
    key: "requests.create",
    description: "Create new donation requests",
    category: "requests",
  },
  {
    name: "Edit Requests",
    key: "requests.edit",
    description: "Edit existing donation requests",
    category: "requests",
  },
  {
    name: "Edit Own Requests",
    key: "requests.edit.own",
    description: "Edit own donation requests",
    category: "requests",
  },
  {
    name: "Delete Requests",
    key: "requests.delete",
    description: "Delete donation requests",
    category: "requests",
  },
  {
    name: "Delete Own Requests",
    key: "requests.delete.own",
    description: "Delete own donation requests",
    category: "requests",
  },
  {
    name: "Approve Requests",
    key: "requests.approve",
    description: "Approve pending requests",
    category: "requests",
  },

  // Business Management
  {
    name: "View Businesses",
    key: "businesses.view",
    description: "View all businesses",
    category: "businesses",
  },
  {
    name: "Create Businesses",
    key: "businesses.create",
    description: "Register new businesses",
    category: "businesses",
  },
  {
    name: "Edit Businesses",
    key: "businesses.edit",
    description: "Edit business information",
    category: "businesses",
  },
  {
    name: "Delete Businesses",
    key: "businesses.delete",
    description: "Delete businesses",
    category: "businesses",
  },
  {
    name: "Verify Businesses",
    key: "businesses.verify",
    description: "Verify business accounts",
    category: "businesses",
  },

  // Driver Management
  {
    name: "View Drivers",
    key: "drivers.view",
    description: "View all drivers",
    category: "drivers",
  },
  {
    name: "Assign Deliveries",
    key: "drivers.assign",
    description: "Assign deliveries to drivers",
    category: "drivers",
  },
  {
    name: "Accept Deliveries",
    key: "drivers.accept",
    description: "Accept delivery assignments",
    category: "drivers",
  },
  {
    name: "Complete Deliveries",
    key: "drivers.complete",
    description: "Mark deliveries as completed",
    category: "drivers",
  },

  // Delivery Management (for drivers to view and self-assign)
  {
    name: "View Deliveries",
    key: "deliveries.view",
    description: "View available deliveries that need drivers",
    category: "deliveries",
  },
  {
    name: "Self Assign Deliveries",
    key: "deliveries.assign.self",
    description: "Assign yourself to available deliveries",
    category: "deliveries",
  },

  // Customer Support Management
  {
    name: "View Support Tickets",
    key: "support.view",
    description: "View customer support tickets",
    category: "support",
  },
  {
    name: "Respond to Support Tickets",
    key: "support.respond",
    description: "Respond to customer support inquiries",
    category: "support",
  },
  {
    name: "Close Support Tickets",
    key: "support.close",
    description: "Close resolved support tickets",
    category: "support",
  },

  // Payment Management
  {
    name: "View Payments",
    key: "payments.view",
    description: "View all payment transactions",
    category: "payments",
  },
  {
    name: "Process Payments",
    key: "payments.process",
    description: "Process payment transactions",
    category: "payments",
  },
  {
    name: "Refund Payments",
    key: "payments.refund",
    description: "Process refunds",
    category: "payments",
  },

  // Notification Management
  {
    name: "Send Notifications",
    key: "notifications.send",
    description: "Send notifications to users",
    category: "notifications",
  },
  {
    name: "View All Notifications",
    key: "notifications.view.all",
    description: "View all system notifications",
    category: "notifications",
  },

  // System Administration
  {
    name: "System Admin",
    key: "system.admin",
    description: "Full system administrator access",
    category: "system",
  },
  {
    name: "View System Stats",
    key: "system.stats",
    description: "View system statistics and analytics",
    category: "system",
  },
  {
    name: "View Logs",
    key: "system.logs",
    description: "View system logs",
    category: "system",
  },
  {
    name: "System Configuration",
    key: "system.config",
    description: "Modify system configuration",
    category: "system",
  },
];

/**
 * Seed permissions into database
 */
export const seedPermissions = async () => {
  try {
    logger.info("🌱 Starting permission seeding...");

    for (const permissionData of basicPermissions) {
      const existingPermission = await Permission.findOne({
        key: permissionData.key,
      });

      if (!existingPermission) {
        await Permission.create(permissionData);
        logger.info(`✅ Created permission: ${permissionData.key}`);
      } else {
        logger.info(`⏭️  Permission already exists: ${permissionData.key}`);
      }
    }

    logger.info("✅ Permission seeding completed");
  } catch (error) {
    logger.error("❌ Error seeding permissions:", error);
    throw error;
  }
};

/**
 * Seed basic system roles
 */
export const seedRoles = async () => {
  try {
    logger.info("🌱 Starting role seeding...");

    // Get all permissions
    const allPermissions = await Permission.find({ isActive: true });
    const permissionMap = new Map(allPermissions.map((p) => [p.key, p._id]));

    // Admin Role - All permissions (always update to include new permissions)
    const adminPerms = allPermissions.map((p) => p._id);
    const adminRole = await Role.findOne({ key: "admin" });
    if (!adminRole) {
      await Role.create({
        name: "Administrator",
        key: "admin",
        description: "Full system access with all permissions",
        permissions: adminPerms,
        isActive: true,
        isSystemRole: true,
      });
      logger.info("✅ Created role: admin");
    } else {
      // Update existing admin role with all permissions
      adminRole.permissions = adminPerms as any;
      await adminRole.save();
      logger.info("✅ Updated admin role with all permissions");
    }

    // User Role - Basic permissions
    const userPerms = [
      "users.view.own",
      "users.edit.own",
      "requests.view",
      "requests.view.own",
      "requests.create",
      "requests.edit.own",
      "requests.delete.own",
      "donations.view",
      "donations.view.own",
    ];
    const userRole = await Role.findOne({ key: "user" });
    if (!userRole) {
      await Role.create({
        name: "Regular User",
        key: "user",
        description: "Regular user with basic permissions",
        permissions: userPerms.map((k) => permissionMap.get(k)).filter(Boolean),
        isActive: true,
        isSystemRole: true,
      });
      logger.info("✅ Created role: user");
    } else {
      // Update existing user role with new permissions
      userRole.permissions = userPerms
        .map((k) => permissionMap.get(k))
        .filter(Boolean) as any;
      await userRole.save();
      logger.info("✅ Updated user role with new permissions");
    }

    // Business Role
    const businessPerms = [
      "users.view.own",
      "users.edit.own",
      "donations.view",
      "donations.view.own",
      "donations.create",
      "donations.edit.own",
      "donations.delete.own",
      "requests.view",
      "businesses.view",
    ];
    const businessRole = await Role.findOne({ key: "business" });
    if (!businessRole) {
      await Role.create({
        name: "Business",
        key: "business",
        description: "Business account with donation creation permissions",
        permissions: businessPerms
          .map((k) => permissionMap.get(k))
          .filter(Boolean),
        isActive: true,
        isSystemRole: true,
      });
      logger.info("✅ Created role: business");
    } else {
      // Update existing business role with new permissions
      businessRole.permissions = businessPerms
        .map((k) => permissionMap.get(k))
        .filter(Boolean) as any;
      await businessRole.save();
      logger.info("✅ Updated business role with new permissions");
    }

    // Driver Role
    const driverPerms = [
      "users.view.own",
      "users.edit.own",
      "drivers.accept",
      "drivers.complete",
      "donations.view",
      "deliveries.view",
      "deliveries.assign.self",
    ];
    const driverRole = await Role.findOne({ key: "driver" });
    if (!driverRole) {
      await Role.create({
        name: "Driver",
        key: "driver",
        description: "Delivery driver with delivery management permissions",
        permissions: driverPerms
          .map((k) => permissionMap.get(k))
          .filter(Boolean),
        isActive: true,
        isSystemRole: true,
      });
      logger.info("✅ Created role: driver");
    } else {
      // Update existing driver role with new permissions
      driverRole.permissions = driverPerms
        .map((k) => permissionMap.get(k))
        .filter(Boolean) as any;
      await driverRole.save();
      logger.info("✅ Updated driver role with new permissions");
    }

    // Customer Support Role
    const supportPerms = [
      "users.view.own",
      "users.edit.own",
      "users.view",
      "users.verify",
      "donations.view",
      "requests.view",
      "businesses.view",
      "support.view",
      "support.respond",
      "support.close",
      "notifications.send",
    ];
    const supportRole = await Role.findOne({ key: "customer_support" });
    if (!supportRole) {
      await Role.create({
        name: "Customer Support",
        key: "customer_support",
        description: "Customer support agent with user assistance permissions",
        permissions: supportPerms
          .map((k) => permissionMap.get(k))
          .filter(Boolean),
        isActive: true,
        isSystemRole: true,
      });
      logger.info("✅ Created role: customer_support");
    } else {
      // Update existing customer support role with new permissions
      supportRole.permissions = supportPerms
        .map((k) => permissionMap.get(k))
        .filter(Boolean) as any;
      await supportRole.save();
      logger.info("✅ Updated customer support role with new permissions");
    }

    logger.info("✅ Role seeding completed");
  } catch (error) {
    logger.error("❌ Error seeding roles:", error);
    throw error;
  }
};

/**
 * Seed default admin user
 */
export const seedAdminUser = async () => {
  try {
    logger.info("🌱 Starting admin user seeding...");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      email: "admin@kindloop.com",
    });

    if (existingAdmin) {
      logger.info("⏭️  Admin user already exists");
      return;
    }

    // Get admin role
    const adminRole = await Role.findOne({ key: "admin" });
    if (!adminRole) {
      logger.error("❌ Admin role not found. Please run role seeding first.");
      throw new Error("Admin role not found");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin@kindloop.com", 10);

    // Create admin user
    await User.create({
      email: "admin@kindloop.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: adminRole._id,
      language: "en",
      status: "active",
      profileCompletionStatus: "verified",
      isEmailVerified: true,
      phone: {
        countryCode: "+972",
        number: "500000000",
      },
      address: {
        city: "Tel Aviv",
        street: "Admin Street 1",
        zipCode: "1234567",
        state: "",
        country: "Israel",
      },
    });

    logger.info("✅ Admin user created successfully");
    logger.info("📧 Email: admin@kindloop.com");
    logger.info("🔑 Password: admin@kindloop.com");
  } catch (error) {
    logger.error("❌ Error seeding admin user:", error);
    throw error;
  }
};

/**
 * Run all seeds
 */
export const runSeeds = async () => {
  try {
    await seedPermissions();
    await seedRoles();
    await seedAdminUser();
    logger.info("🎉 All seeds completed successfully");
  } catch (error) {
    logger.error("❌ Error running seeds:", error);
    throw error;
  }
};

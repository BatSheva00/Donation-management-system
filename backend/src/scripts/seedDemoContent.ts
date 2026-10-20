import "../config/loadEnv";
import mongoose from "mongoose";
import { User } from "../features/users/user.model";
import { Role } from "../features/roles/role.model";
import { Donation } from "../features/donations/donation.model";
import { hashPassword } from "../shared/utils/password";
import {
  DonationStatus,
  DonationType,
  DriverStatus,
  ProfileCompletionStatus,
  UserStatus,
} from "../shared/types/enums";
import { getMongoConnectionString, redactMongoUri } from "../config/database";
import { logger } from "../config/logger";

const DEMO_NOTE = "[DEMO_SEED]";
const DEMO_PASSWORD = "KindLoop-demo-only-not-for-login";

const users = [
  {
    email: "demo.baker@kindloop.invalid",
    firstName: "נועה",
    lastName: "ברק (משתמש דמה)",
    phone: "501000001",
    roleKey: "business",
    city: "תל אביב",
    street: "דיזנגוף 100",
    lat: 32.0796,
    lng: 34.7744,
    businessInfo: {
      businessName: "מאפיית השכונה (משתמש דמה)",
      businessType: "bakery",
      description: "מאפייה לדוגמה לצורך תצוגה באתר",
    },
  },
  {
    email: "demo.family@kindloop.invalid",
    firstName: "דניאל",
    lastName: "לוי (משתמש דמה)",
    phone: "501000002",
    roleKey: "user",
    city: "ירושלים",
    street: "יפו 40",
    lat: 31.7844,
    lng: 35.2137,
  },
  {
    email: "demo.parent@kindloop.invalid",
    firstName: "מיכל",
    lastName: "שרון (משתמש דמה)",
    phone: "501000003",
    roleKey: "user",
    city: "חיפה",
    street: "הרצל 12",
    lat: 32.8191,
    lng: 34.9983,
  },
  {
    email: "demo.driver@kindloop.invalid",
    firstName: "אמיר",
    lastName: "כהן (משתמש דמה)",
    phone: "501000004",
    roleKey: "driver",
    city: "תל אביב",
    street: "אלנבי 50",
    lat: 32.0629,
    lng: 34.773,
    driverInfo: {
      licenseNumber: "DEMO-LIC-0001",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "van",
      vehicleModel: "Renault Kangoo",
      vehiclePlateNumber: "DEMO-12-345",
      vehicleCapacity: 400,
      driverStatus: DriverStatus.AVAILABLE,
    },
  },
  {
    email: "demo.helper@kindloop.invalid",
    firstName: "יעל",
    lastName: "מזרחי (משתמש דמה)",
    phone: "501000005",
    roleKey: "user",
    city: "באר שבע",
    street: "רגר 8",
    lat: 31.2529,
    lng: 34.7915,
  },
] as const;

const donations = [
  {
    donorEmail: "demo.baker@kindloop.invalid",
    title: "לחם ומאפים טריים מסוף היום",
    description:
      "מגשים של לחם, חלות ומאפים שנאפו היום ולא נמכרו. מתאים למשפחות ולעמותות. איסוף בערב.",
    type: DonationType.FOOD,
    quantity: 12,
    unit: "מגשים",
    isFood: true,
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549931319-a545dcf3d7a9?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    donorEmail: "demo.family@kindloop.invalid",
    title: "ארוחות מבושלות לקירור",
    description:
      "מנות מבושלות ארוזות במגשים: אורז, ירקות וחלבון. לשמור בקירור ולאכול תוך יומיים.",
    type: DonationType.FOOD,
    quantity: 8,
    unit: "מנות",
    isFood: true,
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    donorEmail: "demo.parent@kindloop.invalid",
    title: "בגדי תינוקות 0–12 חודשים",
    description:
      "בגדי גוף, אוברולים ושמיכות במצב מצוין. כבוסים ומקופלים. מתאים לתינוקות בשנה הראשונה.",
    type: DonationType.CLOTHING,
    quantity: 20,
    unit: "פריטים",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515488044360-fb630319c780?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    donorEmail: "demo.parent@kindloop.invalid",
    title: "עריסה וצעצועי תינוק",
    description:
      "עריסה מתקפלת, ניידת משחק וכמה צעצועים רכים. הכל נקי ותקין.",
    type: DonationType.TOYS,
    quantity: 1,
    unit: "סט",
    images: [
      "https://images.unsplash.com/photo-1515488044360-fb630319c780?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    donorEmail: "demo.helper@kindloop.invalid",
    title: "בגדי חורף לילדים",
    description:
      "מעילים, סוודרים ומכנסיים במידות 4–8. מצב טוב, מתאים לחורף.",
    type: DonationType.CLOTHING,
    quantity: 15,
    unit: "פריטים",
    images: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    donorEmail: "demo.family@kindloop.invalid",
    title: "שולחן אוכל וכיסאות",
    description:
      "שולחן עץ ל-4 סועדים ושני כיסאות תקינים. דרושה עזרה בפינוי מהדירה.",
    type: DonationType.FURNITURE,
    quantity: 1,
    unit: "סט",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

async function upsertDemoUser(entry: (typeof users)[number], roleId: mongoose.Types.ObjectId) {
  const password = await hashPassword(DEMO_PASSWORD);
  const payload: Record<string, unknown> = {
    email: entry.email,
    password,
    firstName: entry.firstName,
    lastName: entry.lastName,
    phone: { countryCode: "+972", number: entry.phone },
    role: roleId,
    status: UserStatus.ACTIVE,
    profileCompletionStatus: ProfileCompletionStatus.VERIFIED,
    language: "he",
    isEmailVerified: true,
    address: {
      street: entry.street,
      city: entry.city,
      country: "IL",
      coordinates: { latitude: entry.lat, longitude: entry.lng },
    },
  };

  if ("businessInfo" in entry && entry.businessInfo) {
    payload.businessInfo = entry.businessInfo;
  }
  if ("driverInfo" in entry && entry.driverInfo) {
    payload.driverInfo = entry.driverInfo;
  }

  const user = await User.findOneAndUpdate(
    { email: entry.email },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!user) {
    throw new Error(`Failed to upsert ${entry.email}`);
  }
  return user;
}

async function seed() {
  const uri = getMongoConnectionString();
  logger.info(`Connecting to ${redactMongoUri(uri)}`);
  await mongoose.connect(uri);

  const roleDocs = await Role.find({
    key: { $in: ["user", "business", "driver"] },
  });
  const roles = Object.fromEntries(roleDocs.map((role) => [role.key, role._id]));
  if (!roles.user || !roles.business || !roles.driver) {
    throw new Error("Missing roles. Start the API once so permissions seed.");
  }

  const byEmail = new Map<string, mongoose.Types.ObjectId>();
  for (const entry of users) {
    const user = await upsertDemoUser(entry, roles[entry.roleKey]);
    byEmail.set(entry.email, user._id);
    logger.info(`Demo user ready: ${entry.firstName} ${entry.lastName}`);
  }

  await Donation.deleteMany({ notes: DEMO_NOTE });

  for (const item of donations) {
    const donor = users.find((user) => user.email === item.donorEmail);
    const donorId = byEmail.get(item.donorEmail);
    if (!donor || !donorId) {
      throw new Error(`Missing donor ${item.donorEmail}`);
    }

    await Donation.create({
      donorId,
      title: item.title,
      description: item.description,
      type: item.type,
      quantity: item.quantity,
      unit: item.unit,
      images: item.images,
      status: DonationStatus.PENDING,
      pickupLocation: {
        address: donor.street,
        city: donor.city,
        coordinates: { latitude: donor.lat, longitude: donor.lng },
      },
      notes: DEMO_NOTE,
    });
    logger.info(`Demo donation ready: ${item.title}`);
  }

  logger.info(
    `Done. ${users.length} dummy users, ${donations.length} donations.`
  );
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  logger.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

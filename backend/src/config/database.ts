import mongoose from "mongoose";
import { logger } from "./logger";

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/kindloop";

export function redactMongoUri(uri: string): string {
  return uri.replace(/\/\/[^@]+@/, "//***:***@");
}

function sanitizeAtlasHostAndPath(hostAndPath: string): string {
  return hostAndPath.replace(
    /(\.mongodb\.net)\/[^/]+\.mongodb\.net\//i,
    "$1/"
  );
}

export function buildMongoUriFromAtlasParts(): string | null {
  const user = process.env.MONGO_ATLAS_USER?.trim();
  let pass = process.env.MONGO_ATLAS_PASSWORD?.trim();
  if (pass?.startsWith('"') && pass.endsWith('"')) {
    pass = pass.slice(1, -1).trim();
  }
  const host = process.env.MONGO_ATLAS_HOST?.trim();
  const db = process.env.MONGO_ATLAS_DB?.trim() || "kindloop";

  if (!user || !pass || !host) {
    return null;
  }

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/${db}?retryWrites=true&w=majority`;
}

export function normalizeMongoConnectionString(uri: string): string {
  let s = uri.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }

  if (/<db_password>|%3Cdb_password%3E/i.test(s)) {
    throw new Error(
      "MONGO_URI contains <db_password> — replace with your Atlas database user password"
    );
  }

  const match = s.match(/^(mongodb\+srv?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    return s;
  }

  const [, proto, rawUser, rawPass, hostAndRest] = match;
  const hostFixed = sanitizeAtlasHostAndPath(hostAndRest);
  try {
    const user = decodeURIComponent(rawUser).trim();
    const pass = decodeURIComponent(rawPass).trim();
    return `${proto}${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${hostFixed}`;
  } catch {
    return `${proto}${rawUser.trim()}:${rawPass.trim()}@${hostFixed}`;
  }
}

export function getMongoConnectionString(): string {
  const fromParts = buildMongoUriFromAtlasParts();
  if (fromParts) {
    return fromParts;
  }

  const fromEnv =
    process.env.MONGO_URI?.trim() ||
    process.env.MONGODB_URI?.trim();

  if (fromEnv) {
    return normalizeMongoConnectionString(fromEnv);
  }

  return DEFAULT_LOCAL_URI;
}

const CONNECT_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15_000,
  maxPoolSize: 10,
  retryWrites: true,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Connect with exponential backoff (Atlas cold start / transient network).
 */
async function connectWithRetry(
  uri: string,
  maxAttempts = 5,
  baseDelayMs = 1500
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, CONNECT_OPTIONS);
      return;
    } catch (err) {
      lastError = err;
      logger.warn(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${err instanceof Error ? err.message : err}`
      );
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await sleep(Math.min(delay, 30_000));
      }
    }
  }
  throw lastError;
}

export const connectDB = async (): Promise<void> => {
  let mongoURI: string;
  try {
    mongoURI = getMongoConnectionString();
  } catch (e) {
    logger.error("Invalid MongoDB URI:", e);
    process.exit(1);
    return;
  }

  const hasExplicitUri =
    process.env.MONGO_URI?.trim() ||
    process.env.MONGODB_URI?.trim() ||
    (process.env.MONGO_ATLAS_USER?.trim() &&
      process.env.MONGO_ATLAS_PASSWORD?.trim() &&
      process.env.MONGO_ATLAS_HOST?.trim());

  if (!hasExplicitUri) {
    logger.warn(
      `No MONGO_URI / MONGODB_URI / MONGO_ATLAS_* set — using default ${DEFAULT_LOCAL_URI} (local MongoDB). For Atlas, set MONGO_URI in backend/.env.`
    );
  }

  try {
    await connectWithRetry(mongoURI);
    logger.info("Connected to MongoDB");
    logger.info(`MongoDB host: ${mongoose.connection.host}`);
  } catch (error: unknown) {
    const err = error as { code?: number; codeName?: string };
    logger.error("Failed to connect to MongoDB:", error);
    if (err.code === 8000 || err.codeName === "AtlasError") {
      logger.error(
        "Atlas authentication failed — verify username/password in Atlas → Database Access, and MONGO_URI or MONGO_ATLAS_* in backend/.env."
      );
      logger.error(`URI (redacted): ${redactMongoUri(mongoURI)}`);
    }
    process.exit(1);
  }

  mongoose.connection.on("error", (e) => {
    logger.error("MongoDB connection error:", e);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB:", error);
  }
};

/**
 * Import first from server.ts. Loads one .env file (no merge surprises):
 * backend/.env → backend/src/.env → cwd/.env
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const backendRoot = path.resolve(__dirname, "..", "..");

const candidates = [
  path.join(backendRoot, ".env"),
  path.join(backendRoot, "src", ".env"),
  path.join(process.cwd(), ".env"),
].filter((p, i, arr) => arr.indexOf(p) === i);

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    if (process.env.NODE_ENV !== "production") {
      console.log(`[dotenv] Loaded: ${envPath}`);
    }
    break;
  }
}

export {};

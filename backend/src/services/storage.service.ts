import crypto from "crypto";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { AppError } from "../shared/utils/AppError";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

export function assertUploadsReady(): void {
  if (isProduction() && !isCloudinaryConfigured()) {
    throw new AppError(
      "File storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      503
    );
  }
}

export function uploadsRoot(): string {
  return path.join(process.cwd(), "uploads");
}

async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<string> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY!.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET!.trim();
  const timestamp = Math.floor(Date.now() / 1000);
  const folderPath = `kindloop/${folder}`;
  const toSign = `folder=${folderPath}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  const form = new FormData();
  form.append("file", `data:image/jpeg;base64,${buffer.toString("base64")}`);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folderPath);

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    form,
    { headers: form.getHeaders(), timeout: 20000 }
  );

  if (!data?.secure_url) {
    throw new AppError("Image upload failed", 502);
  }

  return data.secure_url as string;
}

export async function saveJpeg(options: {
  buffer: Buffer;
  folder: string;
  diskDir: string;
  filename: string;
}): Promise<string> {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(options.buffer, options.folder);
  }

  const dir = path.join(uploadsRoot(), options.diskDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, options.filename), options.buffer);
  return `/uploads/${options.diskDir}/${options.filename}`;
}

import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { AppError } from "../utils/AppError";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../../uploads");
const documentsDir = path.join(uploadsDir, "documents");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image files are allowed!", 400) as any, false);
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return cb(new AppError("File size cannot exceed 5MB!", 400) as any, false);
  }

  cb(null, true);
};

// Multer upload configuration
export const uploadDocuments = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10, // Max 10 files at once
  },
});

// Single file upload
export const uploadSingle = (fieldName: string) => {
  return uploadDocuments.single(fieldName);
};

// Multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => {
  return uploadDocuments.array(fieldName, maxCount);
};

// Multiple fields upload
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return uploadDocuments.fields(fields);
};

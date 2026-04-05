import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export class UploadError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
  }
}

export interface UploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const random = crypto.randomBytes(16).toString("hex");
  return `${random}${ext}`;
}

async function uploadLocal(buffer: Buffer, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function handleUpload(file: File): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError("File too large. Maximum size is 10 MB.");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError(`File type ${file.type} is not allowed.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = generateFilename(file.name);
  const url = await uploadLocal(buffer, filename);

  return {
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    url,
  };
}
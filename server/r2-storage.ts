import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Request } from "express";
import multer from "multer";
import path from "path";
import { Readable } from "stream";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export function isR2Configured(): boolean {
  return !!(ACCOUNT_ID && BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
}

const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"];
const ALLOWED_ALL_EXTS = [...ALLOWED_IMAGE_EXTS, ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".txt"];

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function uploadBufferToR2(buffer: Buffer, key: string, mimetype: string): Promise<string> {
  await r2Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return getPublicUrl(key);
}

function generateKey(originalname: string, folder = "uploads"): string {
  const ext = path.extname(originalname).toLowerCase();
  const safe = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
  return `${folder}/${safe}`;
}

export async function deleteFromR2(urlOrKey: string): Promise<void> {
  try {
    let key = urlOrKey;
    if (urlOrKey.startsWith("http")) {
      const url = new URL(urlOrKey);
      key = url.pathname.replace(/^\//, "");
    }
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
  }
}

function multerMemoryStorage() {
  return multer.memoryStorage();
}

function createR2Multer(allowedExts: string[], folder = "uploads", sizeMb = 8) {
  return multer({
    storage: multerMemoryStorage(),
    limits: { fileSize: sizeMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) cb(null, true);
      else cb(new Error(`Only allowed file types: ${allowedExts.join(", ")}`));
    },
  });
}

export const r2ImageUpload = createR2Multer(ALLOWED_IMAGE_EXTS, "uploads", 8);
export const r2DocUpload = createR2Multer(ALLOWED_ALL_EXTS, "attachments", 20);

export async function handleFileUploadToR2(
  req: Request & { file?: Express.Multer.File },
  folder = "uploads"
): Promise<{ url: string; key: string; size: number; originalname: string }> {
  if (!req.file) throw new Error("No file uploaded");
  const file = req.file;
  const key = generateKey(file.originalname, folder);
  const url = await uploadBufferToR2(file.buffer, key, file.mimetype);
  return { url, key, size: file.size, originalname: file.originalname };
}

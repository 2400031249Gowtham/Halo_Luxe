import "server-only";
import fs from "fs/promises";
import path from "path";

export interface StorageProvider {
  upload(fileBuffer: Buffer, filename: string, mimeType: string): Promise<{ url: string }>;
  delete(url: string): Promise<void>;
}

/**
 * Local Disk Storage Provider for Next.js
 * Stores files in public/uploads and returns accessible URL paths.
 */
class LocalDiskStorage implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
  }

  private async ensureDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<{ url: string }> {
    await this.ensureDir();

    // Sanitize and create unique filename
    const ext = path.extname(originalFilename).toLowerCase() || ".jpg";
    const baseName = path
      .basename(originalFilename, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const finalFilename = `${baseName}-${uniqueSuffix}${ext}`;
    const filePath = path.join(this.uploadDir, finalFilename);

    await fs.writeFile(filePath, fileBuffer);

    return {
      url: `/uploads/${finalFilename}`,
    };
  }

  async delete(fileUrl: string): Promise<void> {
    if (!fileUrl.startsWith("/uploads/")) {
      return; // Not a local upload file
    }

    const filename = path.basename(fileUrl);
    const filePath = path.join(this.uploadDir, filename);

    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        console.error("[Storage] Failed to delete file:", err);
      }
    }
  }
}

export const storage: StorageProvider = new LocalDiskStorage();

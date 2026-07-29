import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export class CloudinaryService {
  static async uploadImage(file, folder = "pollify/users") {
    const buffer = file.buffer || file;
    const mimeType = file.mimetype || "image/png";
    const filename = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      public_id: filename,
      resource_type: "auto",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  static async deleteImage(publicId) {
    if (!publicId) return null;
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      return false;
    }
  }
}

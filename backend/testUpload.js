import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const publicDir = path.join(process.cwd(), "public");

const files = fs.readdirSync(publicDir);

const imageFile = files.find((file) =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
);

if (!imageFile) {
    console.log("No image found in backend/public");
    process.exit(1);
}

const imagePath = path.join(publicDir, imageFile);

console.log("Testing image:", imagePath);

try {
    const result = await cloudinary.uploader.upload(imagePath, {
        resource_type: "image",
        folder: "vingo",
    });

    console.log("UPLOAD SUCCESS");
    console.log("URL:", result.secure_url);
} catch (error) {
    console.log("UPLOAD FAILED");
    console.log("Message:", error.message);
    console.log("HTTP Code:", error.http_code);
    console.log("Name:", error.name);
    console.log("Full error:", error);
}
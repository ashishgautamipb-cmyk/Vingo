import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

try {
    const result = await cloudinary.uploader.upload(
        "./public/1788885908958-iiitu.webp",
        {
            resource_type: "image",
            folder: "vingo",
        }
    );

    console.log("UPLOAD SUCCESS");
    console.log("URL:", result.secure_url);
} catch (error) {
    console.log("UPLOAD FAILED");
    console.log("Message:", error.message);
    console.log("HTTP Code:", error.http_code);
    console.log("Name:", error.name);
    console.log("Full error:", error);
}
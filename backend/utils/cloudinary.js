import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

const uploadOnCloudinary = async (file) => {
    try {
        if (!file) {
            throw new Error("No file provided");
        }

        const result = await cloudinary.uploader.unsigned_upload(
            file,
            "vingo_upload",
            {
                resource_type: "image",
                folder: "vingo",
            }
        );

        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }

        console.log("Cloudinary upload successful:", result.secure_url);

        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }

        throw error;
    }
};

export default uploadOnCloudinary;
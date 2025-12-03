import fs from "fs";
import path from "path";

import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const ext = path.extname(filePath).toLocaleLowerCase();

    if (!options.resource_type) {
      if ([".mp3", ".m4a"].includes(ext)) {
        option.resource_type = "video";
      } else {
        options.resource_type = "image";
      }
    }

    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (error) {
    console.error("Error uploading file to cloudinary ", error);
    throw error;
  } finally {
    fs.unlinkSync(filePath);
  }
};

export default uploadToCloudinary
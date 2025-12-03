import cloudinary from "../config/cloudinary.js";

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) {
    throw new Error("Public Id is required for deletion");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    console.error("Error deleting file from cloudinary", error);
    throw error;
  }
};

export default deleteFromCloudinary;

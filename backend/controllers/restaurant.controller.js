import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";

export const createRestaurant = async (req, res) => {
  try {
    const clerkId = req.auth?.userId;
    const {
      name,
      description,
      cuisineType,
      deliveryTime,
      openingTime,
      closingTime,
      deliveryRadius,
    } = req.body;

    if (!name || !description || !openingTime || !closingTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!clerkId) {
      return res.status(401).json({
        succcess: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* -----------------------------------------------------
       3) ADDRESS HANDLING 
    ----------------------------------------------------- */

    const address = {
      street: req.body["address[street]"] || "",
      city: req.body["address[city]"] || "",
      state: req.body["address[state]"] || "",
      zipCode: req.body["address[zipCode]"] || "",
      country: req.body["address[country]"] || "",
    };

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.path, {
        folder: "restaurant",
      });
      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.publicId_id;
    }

    const newRestaurant = new Restaurant({
      ownerId: user._id,
      name,
      description,
      image: imageUrl ? { url: imageUrl, publicId: imagePublicId } : null,
      cuisineType: Array.isArray(cuisineType)
        ? cuisineType
        : cuisineType
        ? [cuisineType]
        : [],
      address,
      deliveryTime: deliveryTime || 30,
      openingTime,
      closingTime,
      deliveryRadius: deliveryRadius || 5,
      isOpen: true,
    });

    await newRestaurant.save();

    if (user.role !== "seller") {
      user.role = "seller";
      await user.save();
    }

    return res.status(201).json({
      success: true,
      data: newRestaurant,
    });
  } catch (error) {
    console.error("Error during creating restaurant ", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllRes = async (req, res) => {
  try {
    // Fetch every restaurant from the database.

    const restaurants = await Restaurant.find().populate(
      "ownerId",
      "fullName email"
    );

    // Send a clean JSON response
    return res.status(200).json({
      success: true,
      count: restaurants.length, // Useful for frontend pagination or stats
      data: restaurants,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);

    // Generic fail-safe response
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getResById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id).populate(
      "ownerId",
      "fullName email"
    );

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    // Extract restaurant ID from URL
    const { id } = req.params;

    // Clerk user ID from auth middleware
    const clerkId = req.auth.userId;

    // Fields coming from the request body
    const {
      name,
      description,
      cuisineType,
      address,
      deliveryTime,
      isOpen,
      openingTime,
      closingTime,
      deliveryRadius,
    } = req.body;

    // Find the user that belongs to this Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch target restaurant
    const restaurant = await Restaurant.findById(id);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    // Authorization check — user must own this restaurant
    if (restaurant.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Handle image upload if a new file exists
    if (req.file) {
      // Remove old Cloudinary image if present
      if (restaurant.image?.publicId) {
        await deleteFromCloudinary(restaurant.image.publicId);
      }

      // Upload new image to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.path, {
        folder: "restaurants",
      });

      // Store Cloudinary details in the database
      restaurant.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    // Update only the fields that were provided
    if (name) restaurant.name = name;
    if (description) restaurant.description = description;

    // Handle cuisine array or single string
    if (cuisineType) {
      restaurant.cuisineType = Array.isArray(cuisineType)
        ? cuisineType
        : [cuisineType];
    }

    // Address, timings, and settings
    if (address) restaurant.address = address;
    if (deliveryTime) restaurant.deliveryTime = deliveryTime;
    if (openingTime) restaurant.openingTime = openingTime;
    if (closingTime) restaurant.closingTime = closingTime;
    if (deliveryRadius) restaurant.deliveryRadius = deliveryRadius;

    // Boolean `isOpen` must accept false as well
    if (isOpen !== undefined) restaurant.isOpen = isOpen;

    // Save updated restaurant
    await restaurant.save();

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    // Extract required data
    const { id } = req.params; // Restaurant ID from URL
    const clerkId = req.auth.userId; // Authenticated user (Clerk)

    // Fetch the user performing this action
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch the restaurant to be deleted
    const restaurant = await Restaurant.findById(id);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    // Authorization check — only owner can delete this restaurant
    if (restaurant.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove restaurant image from Cloudinary (if it exists)
    if (restaurant.image?.publicId) {
      await deleteFromCloudinary(restaurant.image.publicId);
    }

    // Remove all products linked to this restaurant
    await Product.deleteMany({ restaurant: restaurant._id });

    // Remove all orders linked to this restaurant
    await Order.deleteMany({ restaurant: restaurant._id });

    // Delete restaurant itself
    await Restaurant.findByIdAndDelete(id);

    // Check if user still owns any restaurants
    // If not, downgrade role back to "buyer"
    const remainingRestaurants = await Restaurant.find({ ownerId: user._id });
    if (remainingRestaurants.length === 0) {
      user.role = "buyer";
      await user.save();
    }

    // Send delete confirmation to frontend
    return res.status(200).json({
      message: "Restaurant deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRestaurantByOwner = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    // Fetch seller user
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch restaurant owned by seller
    const restaurant = await Restaurant.findOne({ ownerId: user._id });
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: "No restaurant found for this seller" });
    }

    // Fetch all products belonging to the restaurant
    const products = await Product.find({ restaurant: restaurant._id });

    return res.status(200).json({
      success: true,
      restaurant, // full restaurant object
      products, // full product list
    });
  } catch (error) {
    console.error("Error fetching seller restaurant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

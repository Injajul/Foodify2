import Restaurant from "../models/restaurant.model.js";
import Product from "../models/product.model.js";

// GLOBAL SEARCH CONTROLLER
export const globalSearch = async (req, res) => {
  try {
    const {
      q,                // general query (string match)
      cuisine,
      rating,
      deliveryTime,
      category,
      minPrice,
      maxPrice,
    } = req.query;

    // ---------------- RESTAURANT FILTER ----------------
    const restaurantFilter = {};

    if (q) restaurantFilter.name = { $regex: q, $options: "i" };
    if (cuisine) restaurantFilter.cuisineType = { $regex: cuisine, $options: "i" };
    if (rating) restaurantFilter.rating = { $gte: Number(rating) };
    if (deliveryTime) restaurantFilter.deliveryTime = { $lte: Number(deliveryTime) };

    // ---------------- PRODUCT FILTER ----------------
    const productFilter = {};

    if (q) productFilter.name = { $regex: q, $options: "i" };
    if (category) productFilter.category = { $regex: category, $options: "i" };
    
    if (minPrice || maxPrice) {
      productFilter.price = {};
      if (minPrice) productFilter.price.$gte = Number(minPrice);
      if (maxPrice) productFilter.price.$lte = Number(maxPrice);
    }

    // ---------------- RUN SEARCH ----------------
    const restaurants = await Restaurant.find(restaurantFilter).limit(20);
    const products = await Product.find(productFilter)
      .populate("restaurant")
      .limit(20);

    // ---------------- FALLBACK ----------------
    let fallbackRestaurants = [];
    let fallbackProducts = [];

    if (restaurants.length === 0 && products.length === 0) {
      fallbackRestaurants = await Restaurant.find().limit(5);
      fallbackProducts = await Product.find().limit(5);
    }

    return res.status(200).json({
      success: true,
      restaurants,
      products,
      fallbackRestaurants,
      fallbackProducts,
    });
  } catch (error) {
    console.log("GLOBAL SEARCH ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .sort({ rating: -1, createdAt: -1 }) // high rating + newest first
      .limit(10);

    return res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true })
      .sort({ avgRating: -1, numReviews: -1 })
      .limit(15)
      .populate("restaurant");

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
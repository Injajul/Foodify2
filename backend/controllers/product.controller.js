import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { restaurantId } = req.params;
    const { name, description, price, category } = req.body;

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    // Ownership check
    if (restaurant.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Upload image to Cloudinary
    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const uploadResult = await uploadToCloudinary(req.file.path, {
      folder: "products",
    });
    const imageUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    // Create product
    const newProduct = new Product({
      restaurant: restaurant._id,
      name,
      description,
      image: imageUrl ? { url: imageUrl, publicId: publicId } : null,
      price,
      category,
      isAvailable: true,
    });

    await newProduct.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { restaurantId, category, minPrice, maxPrice } = req.query;

    const filters = {};

    if (restaurantId) filters.restaurant = restaurantId;

    if (category) filters.category = category;

    // ---- PRICE RANGE FIX ----
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filters)
      .populate("restaurant", "name")
      .populate({
        path: "review",
        select: " comment rating",
        populate: {
          path: "user",
          select: "fullName email profileImage",
        },
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      "restaurant",
      "name description"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;
    const { name, description, price, category, isAvailable } = req.body;

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(id).populate("restaurant");
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ownership check
    if (product.restaurant.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update image if uploaded
    if (req.file) {
      if (product.image) {
        await deleteFromCloudinary(product.image);
      }

      const uploadResult = await uploadToCloudinary(req.file.path, {
        folder: "products",
      });
      product.image = uploadResult.secure_url;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const clerkId = req.auth.userId;

    // -------------------------------------
    // 1. VERIFY USER (seller)
    // -------------------------------------
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // -------------------------------------
    // 2. FETCH PRODUCT + VERIFY OWNERSHIP
    // -------------------------------------
    const product = await Product.findById(productId).populate("restaurant");
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.restaurant.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // -------------------------------------
    // 3. DELETE PRODUCT IMAGE FROM CLOUDINARY
    // -------------------------------------
    if (product.image?.publicId) {
      await deleteFromCloudinary(product.image.publicId);
    }

    // -------------------------------------
    // 4. REMOVE PRODUCT FROM ALL CARTS
    //    - Remove product from items
    //    - Recalculate totals
    //    - Auto-delete empty carts
    // -------------------------------------

    const carts = await Cart.find({ "items.product": productId });

    for (const cart of carts) {
      // remove product from cart items
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );

      // If no items left → delete cart
      if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(cart._id);
        continue;
      }

      // recalculate cart total ONLY for remaining items
      const remainingProductIds = cart.items.map((i) => i.product);
      const productDocs = await Product.find({
        _id: { $in: remainingProductIds },
      }).select("price");

      // map product prices for fast lookup
      const priceMap = {};
      productDocs.forEach((p) => (priceMap[p._id] = p.price));

      // compute new total
      cart.totalAmount = cart.items.reduce((sum, item) => {
        return sum + (priceMap[item.product] || 0) * item.quantity;
      }, 0);

      await cart.save();
    }

    // -------------------------------------
    // 5. DELETE ALL ORDERS THAT CONTAIN THIS PRODUCT
    //     delete in ONE DB call
    // -------------------------------------

    await Order.deleteMany({ "items.product": productId });

    // -------------------------------------
    // 6. DELETE PRODUCT ITSELF
    // -------------------------------------
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      message:
        "Product deleted successfully, removed from carts, and deleted related orders.",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

import Stripe from "stripe";
import Cart from "../models/cart.model.js";

import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const addToCart = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { restaurantId, productId } = req.params;
    const { quantity } = req.body;

    // ---------------------------------------------------------
    // 1. AUTH: Find the user performing the action
    // ---------------------------------------------------------
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ---------------------------------------------------------
    // 2. VALIDATE PRODUCT
    // Only fetch what's needed: name, price, image, category
    // ---------------------------------------------------------
    const product = await Product.findById(productId).select(
      "name price image category"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ---------------------------------------------------------
    // 3. Normalize quantity (avoid invalid values)
    // Always ensure quantity >= 1
    // ---------------------------------------------------------
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // ---------------------------------------------------------
    // 4. Find user's cart (each user has one cart)
    // ---------------------------------------------------------
    let cart = await Cart.findOne({ user: user._id });

    // ---------------------------------------------------------

    // A user can have multiple restaurants inside one cart
    // Each restaurant has multiple products
    // Each product has a quantity
    // So the logic has to figure out:
    // Does the user already have a cart?
    // If yes → does the cart already contain THIS restaurant?
    // If yes → does this restaurant already contain THIS product?
    // If yes → increase the quantity
    // If not → insert the product
    // If restaurant doesn’t exist → create restaurant group
    // If cart doesn’t exist → create cart

    // 5. CREATE NEW CART if user doesn’t have one
    // ---------------------------------------------------------
    if (!cart) {
      cart = new Cart({
        user: user._id,
        restaurants: [
          {
            restaurant: restaurantId,
            items: [{ product: productId, quantity: qty }],
          },
        ],
        totalAmount: product.price * qty,
      });

      await cart.save();
    }

    // ---------------------------------------------------------
    // 6. CART ALREADY EXISTS → Update it
    // ---------------------------------------------------------
    else {
      // Find restaurant group inside cart
      let group = cart.restaurants.find(
        (r) => r.restaurant.toString() === restaurantId
      );

      // -----------------------------------------------------
      // 6A. Restaurant group doesn't exist → create new group
      // -----------------------------------------------------
      if (!group) {
        cart.restaurants.push({
          restaurant: restaurantId,
          items: [{ product: productId, quantity: qty }],
        });
      }

      // -----------------------------------------------------
      // 6B. Group exists → update product quantity OR add new product
      // -----------------------------------------------------
      else {
        const existingItem = group.items.find(
          (i) => i.product.toString() === productId
        );

        if (existingItem) {
          existingItem.quantity += qty; // increase quantity
        } else {
          group.items.push({ product: productId, quantity: qty }); // add new product
        }
      }

      // -----------------------------------------------------
      // 7. RECALCULATE TOTAL PRICE (Reliable & accurate)

      //  array.reduce((accumulator, current, index, array) => {
      //  return new accumulator value
      //  }, initialValue);
      // -----------------------------------------------------
      cart.totalAmount = cart.restaurants.reduce((sum, r) => {
        return (
          sum +
          r.items.reduce(
            (itemTotal, item) => itemTotal + item.quantity * product.price,
            0
          )
        );
      }, 0);

      await cart.save();
    }

    // ---------------------------------------------------------
    // 8. POPULATE ONLY ONCE (Performance-friendly)
    // ---------------------------------------------------------
    await cart.populate(
      "restaurants.items.product",
      "name price image category"
    );
    await cart.populate("restaurants.restaurant", "name image");

    // ---------------------------------------------------------
    // 9. SEND RESPONSE
    // ---------------------------------------------------------
    return res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("ADD_CART_ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { restaurantId, productId } = req.params;

    // Find user
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find cart + populate product
    let cart = await Cart.findOne({ user: user._id }).populate(
      "restaurants.items.product",
      "name price image category"
    );

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find restaurant group
    let restaurantGroup = cart.restaurants.find(
      (r) => r.restaurant.toString() === restaurantId
    );
    if (!restaurantGroup)
      return res.status(404).json({ message: "Restaurant group not found" });

    // Remove product
    restaurantGroup.items = restaurantGroup.items.filter(
      (i) => i.product._id.toString() !== productId
    );

    // If restaurant group empty → remove restaurant entirely
    if (restaurantGroup.items.length === 0) {
      cart.restaurants = cart.restaurants.filter(
        (r) => r.restaurant.toString() !== restaurantId
      );
    }

    // Recalculate total
    cart.totalAmount = cart.restaurants.reduce((sum, rest) => {
      return (
        sum +
        rest.items.reduce(
          (sub, item) => sub + item.product.price * item.quantity,
          0
        )
      );
    }, 0);

    // Save
    await cart.save();

    // 🔥 IMPORTANT: REPPOPULATE RESTAURANT BEFORE RETURNING
    const populatedCart = await Cart.findById(cart._id)
      .populate("restaurants.restaurant", "name image")
      .populate("restaurants.items.product", "name price image category");

    return res.status(200).json({
      message: "Item removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    // 1️⃣ Extract core request data
    const clerkId = req.auth.userId;
    const { restaurantId, productId } = req.params;
    const { quantity } = req.body;

    // 2️⃣ Normalize quantity to a safe integer
    const normalizedQty = parseInt(quantity, 10);
    const safeQty = isNaN(normalizedQty) ? 0 : normalizedQty;

    // 3️⃣ Find user based on clerkId
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Find user's cart & populate product details
    const cart = await Cart.findOne({ user: user._id }).populate(
      "restaurants.items.product",
      "name price image category"
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // 5️⃣ Find the restaurant group
    const restaurantGroup = cart.restaurants.find(
      (r) => r.restaurant.toString() === restaurantId
    );

    if (!restaurantGroup) {
      return res.status(404).json({ message: "Restaurant group not found" });
    }

    // 6️⃣ Find the specific item inside that restaurant group
    const item = restaurantGroup.items.find(
      (i) => i.product._id.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // 7️⃣ Remove item OR update quantity
    if (safeQty < 1) {
      restaurantGroup.items = restaurantGroup.items.filter(
        (i) => i.product._id.toString() !== productId
      );
    } else {
      item.quantity = safeQty;
    }

    // 8️⃣ If restaurant group empty, remove it
    cart.restaurants = cart.restaurants.filter((r) => r.items.length > 0);

    // 9️⃣ Recalculate total amount
    cart.totalAmount = cart.restaurants.reduce((sum, rest) => {
      const restTotal = rest.items.reduce((sub, item) => {
        return sub + item.product.price * item.quantity;
      }, 0);
      return sum + restTotal;
    }, 0);

    // 🔟 Save updated cart
    await cart.save();

    //
    const populatedCart = await Cart.findById(cart._id)
      .populate("restaurants.restaurant", "name image")
      .populate("restaurants.items.product", "name price image category");

    // 1️⃣2️⃣ Return updated cart
    return res.status(200).json({
      message: "Cart updated",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    // 1️⃣ Extract logged-in user ID from Clerk auth
    const clerkId = req.auth.userId;

    // 2️⃣ Find the corresponding user in our database

    const user = await User.findOne({ clerkId }).select("_id");

    // If user doesn't exist, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Fetch the user's cart (supports multi-restaurant carts)
    // - select only fields we actually need: restaurants & totalAmount

    const cart = await Cart.findOne({ user: user._id })
      .select("restaurants totalAmount")
      .populate("restaurants.restaurant", "name image")
      .populate("restaurants.items.product", "name price image category")
      .lean();

    // 4️⃣ If no cart exists, return an "empty cart" structure
    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: {
          restaurants: [],
          totalAmount: 0,
        },
      });
    }

    // 5️⃣ If cart exists, return populated cart
    return res.status(200).json({
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    // 6️⃣ Catch-all error handler to prevent server crash and debug issues
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkoutCart = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { deliveryAddress } = req.body;

    if (
      !deliveryAddress ||
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.zipCode ||
      !deliveryAddress.country
    ) {
      return res
        .status(400)
        .json({ message: "Complete delivery address is required" });
    }

    const cart = await Cart.findOne({ user: user._id })
      .select("restaurants")
      .populate("restaurants.items.product", "price")
      .lean();

    if (!cart || cart.restaurants.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.restaurants.reduce((cartSum, rest) => {
      const restTotal = rest.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
      return cartSum + restTotal;
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user._id.toString(),
      },
    });

    const restaurantsData = cart.restaurants.map((r) => ({
      restaurant: r.restaurant,
      items: r.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
      })),
    }));

    const newOrder = new Order({
      user: user._id,
      restaurants: restaurantsData,
      totalAmount,
      deliveryAddress,
      paymentIntentId: paymentIntent.id,
      paymentStatus: "pending",
      orderStatus: "Pending",
    });

    await newOrder.save();

    return res.status(201).json({
      message: "Checkout created. Use clientSecret for payment.",
      clientSecret: paymentIntent.client_secret,
      order: newOrder,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
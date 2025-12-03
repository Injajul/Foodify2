import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = await Order.findById(id)
      .populate("restaurants.restaurant", "name image ownerId")
      .populate("restaurants.items.product", "name price image");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const isFinalStatus =
      order.orderStatus === "Delivered" || order.orderStatus === "Cancelled";

    if (isFinalStatus) {
      return res.status(400).json({
        message: "Order cannot be cancelled now",
      });
    }

    // Mark ALL restaurant blocks as cancelled
    order.restaurants.forEach((r) => {
      r.status = "Cancelled";
    });

    order.orderStatus = "Cancelled";
    order.paymentStatus = "refunded";

    // Refund Stripe
    await stripe.refunds.create({ payment_intent: order.paymentIntentId });

    await order.save();

    const populated = await Order.findById(id)
      .populate("user", "fullName email")
      .populate("restaurants.restaurant", "name image")
      .populate("restaurants.items.product", "name price image");

    return res.status(200).json(populated);
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("restaurants.restaurant", "name image")
      .populate("restaurants.items.product", "name price image");

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrdersBySellerId = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const seller = await User.findOne({ clerkId });
    if (!seller) return res.status(404).json({ message: "User not found" });

    const restaurants = await Restaurant.find({ ownerId: seller._id });
    const restaurantIds = restaurants.map((r) => r._id.toString());

    // Find orders that contain ANY of seller's restaurants
    const orders = await Order.find({
      "restaurants.restaurant": { $in: restaurantIds },
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullName email")
      .populate("restaurants.restaurant", "name image ownerId")
      .populate("restaurants.items.product", "name price image");

    // Filter each order so seller ONLY sees his restaurant block
    const filtered = orders.map((order) => {
      const sellerBlocks = order.restaurants.filter((r) =>
        restaurantIds.includes(r.restaurant._id.toString())
      );

      return {
        ...order.toObject(),
        restaurants: sellerBlocks,
      };
    });

    return res.status(200).json(filtered);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { orderId, restaurantId } = req.params;
    const { status } = req.body;

    const seller = await User.findOne({ clerkId });

    if (!seller) return res.status(404).json({ message: "User not found" });




    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = [
      "Pending",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Load order with necessary relationships
    const order = await Order.findById(orderId)
      .populate("restaurants.restaurant", "ownerId name image")
      .populate("restaurants.items.product", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Locate the restaurant block for seller
    const restaurantBlock = order.restaurants.find(
      (block) => block.restaurant._id.toString() === restaurantId
    );

    if (!restaurantBlock) {
      return res.status(403).json({ message: "Seller not part of this order" });
    }

    // Verify ownership
    if (
      restaurantBlock.restaurant.ownerId.toString() !== seller._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the restaurant-specific status
    restaurantBlock.status = status;

    // Update main order status
    const statuses = order.restaurants.map((r) => r.status);

    const allDelivered = statuses.every((s) => s === "Delivered");
    const allCancelled = statuses.every((s) => s === "Cancelled");
    const anyPreparing = statuses.includes("Preparing");
    const anyOutForDelivery = statuses.includes("Out for Delivery");

    if (allDelivered) {
      order.orderStatus = "Delivered";
    } else if (anyOutForDelivery) {
      order.orderStatus = "Out for Delivery";
    } else if (anyPreparing) {
      order.orderStatus = "Preparing";
    } else if (allCancelled) {
      order.orderStatus = "Cancelled";
    } else {
      order.orderStatus = "Pending";
    }

    await order.save();

    // Re-populate for full updated response
    const updatedOrder = await Order.findById(orderId)
      .populate("user", "fullName email")
      .populate("restaurants.restaurant", "name image ownerId")
      .populate("restaurants.items.product", "name price image");

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
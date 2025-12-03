import express from "express";
import {
  cancelOrder,
  getUserOrders,
  getOrdersBySellerId,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

// USER ROUTES
router.get("/user", requireAuth, getUserOrders);
router.patch("/:id/cancel", requireAuth, cancelOrder);

// SELLER ROUTES — updated logic supports multi-restaurant orders
router.get("/seller", requireAuth, getOrdersBySellerId);

// Update status of a *restaurant group* inside an order
router.patch("/:orderId/restaurant/:restaurantId/status", requireAuth, updateOrderStatus);

export default router;
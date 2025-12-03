import express from "express";
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart ,
  checkoutCart,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

// ✔ GET whole cart (all restaurants)
router.get("/", requireAuth, getCart);

// ✔ ADD item (needs restaurantId + productId)
router.post("/:restaurantId/:productId", requireAuth, addToCart);

// ✔ UPDATE quantity inside that restaurant
router.patch("/:restaurantId/items/:productId", requireAuth, updateCartQuantity);

// ✔ REMOVE item
router.delete("/:restaurantId/:productId", requireAuth, removeFromCart);


// ✔ NEW checkout — works for multi-restaurant order
router.post("/checkout", requireAuth, checkoutCart);

export default router;
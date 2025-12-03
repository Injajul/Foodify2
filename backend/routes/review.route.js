import express from "express";
import { createReview, getProductReviews } from "../controllers/review.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

// Create or update review
router.post("/:productId", requireAuth, createReview);

// Get all reviews for a product
router.get("/:productId", getProductReviews);

export default router;
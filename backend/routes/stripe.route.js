import express from "express";
import { stripeWebhook } from "../middlewares/stripeWebhook.js";

const router = express.Router();

// No JSON parsing here
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
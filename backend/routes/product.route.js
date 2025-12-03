import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import multer from "multer";
import storage from "../config/multerStorage.js";

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes (seller only)
router.post(
  "/:restaurantId",
  requireAuth,
  upload.single("image"),
  createProduct
);

router.patch("/:id", requireAuth, upload.single("image"), updateProduct);
router.delete("/:id", requireAuth, deleteProduct);

export default router;
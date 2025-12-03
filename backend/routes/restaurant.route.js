import express from "express";
import {
  getRestaurantByOwner,
  createRestaurant,
  getAllRes,
  getResById,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurant.controller.js";
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
router.get("/my-restaurant", requireAuth, getRestaurantByOwner);
router.post("/", requireAuth, upload.single("image"), createRestaurant);
router.get("/", getAllRes);
router.get("/:id", getResById);

router.patch("/:id", requireAuth, upload.single("image"), updateRestaurant);
router.delete("/:id", requireAuth, deleteRestaurant);


export default router;
import express from "express";
import { globalSearch,getTrendingRestaurants, getTrendingProducts} from "../controllers/search.controllers.js";

const router = express.Router();

router.get("/search", globalSearch);
router.get("/restaurants", getTrendingRestaurants);
router.get("/products", getTrendingProducts);

export default router;
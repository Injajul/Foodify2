
import express from "express"

import { getCurrentUser } from "../controllers/user.controller.js"
import {requireAuth} from "../middlewares/requireAuth.js"

const router = express.Router()

router.get("/me", requireAuth, getCurrentUser)

export default router
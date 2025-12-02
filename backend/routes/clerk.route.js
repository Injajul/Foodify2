
import express from "express"

import { handleClerkWebhook } from "../controllers/user.controller.js"
import { verifyClerkWebhooks  } from "../middlewares/verifyClerkWebhooks.js"

const router = express.Router()

router.post(
    "/clerk", express.raw({type:"application/json"}),
    verifyClerkWebhooks ,
    handleClerkWebhook
)

export default router
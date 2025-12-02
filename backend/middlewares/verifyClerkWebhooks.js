import { Webhook } from "svix";

import dotenv from "dotenv";

dotenv.config();

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error("Missing clerk web hooks sevret in env file");
}

export const verifyClerkWebhooks = async (req, res, next) => {
  try {
    const playload = req.body;
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const wh = new Webhook(WEBHOOK_SECRET);
    const event = wh.verify(playload, headers);
    req.event = event;
    next();
  } catch (error) {
    console.error("WebHooks sugnature verification failed", error.message);
    return res.status(400).json({ message: "Invalid webhooks signature " });
  }
};

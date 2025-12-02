
import Stripe from "stripe";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Stripe needs RAW body for signature verification
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      // ✅ When payment is successful
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        // 1️⃣ Find the order linked to this payment
        const order = await Order.findOne({
          paymentIntentId: paymentIntent.id
        });

        if (!order) {
          console.log("⚠️ No order found for paymentIntent:", paymentIntent.id);
          break;
        }

        // 2️⃣ Update order status
        order.paymentStatus = "succeeded";
        order.orderStatus = "Preparing";
        await order.save();

        console.log("✔️ Order updated to Preparing");

        // 3️⃣ DELETE the user's cart after successful payment
        await Cart.deleteOne({ user: order.user });

        console.log("🛒 Cart deleted for user:", order.user.toString());

        break;
      }

      // ❌ When payment fails
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        const order = await Order.findOne({
          paymentIntentId: paymentIntent.id
        });

        if (order) {
          order.paymentStatus = "failed";
          order.orderStatus = "Cancelled";
          await order.save();

          console.log("❌ Payment failed, order cancelled");
        }

        break;
      }

      default:
        console.log(`ℹ️ Unhandled event: ${event.type}`);
    }

    res.json({ received: true });

  } catch (err) {
    console.error("❌ Webhook Processing Error:", err.message);
    res.status(500).send("Internal server error");
  }
};
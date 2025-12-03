import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

// all Routes
import stripeRoute from "./routes/stripe.route.js"
import clerkRoute from "./routes/clerk.route.js"
import userRoute from "./routes/user.route.js"
import restaurantRoutes from "./routes/restaurant.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import orderRoutes from "./routes/order.route.js"
import reviewRoutes from "./routes/review.route.js"
import searchRoutes from "./routes/search.route.js"
const app = express()

// Frontend URL
const Base_URL = false
const allowedOrigins =Base_URL ? "https://foodify2-six.vercel.app":"http://localhost:5173"

app.use(
    cors({
        origin:allowedOrigins,
        credentials:true,
    })
)

//Stripe Webhook route end point 
app.use("/api/webhook",stripeRoute)
//Clerk Webhook route end point 

app.use("/api/webhook", clerkRoute )

//parse json for normal routes
app.use(express.json())

//Normal Api 

app.use("/api/users", userRoute)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/products", productRoutes)
app.use("/api/carts", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/searchs", searchRoutes)

export default app
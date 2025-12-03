import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

// all Routes
import clerkRoute from "./routes/clerk.route.js"
import userRoute from "./routes/user.route.js"

const app = express()

// Frontend URL
const Base_URL = true
const allowedOrigins =Base_URL ? "https://foodify2-six.vercel.app":"http://localhost:5173"

app.use(
    cors({
        origin:allowedOrigins,
        credentials:true,
    })
)

//Clerk Webhook route end point 

app.use("/api/webhook", clerkRoute )

//parse json for normal routes
app.use(express.json())

//Normal Api 

app.use("/api/users", userRoute)

export default app
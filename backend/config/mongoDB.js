
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.Mongo)
        console.log("Connected to MongoDB")
    } catch (error) {
        console.error("MongoDB connection error:", error)
        process.exit(1)
    }
}

export default connectDB

import dotevn from "dotenv"
import connectDB from "./config/mongoDB.js"
import app from "./app.js"

dotevn.config()

//MOngoDb connection
connectDB()

//Start the server 

const PORT = 5004
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})
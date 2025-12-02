
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    clerkId:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    email:{
        type:String
    },
    fullName:{
        type:String
    },
    profileImage:{
        type:String
    },
    role:{
        type:String,
        enum:["buyer", "seller"],
        default:"buyer"
    },
},{timestamps:true})

export default mongoose.model("User", userSchema)
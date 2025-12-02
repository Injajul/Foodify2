import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // owner is a user (restaurant admin)
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    cuisineType: [String],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: Number, // in minutes
      default: 30,
    },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    deliveryRadius: {
      type: Number,
      default: 5, // or whatever you prefer
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
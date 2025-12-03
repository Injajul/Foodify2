import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";


export const createReview = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });


    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // ------------------------------------------------------------
    // 1️⃣ Check if user already reviewed
    // ------------------------------------------------------------
    let review = await Review.findOne({
      product: productId,
      user: user._id,
    });

    if (review) {
      // update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // create new review
      review = new Review({
        product: productId,
        user: user._id,
        rating,
        comment,
      });

      await review.save();

      // push reference to product.review array
      product.review.push(review._id);
    }

    // ------------------------------------------------------------
    // 2️⃣ Recalculate average rating + total reviews
    // ------------------------------------------------------------
    const reviews = await Review.find({ product: productId });

    const totalReviews = reviews.length;

    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

    product.numReviews = totalReviews;
    product.avgRating = avgRating;
    await product.save();

    // ------------------------------------------------------------
    // 3️⃣ Return the full updated review with populated user
    // ------------------------------------------------------------
    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "fullName email profileImage"
    );

    return res.status(201).json({
      success: true,
      message: review ? "Review updated successfully" : "Review added successfully",
      review: populatedReview,
      avgRating,
      totalReviews,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // validate productId
    if (!productId ) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    // fetch all reviews for this product
    const reviews = await Review.find({ product: productId })
      .populate("user", "fullName email profileImage") // reviewer info
      .populate({
        path: "product",
        select: "name price image restaurant", // product fields
        populate: {
          path: "restaurant",
          select: "name _id", // restaurant fields
        },
      })
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

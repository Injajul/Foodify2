import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Review from "../models/review.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    const user = await User.findOne({ clerkId })
      .select(" clerkId fullName profileImage  email role")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        mesage: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {}
};

export const handleClerkWebhook = async (req, res) => {
  try {
    const event = req.event;
    const { type, data } = event;
    console.log(JSON.stringify(data, null, 2)); 
    // User created

    if (type === "user.created") {
      const clerkId = data.id;
      const existingUser = await User.findOne({ clerkId });
      if (!existingUser) {
        const newUser = new User({
          clerkId,
          fullName: data.first_name
            ? `${data.first_name} ${data.last_name || ""}`.trim()
            : "Anonymous",
          email: data.email_addresses?.[0]?.email_address || "",
          profileImage: data.image_url || "",
          role: "buyer",
        });

        await newUser.save();
      }
    }

    // -------------------------------------------------
    // USER UPDATED
    // -------------------------------------------------
    else if (type === "user.updated") {
      const clerkId = data.id;

      // Build full name only if Clerk provides at least first_name
      const fullName = data.first_name
        ? `${data.first_name} ${data.last_name || ""}`.trim()
        : undefined;

      const email = data.email_addresses?.[0]?.email_address;
      const profileImage = data.image_url;

      // Construct updates object but only include defined values
      const updates = {};

      if (fullName !== undefined) updates.fullName = fullName;
      if (email !== undefined) updates.email = email;
      if (profileImage !== undefined) updates.profileImage = profileImage;

      await User.findOneAndUpdate({ clerkId }, updates, { new: true });
    }

    // -------------------------------------------------
    // USER DELETED  (Heavy Cleanup Here)
    // -------------------------------------------------
    else if (type === "user.deleted") {
      const clerkId = data.id;
      const user = await User.findOne({ clerkId });

      if (!user) return;

      const dbTasks = []; // later we will run all DB deletes in parallel

      // ----------------------------
      // DELETE USER PROFILE IMAGE
      // ----------------------------
      await deleteFromCloudinary(user.profileImage).catch((err) => {
        console.log("Cloudinary error:", err.message);
      });

      // ----------------------------
      // IF USER IS A SELLER
      // ----------------------------
      if (user.role === "seller") {
        const restaurant = await Restaurant.findOne({ ownerId: user._id });

        if (restaurant) {
          // Delete restaurant image
          if (restaurant.image?.publicId) {
            deleteFromCloudinary(restaurant.image.publicId).catch(() => {});
          }

          // Fetch products in ONE query
          const products = await Product.find(
            { restaurant: restaurant._id },
            { media: 1 }
          );

          // Collect all Cloudinary image IDs with flatMap
          const imageIds = products.flatMap((p) =>
            Array.isArray(p.media)
              ? p.media.map((m) => m.publicId).filter(Boolean)
              : []
          );

          // Delete all images in Cloudinary (parallel)
          await Promise.all(
            imageIds.map((id) => deleteFromCloudinary(id).catch(() => {}))
          );

          // Add product + restaurant deletion as tasks
          dbTasks.push(
            Product.deleteMany({ restaurant: restaurant._id }),
            Restaurant.deleteOne({ _id: restaurant._id })
          );
        }
      }

      // ----------------------------
      // DELETE OTHER USER DATA
      // ----------------------------
      dbTasks.push(
        Order.deleteMany({ user: user._id }),
        Cart.deleteMany({ user: user._id }),
        Review.deleteMany({ user: user._id }),
        User.deleteOne({ clerkId })
      );

      // Run all DB deletions IN PARALLEL
      await Promise.all(dbTasks);
    }
    res.status(200).json({
      message: "WebHook processed",
    });
  } catch (error) {
    console.error("Webhook error", error.message);
    res.status(500).json({
      message: "Internal Server error",
    });
  }
};

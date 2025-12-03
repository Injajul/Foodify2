// pages/ProductDetails.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../../redux/slices/productSlice";
import { fetchProductReviews } from "../../redux/slices/reviewSlice";
import { motion } from "framer-motion";
// import AddToCart from "../cart/AddToCart";
import { FiStar, FiChevronLeft } from "react-icons/fi";
import { LuLoader } from "react-icons/lu";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singleProduct, loading: productLoading } = useSelector(
    (state) => state.products
  );
  const { productReviews, loading: reviewLoading } = useSelector(
    (state) => state.reviews
  );

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById({ id: productId }));
      dispatch(fetchProductReviews(productId));
    }
  }, [productId, dispatch]);

  if (productLoading || !singleProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <LuLoader className="w-10 h-10 text-purple-600" />
        </motion.div>
      </div>
    );
  }

  const product = singleProduct;
  const rating = product.avgRating > 0 ? product.avgRating.toFixed(1) : null;

  return (
    <div className="min-h-screen bg-gray-50 pl-5  pb-20 md:pb-2">
      {/* Header Image - Full Width on All Screens */}
      <div className="relative">
        <img
          src={product.image?.url || "/placeholder.png"}
          alt={product.name}
          className="w-full h-64 md:h-80 lg:h-96 object-cover"
        />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 lg:left-12 xl:left-16 bg-white/90 backdrop-blur-xl rounded-full p-3.5 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 z-10"
        >
          <FiChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        {/* Rating Badge */}
        {rating && (
          <div className="absolute bottom-4 right-4 bg-black/75 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold shadow-lg">
            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
            {rating}{" "}
            <span className="font-normal">({product.numReviews || 0})</span>
          </div>
        )}
      </div>

      {/* Main Content - Full width on mobile/tablet, centered card on large screens */}
      <div className="relative z-10 lg:-mt-12 lg:max-w-4xl lg:mx-auto lg:px-8">
        <div className="rounded-t-3xl lg:rounded-3xl bg-white shadow-xl lg:shadow-2xl overflow-hidden">
          <div className="px-6 pt-8 pb-4 lg:px-12 lg:pt-12 lg:pb-8">
            {/* Name & Restaurant */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mt-2">
              {product.restaurant?.name}
            </p>

            {/* Price + Add to Cart */}
            <div className="mt-6 flex items-center justify-between gap-6">
              <div>
                <p className="text-3xl lg:text-4xl font-black text-gray-900">
                  ${product.price}
                </p>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-3 inline-block">
                  {product.category}
                </span>
              </div>

              {/* <AddToCart
                restaurantId={product.restaurant?._id}
                productId={product._id}
                className="min-w-[160px]"
              /> */}
            </div>

            {/* Ingredients */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
                Ingredients
              </h3>
              <p className="text-gray-700 leading-relaxed text-base lg:text-lg bg-gray-50 rounded-2xl p-6 border border-gray-100">
                {product.description}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="px-6 pt-6 border-t border-gray-100 lg:px-12">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
              Customer Reviews{" "}
              {productReviews?.length > 0 && `(${productReviews.length})`}
            </h2>

            {reviewLoading ? (
              <p className="text-center text-gray-500 py-10">
                Loading reviews...
              </p>
            ) : productReviews?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-600 font-medium">No reviews yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Be the first one to share your experience!
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-8">
                {productReviews.slice(0, 3).map((review) => (
                  <div key={review._id} className="flex gap-5">
                    <img
                      src={
                        review.user?.profileImage || "/avatar-placeholder.png"
                      }
                      alt={review.user?.fullName}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {review.user?.fullName || "Guest"}
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
                        {review.comment}
                      </p>
                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}

                {productReviews.length > 3 && (
                  <button className="w-full text-center py-5 border-t border-gray-100 text-purple-600 font-medium hover:bg-gray-50 rounded-b-2xl transition-colors text-base">
                    View all {productReviews.length} reviews
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
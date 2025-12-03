
// *this component is used in RestaurantProducts.jsx page and TrendingProductsGrid page
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AddToCart from "../cart/AddToCart";
import { FiStar } from "react-icons/fi";

export default function ProductCard({ product, restaurantIdOverride }) {
  const navigate = useNavigate();
  const goToProduct = () => navigate(`/product/${product._id}`);

  const rating = product.avgRating
    ? Number(product.avgRating).toFixed(1)
    : "4.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Shiny overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
      </div>

      {/* IMAGE CONTAINER */}
      <div
        className="relative overflow-hidden bg-gray-100"
        onClick={goToProduct}
      >
        <motion.img
          src={product.image?.url || "/placeholder-food.jpg"}
          alt={product.name}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
          whileHover={{ scale: 1.1 }}
        />

        {/* Gradient overlay on bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Modern Glassmorphic Rating Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 backdrop-blur-xl bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold shadow-lg"
        >
          <FiStar
            size={15}
            className="text-yellow-300 drop-shadow"
            fill="currentColor"
          />
          <span className="drop-shadow">{rating}</span>
          <span className="text-xs opacity-80">★</span>
        </motion.div>
      </div>

      {/* CARD BODY */}
      <div className="p-5 pb-6 flex flex-col h-[180px]">
        {/* Product Name - Better line clamping & hover effect */}
        <h3
          onClick={goToProduct}
          className="font-extrabold text-xl text-gray-900 leading-tight line-clamp-2 group-hover:text-purple-700 transition-colors cursor-pointer"
        >
          {product.name}
        </h3>

        {/* Category pill - smaller & modern */}
        {product.category && (
          <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
            {product.category}
          </p>
        )}

        {/* Price + Cart Section */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              ${product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="block text-sm text-gray-400 line-through ml-2">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Floating Add to Cart Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <AddToCart
              restaurantId={restaurantIdOverride || product.restaurant?._id}
              productId={product._id}
              defaultQty={1}
              className="shadow-xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
}
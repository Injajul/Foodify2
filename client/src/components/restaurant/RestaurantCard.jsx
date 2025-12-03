// src/components/restaurant/RestaurantCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { FiClock, FiChevronRight, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  const rating = restaurant.rating > 0 ? Number(restaurant.rating).toFixed(1) : "4.8";
  const deliveryTime = restaurant.deliveryTime || "25-35";
  const cuisineList = restaurant.cuisineType || restaurant.cuisines || [];

  const goToRestaurant = () => navigate(`/restaurant/${restaurant._id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      onClick={goToRestaurant}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 cursor-pointer transition-all duration-500 hover:-translate-y-3"
    >
      {/* Image Container with Gradient Overlay */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={restaurant.image?.url || "/placeholder.png"}
          alt={restaurant.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Dark gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Rating Badge - Glassmorphic + Pulse */}
        <div className="absolute top-4 right-4 backdrop-blur-xl bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold shadow-xl">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FiStar className="text-yellow-400" fill="currentColor" />
          </motion.div>
          {rating}
        </div>

        {/* Optional: Live / Open Badge */}
        {restaurant.isOpen && (
          <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Open Now
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-3">
        <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1 group-hover:text-purple-700 transition-colors">
          {restaurant.name}
        </h3>

        <p className="text-sm text-gray-500 font-medium line-clamp-1">
          {cuisineList.slice(0, 3).join(" • ") || "Multi-cuisine"}
          {cuisineList.length > 3 && " + more"}
        </p>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 font-semibold">
            <FiClock className="text-purple-600" />
            <span>{deliveryTime} min</span>
          </div>

          <motion.div className="flex items-center gap-1 text-purple-600 font-bold group-hover:gap-2 transition-all">
            <span>View Menu</span>
            <FiChevronRight className="text-lg group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Accent */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
    </motion.div>
  );
}
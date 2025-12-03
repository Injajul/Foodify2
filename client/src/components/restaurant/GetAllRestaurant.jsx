import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRestaurants } from "../../redux/slices/restaurantSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiChevronRight, FiStar, FiLoader } from "react-icons/fi";

export default function GetAllRestaurant() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, allRestaurants, error } = useSelector(
    (state) => state.restaurants
  );

  useEffect(() => {
    dispatch(fetchAllRestaurants());
  }, [dispatch]);


    // Central Loading Spinner (used when initially fetching)
  if (loading && (!allRestaurants || allRestaurants.data?.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <FiLoader className="w-12 h-12 text-purple-600" />
        </motion.div>
        <p className="mt-6 text-lg font-medium text-gray-600">
          Finding the best spots near you...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-semibold text-red-600">Oops! {error}</p>
      </div>
    );
  }

    const restaurants = allRestaurants?.data || [];

  if (!restaurants.length && !loading) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">No restaurants found near you</p>
      </div>
    );
  }

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
      {/* Skeleton Image */}
      <div className="aspect-4/3 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
      </div>

      {/* Skeleton Body */}
      <div className="p-6 space-y-4">
        <div className="h-7 bg-gray-200 rounded-xl w-4/5 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>

      
    </div>
  );
   return (
    <section className="w-full py-10 pb-24 lg:pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ">
      {/* Modern Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pl-4 mb-12 text-center sm:text-left"
      >
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            All Restaurants Near You
          </span>
        </h2>
        <p className="mt-3 text-lg text-gray-600 font-medium">
          {loading ? "Loading..." : `${restaurants.length} spots ready to serve you magic`}
        </p>
      </motion.div>

      {/* Grid with Skeleton or Real Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pl-4 gap-7">
        {loading
          ? Array(8)
              .fill(null)
              .map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
          : restaurants.map((r, index) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/restaurant/${r._id}`)}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 cursor-pointer transition-all duration-500 hover:-translate-y-3"
              >
                {/* Image with Overlay */}
                <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                  <img
                    src={r.image?.url || "/placeholder.png"}
                    alt={r.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 backdrop-blur-xl bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold shadow-xl">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <FiStar className="text-yellow-400" fill="currentColor" />
                    </motion.div>
                    {r.avgRating > 0 ? Number(r.avgRating).toFixed(1) : "4.8"}
                  </div>

                  {/* Open Status */}
                  {r.isOpen && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Open Now
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1 group-hover:text-purple-700 transition-colors">
                    {r.name}
                  </h3>

                  <p className="text-sm text-gray-500 font-medium line-clamp-1">
                    {r.cuisineType?.slice(0, 3).join(" • ") || "Multi-cuisine"}
                    {r.cuisineType?.length > 3 && " + more"}
                  </p>

                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="text-purple-600">Location</span>{" "}
                    {r.address?.city || "Your Area"}
                  </p>

                  <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600 font-semibold">
                      <FiClock className="text-purple-600" />
                      <span>{r.deliveryTime || "25-35"} min</span>
                    </div>

                    <motion.div className="flex items-center gap-1 text-purple-600 font-bold group-hover:gap-2 transition-all">
                      <span>View Menu</span>
                      <FiChevronRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              </motion.div>
            ))}
      </div>
    </section>
  );
}

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurantById } from "../../redux/slices/restaurantSlice";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiMapPin,
  FiStar,
  FiTruck,
  FiInfo,
  FiX,
  FiChevronLeft,
} from "react-icons/fi";
import RestaurantProducts from "../product/RestaurantProducts";

const getRestaurantQuickInfo = (rest) => {
  return [
    {
      icon: FiClock,
      value: `${rest.deliveryTime} min`,
      label: "Delivery",
    },
    {
      icon: FiTruck,
      value: `${rest.deliveryRadius} km`,
      label: "Radius",
    },
    {
      icon: FiStar,
      value: rest.rating > 0 ? `${rest.rating} Stars` : "New",
      label: "Rating",
    },
    {
      icon: FiMapPin,
      value: rest.address?.city || "Nearby",
      label: "Location",
    },
  ];
};

export default function RestaurantDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [showInfo, setShowInfo] = useState(false);

  const { singleRestaurant: rest, error } = useSelector(
    (state) => state.restaurants
  );

   // Fetch restaurant on mount or ID change
  useEffect(() => {
    const loadRestaurant = async () => {
      const token = await getToken();
      dispatch(fetchRestaurantById({ id, token }));
    };
    loadRestaurant();
  }, [id, dispatch, getToken]);

  // Error State
  if (error || !rest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-6">
        <div className="text-center bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl max-w-md">
          <p className="text-6xl mb-4">Not Found</p>
          <p className="text-2xl font-bold text-red-600 mb-2">Oops!</p>
          <p className="text-gray-700 text-lg">
            {error || "Restaurant not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-8 px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOpen = rest.isOpen;


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50"
    >
      {/* ============================
        HERO SECTION (Top Banner)
       ============================ */}
      <div className="relative h-80 md:h-96 lg:h-[448px] overflow-hidden">
        {/* Restaurant Banner Image */}
        <img
          src={rest.image?.url || "/placeholder.png"}
          alt={rest.name}
          className="w-full h-full object-cover"
        />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 lg:left-12 xl:left-16 bg-white/90 backdrop-blur-xl rounded-full p-3.5 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 z-10"
        >
          <FiChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        {/* Dark gradient overlay on top of banner image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Restaurant Header Text + Open/Close Status */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 p-6 md:p-10"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            {/* Restaurant Name + Cuisine */}
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl">
                {rest.name}
              </h1>
              <p className="mt-2 text-lg md:text-xl text-white/90 font-medium">
                {rest.cuisineType?.join(" • ") || "Multi-cuisine"}
              </p>
            </div>

            {/* Status Badge + Info Toggle Button */}
            <div className="flex items-center gap-4">
              {/* Open/Closed Indicator */}
              <div
                className={`px-6 py-3 rounded-full text-lg font-bold flex items-center gap-2 shadow-2xl ${
                  isOpen
                    ? "bg-green-500 text-white"
                    : "bg-red-500/90 text-white"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    isOpen ? "bg-white animate-pulse" : "bg-white/70"
                  }`}
                />
                {isOpen ? "Open Now" : "Closed"}
              </div>

              {/* Show/Hide Info Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInfo(!showInfo)}
                className="p-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white shadow-xl flex items-center gap-2 font-semibold"
              >
                {showInfo ? <FiX size={20} /> : <FiInfo size={20} />}
                {showInfo ? "Hide Info" : "Show Info"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================
        INFO SECTION (Collapsible)
       ============================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pb-24">
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden mb-10"
            >
              {/* Detailed Restaurant Info Container */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12"
              >
                {/* Restaurant Description */}
                <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed mb-8">
                  {rest.description || "A wonderful place to enjoy great food!"}
                </p>

                {/* Quick Info Grid (delivery, rating, location etc.) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {getRestaurantQuickInfo(rest).map((item, i) => (
                    <div key={i} className="text-center">
                      <item.icon className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {item.value}
                      </p>
                      <p className="text-sm text-gray-600">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Address + Owner Info */}
                <div className="mt-10 grid md:grid-cols-2 gap-8">
                  {/* Full Address */}
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <p className="font-bold text-gray-800 mb-2">Full Address</p>
                    <p className="text-gray-600">
                      {rest.address?.street}, {rest.address?.city},{" "}
                      {rest.address?.state} {rest.address?.zipCode}
                    </p>
                  </div>

                  {/* Owner Card (Only if owner exists) */}
                  {rest.ownerId && (
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl">
                        {rest.ownerId.fullName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Owner</p>
                        <p className="text-gray-700">{rest.ownerId.fullName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================
          MENU SECTION
         ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        >
          <div className="p-6 md:p-10">
            {/* Menu Section Title */}
            <div className="mb-10">
              <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Menu
              </h2>
              <div className="h-1.5 w-40 bg-gradient-to-r from-purple-500 to-pink-500 mt-4 rounded-full" />
            </div>

            {/* Product List Component */}
            <RestaurantProducts restaurantId={id} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

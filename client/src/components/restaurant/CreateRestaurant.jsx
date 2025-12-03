// pages/CreateRestaurant.jsx — FINAL FIXED VERSION
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiUpload,
  FiX,
  FiMapPin,
  FiClock,
  FiTag,
  FiPlus,
} from "react-icons/fi";
import { createRestaurant } from "../../redux/slices/restaurantSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateRestaurant() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { createLoading:loading } = useSelector((state) => state.restaurants);

  const [customCuisine, setCustomCuisine] = useState("");
  const emptyFormData = {
    name: "",
    description: "",
    cuisineType: [],
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
    deliveryTime: "30",
    deliveryRadius: "",
    openingTime: "",
    closingTime: "",
    image: null,
    imagePreview: null,
  };
  const [formData, setFormData] = useState(emptyFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null, imagePreview: null }));
  };

  const handleRemoveCuisine = (index) => {
    setFormData((prev) => ({
      ...prev,
      cuisineType: prev.cuisineType.filter((_, i) => i !== index),
    }));
  };

  const handleCuisineSelect = (e) => {
    const value = e.target.value;
    if (value && !formData.cuisineType.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        cuisineType: [...prev.cuisineType, value],
      }));
    }
    e.target.value = "";
  };

  const addCustomCuisine = () => {
    const value = customCuisine.trim();
    if (value && !formData.cuisineType.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        cuisineType: [...prev.cuisineType, value],
      }));
    }
    setCustomCuisine("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "address" && key !== "imagePreview") {
        if (key === "cuisineType") {
          value.forEach((c) => fd.append("cuisineType[]", c));
        } else {
          fd.append(key, value);
        }
      }
    });

    Object.entries(formData.address).forEach(([key, value]) => {
      fd.append(`address[${key}]`, value);
    });

    try {
      const token = await getToken();
      await dispatch(createRestaurant({ formData: fd, token })).unwrap();

      toast.success("Restaurant created successfully!");
      setFormData(emptyFormData);

      // redirect back to previous page
      navigate(-1);
    } catch (error) {
      toast.error(error?.message || "Failed to create restaurant");
    }
  };

  return (
    <div className=" overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-800" />
          </motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Open Your Restaurant
            </h1>
            <p className="text-sm text-gray-600">
              Start selling your food today
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className=" w-full lg:max-w-4xl mx-auto   lg:py-10 pb-20 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        >
          <div className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name & Description */}

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Spice Garden"
                  className="w-full px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-base md:text-lg"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="A cozy spot serving authentic Indian flavors..."
                  className="w-full px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 resize-none text-base"
                />
              </div>

              {/* Cuisine Types */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                  <FiTag className="w-5 h-5 text-purple-600" />
                  Cuisine Types
                </label>
                <div className="flex flex-wrap gap-3 mb-5">
                  {formData.cuisineType.map((cuisine, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-medium shadow-lg"
                    >
                      {cuisine}
                      <button
                        type="button"
                        onClick={() => handleRemoveCuisine(i)}
                        className="hover:bg-white/20 rounded-full p-1 transition"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </motion.span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    onChange={handleCuisineSelect}
                    className="flex-1 px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  >
                    <option value="" disabled selected>
                      Add cuisine
                    </option>
                    <option>Indian</option>
                    <option>Italian</option>
                    <option>Chinese</option>
                    <option>American</option>
                    <option>Thai</option>
                    <option>Mexican</option>
                    <option>Japanese</option>
                    <option>French</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      value={customCuisine}
                      onChange={(e) => setCustomCuisine(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addCustomCuisine())
                      }
                      type="text"
                      placeholder="Custom..."
                      className="flex-1 px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={addCustomCuisine}
                      className="flex px-6 gap-2 py-2 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg whitespace-nowrap"
                    >
                      <FiPlus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                  <FiMapPin className="w-5 h-5 text-purple-600" />
                  Delivery Address
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    placeholder="Street"
                    className="px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  />
                  <input
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  />
                  <input
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    className="px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  />
                  <input
                    name="zipCode"
                    value={formData.address.zipCode}
                    onChange={handleAddressChange}
                    placeholder="Zip Code"
                    className="px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  />
                  <input
                    name="country"
                    value={formData.address.country}
                    onChange={handleAddressChange}
                    placeholder="Country"
                    className="sm:col-span-2 px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Delivery Time + Radius → One Row */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                  <FiClock className="w-5 h-5 text-purple-600" />
                  Delivery Info
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-gray-600">
                      Average Delivery Time (mins)
                    </label>
                    <input
                      type="number"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                      min="10"
                      className="w-full mt-2 px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      name="deliveryRadius"
                      value={formData.deliveryRadius}
                      onChange={handleChange}
                      className="w-full mt-2 px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Opening & Closing Time → One Row */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-4">
                  Business Hours
                </label>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-gray-600">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      name="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="w-full mt-2 px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      name="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="w-full mt-2 px-4 py-3 md:py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                  <FiUpload className="w-5 h-5 text-purple-600" />
                  Restaurant Image
                </label>
                {formData.imagePreview ? (
                  <div className="relative group rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-full h-58 lg:h-80 object-cover"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={removeImage}
                      className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <FiX className="w-6 h-6" />
                    </motion.button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="block w-full h-58 lg:h-80 border-4 border-dashed border-purple-300 rounded-3xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 flex flex-col items-center justify-center"
                  >
                    <FiUpload className="w-16 h-16 text-purple-600 mb-4" />
                    <p className="text-xl font-bold text-gray-700">
                      Upload Image
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Click to upload
                    </p>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 text-xl font-bold text-white rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl hover:shadow-purple-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiPlus className="w-5 h-5" />
                )}
                {loading ? "Creating Restaurant..." : "Create Restaurant"}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
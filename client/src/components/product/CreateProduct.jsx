// pages/CreateProduct.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { createProduct } from "../../redux/slices/productSlice";
import { toast } from "react-toastify";

import {
  FiArrowLeft,
  FiUpload,
  FiX,
  FiImage,
  FiDollarSign,
  FiTag,
  FiPlus,
} from "react-icons/fi";

export default function CreateProduct() {
  const { id } = useParams(); // restaurantId
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { loading } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    image: null,
    imagePreview: null,
  });

  // INPUT HANDLER: Update simple text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // FILE HANDLER: Preview image + store file in state
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    // Build FormData safely (skip preview field)
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "imagePreview" && value !== null && value !== "") {
        fd.append(key, value);
      }
    });

    try {
      const token = await getToken();

      // unwrap() allows normal try/catch behavior
      await dispatch(createProduct({ id, formData: fd, token })).unwrap();

      // SUCCESS TOAST
      toast.success("Product created successfully!");

      // RESET FORM
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        image: null,
        imagePreview: null,
      });

      // GO BACK TO PREVIOUS PAGE
      navigate(-1);
    } catch (error) {
      // ERROR TOAST
      toast.error(error || "Something went wrong while creating product");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
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
              Add New Product
            </h1>
            <p className="text-sm text-gray-600">Expand your menu</p>
          </div>
        </div>
      </div>

      {/* Main Form - Responsive Padding Bottom */}
      <div className="max-w-3xl mx-auto px-6 py-10 pb-20 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FiTag className="w-5 h-5 text-purple-600" />
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Butter Chicken Burger"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-lg"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FiImage className="w-5 h-5 text-purple-600" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Rich, creamy, and packed with flavor..."
                  className="w-full px-5 py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 resize-none text-base"
                />
              </div>

              {/* Category & Price - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Burger, Pizza"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FiDollarSign className="w-5 h-5 text-purple-600" />
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="299"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-300 bg-white/80 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                  <FiUpload className="w-5 h-5 text-purple-600" />
                  Product Image
                </label>

                {formData.imagePreview ? (
                  <div className="relative group rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-full h-40 md:h-80 object-cover"
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
                    className="block w-full h-40 md:h-80 border-4 border-dashed border-purple-300 rounded-3xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 flex flex-col items-center justify-center"
                  >
                    <FiUpload className="w-16 h-16 text-purple-600 mb-4" />
                    <p className="text-xl font-bold text-gray-700">
                      Drop image here
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      or click to browse
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

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 text-xl font-bold text-white rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl hover:shadow-purple-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Product...
                  </>
                ) : (
                  <>
                    <FiPlus className="w-7 h-7" />
                    Create Product
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

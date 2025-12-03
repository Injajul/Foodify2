
// *this component is used in Restaurant Details.jsx page

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByRestaurant } from "../../redux/slices/productSlice";
import ProductCard from "../product/ProductCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function RestaurantProducts({ restaurantId }) {
  const dispatch = useDispatch();
  const { loading, byRestaurant, error } = useSelector(
    (state) => state.products
  );

  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const applyFilters = () => {
    dispatch(
      fetchProductsByRestaurant({
        restaurantId,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      })
    );
  };

  const resetFilters = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    dispatch(fetchProductsByRestaurant({ restaurantId }));
  };

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchProductsByRestaurant({ restaurantId }));
    }
  }, [restaurantId, dispatch]);

  return (
    <div className="px-4 py-4">

      {/* FILTER BOX */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        <select
          className="border rounded-lg px-3 py-2 w-full md:w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Burger">Burger</option>
          <option value="Pizza">Pizza</option>
          <option value="Drinks">Drinks</option>
          <option value="Snacks">Snacks</option>
          <option value="Dessert">Dessert</option>
        </select>

        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="number"
            placeholder="Min Price"
            className="border rounded-lg px-3 py-2 w-full"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="border rounded-lg px-3 py-2 w-full"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Apply
          </button>

          <button
            onClick={resetFilters}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100"
            >
              <Skeleton height={180} className="rounded-2xl" />
              <Skeleton height={25} width="70%" className="mt-4" />
              <Skeleton height={18} width="40%" />
              <Skeleton height={28} width="50%" className="mt-3" />
              <Skeleton height={40} width={90} className="mt-3 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-center text-red-600 mt-6">{error}</p>}

      {!loading && !error && (!byRestaurant || byRestaurant.length === 0) && (
        <p className="text-center text-gray-500 mt-6">No products found.</p>
      )}

      {/* PRODUCT GRID */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {byRestaurant?.map((item) => (
          <ProductCard
            key={item._id}
            product={item}
            restaurantIdOverride={restaurantId}
          />
        ))}
      </div>
    </div>
  );
}
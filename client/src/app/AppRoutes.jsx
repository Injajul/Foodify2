import React from "react";
import { Route, Routes } from "react-router-dom";

import AppAuthLayout from "./AppAuthLayout";
import AppMainLayout from "./AppMainLayout";
import Signup from "../pages/register/Signup";
import Login from "../pages/register/Login";
import CreateRestaurant from "../components/restaurant/CreateRestaurant";
import GetAllRestaurant from "../components/restaurant/GetAllRestaurant";
import RestaurantDetails from "../components/restaurant/RestaurantDetails";
import UpdateRestaurant from "../components/restaurant/UpdateRestaurant";
import CreateProduct from "../components/product/CreateProduct";
import UpdateProduct from "../components/product/UpdateProduct"
import ProductDetails from "../components/product/ProductDetails";
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppAuthLayout />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<AppMainLayout />}>
        <Route path="/create-restaurant" element={<CreateRestaurant />} />
      </Route>
      <Route path="/all-res" element={<GetAllRestaurant />} />
      <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      <Route path="/restaurant/:id/edit" element={<UpdateRestaurant />} />

      <Route path="/create-product/:id" element={<CreateProduct />} />
      <Route path="/product/:productId" element={<ProductDetails />} />
      <Route path="/product/:id/edit" element={<UpdateProduct />} />
    </Routes>
  );
}

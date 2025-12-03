import React from "react";
import { Route, Routes } from "react-router-dom";

import AppAuthLayout from "./AppAuthLayout";
import AppMainLayout from "./AppMainLayout";
import Signup from "../pages/register/Signup";
import Login from "../pages/register/Login";



export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppAuthLayout />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
      </Route>

      <Route element={<AppMainLayout />}>
     
      </Route>
    </Routes>
  );
}

import React from "react";
import { Route, Routes } from "react-router-dom";

import AppAuthLayout from "./AppAuthLayout";
import AppMainLayout from "./AppMainLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppAuthLayout />}>
        {/* <Route path="/signup" element={<Signup />} /> */}
      </Route>

      <Route element={<AppMainLayout />}></Route>
    </Routes>
  );
}

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { ToastContainer } from "react-toastify";
import { fetchCurrentAuthUser } from "../redux/slices/userSlice";
import { useAuth } from "@clerk/clerk-react";

export default function App() {
  const dispatch = useDispatch();
  const { getToken, isLoaded, userId } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !userId) return;

      try {
        const token = await getToken();
        
        dispatch(fetchCurrentAuthUser(token));
      } catch (err) {
        console.error("Failed to get Clerk token", err);
      }
    };

    fetchUser();
  }, [dispatch, getToken, isLoaded, userId]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

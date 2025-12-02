import React, { useEffect } from "react";
import { useDispatch} from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { ToastContainer } from "react-toastify";
import { fetchCurrentAuthUser } from "../redux/slices/userSlice";
import { useAuth } from "@clerk/clerk-react";



export default function App() {
  const dispatch = useDispatch();
  const { getToken, isLoaded} = useAuth();



  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded) return;
      try {
        const token = await getToken();
        dispatch(fetchCurrentAuthUser(token));
      } catch (err) {
        console.error("Failed to get Clerk token", err);
      }
    };

    fetchUser();
  }, [dispatch, getToken, isLoaded]);

  return (
    <BrowserRouter>
      
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}
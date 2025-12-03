import axios from "axios";
import { API_BASE_URL } from "../../redux/apiUrl";

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/restaurants`,
  withCredentials: true,
});

// ------------------ CREATE ------------------

export const createRestaurantApi = (formData, token) => {
  return api.post("/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      
    },
  });
};

// ------------------ GET ALL ------------------
export const getAllRestaurantsApi = () => {
  return api.get("/");
};

// ------------------ GET SINGLE ------------------
export const getRestaurantByIdApi = (id, token) => {
  return api.get(`/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ------------------ UPDATE ------------------
export const updateRestaurantApi = (id, formData, token) => {
  return api.patch(`/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

// ------------------ DELETE ------------------
export const deleteRestaurantApi = (id, token) => {
  return api.delete(`/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ------------------ GET RESTAURANT BY OWNER ------------------
export const getRestaurantByOwnerApi = (token) => {
  return api.get("/my-restaurant", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
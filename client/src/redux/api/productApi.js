import axios from "axios";
import { API_BASE_URL } from "../../redux/apiUrl";

// Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/products`,
  withCredentials: true,
});

// ------------------ CREATE ------------------
export const createProductApi = (id, formData, token) => {
  return api.post(`/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ------------------ GET ALL ------------------
export const getAllProductsApi = (params) => {
  return api.get("/", { params });
};

// ------------------ GET SINGLE ------------------
export const getProductByIdApi = (id, token) => {
  return api.get(`/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ------------------ UPDATE ------------------
export const updateProductApi = (id, formData, token) => {
  return api.patch(`/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ------------------ DELETE ------------------
export const deleteProductApi = (id, token) => {
  return api.delete(`/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
import axios from "axios";

import { API_BASE_URL } from "../apiUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  withCredentials: true,
});

export const CurrentAuthUser = (token) =>
  api.get("me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import restaurantReducer from "./slices/restaurantSlice";
import productReducer from "./slices/productSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    restaurants: restaurantReducer,
    products: productReducer,
  },
});

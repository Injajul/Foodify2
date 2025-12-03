import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createRestaurantApi,
  getAllRestaurantsApi,
  getRestaurantByIdApi,
  updateRestaurantApi,
  deleteRestaurantApi,
  getRestaurantByOwnerApi,
} from "../api/restaurantApi";

// -------------------- THUNKS ---------------------------

// CREATE
export const createRestaurant = createAsyncThunk(
  "restaurants/create",
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const response = await createRestaurantApi(formData, token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// GET ALL
export const fetchAllRestaurants = createAsyncThunk(
  "restaurants/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllRestaurantsApi();
      console.log("all-res",response.data)
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// GET BY ID
export const fetchRestaurantById = createAsyncThunk(
  "restaurants/getOne",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await getRestaurantByIdApi(id, token);
      console.log("fetchRestaurantById", response.data.data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchSellerRestaurant = createAsyncThunk(
  "restaurants/seller",
  async ({ token }, thunkAPI) => {
    try {
      const res = await getRestaurantByOwnerApi(token);
      console.log("fetchSellerRestaurant", res.data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);
// UPDATE
export const updateRestaurant = createAsyncThunk(
  "restaurants/update",
  async ({ id, formData, token }, { rejectWithValue }) => {
    try {
      const response = await updateRestaurantApi(id, formData, token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// DELETE
export const deleteRestaurant = createAsyncThunk(
  "restaurants/delete",
  async ({ id, token }, thunkAPI) => {
    try {
      const res = await deleteRestaurantApi(id, token);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurants",
  initialState: {
    allRestaurants: [],
    singleRestaurant: null,
    currentRestaurantId: null,
    sellerProducts: [],
    createLoading:false,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // ------------------ CREATE ------------------
      .addCase(createRestaurant.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.createLoading= false;
        state.allRestaurants.push(action.payload);
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // ------------------ GET ALL ------------------
      .addCase(fetchAllRestaurants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.allRestaurants = action.payload;
      })
      .addCase(fetchAllRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ------------------ GET ONE ------------------
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleRestaurant = action.payload;
        state.currentRestaurantId =
          action.payload?._id || action.payload.id || null;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSellerRestaurant.fulfilled, (state, action) => {
        state.loading = false;

        const { restaurant, products } = action.payload || {};

        state.singleRestaurant = restaurant || null;
        state.currentRestaurantId = restaurant?._id || null;
        state.sellerProducts = Array.isArray(products) ? products : [];
      })

      // ------------------ UPDATE ------------------
      .addCase(updateRestaurant.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allRestaurants.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) state.allRestaurants[index] = action.payload;
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ------------------ DELETE ------------------
      .addCase(deleteRestaurant.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.loading = false;

        // --------------------------------------------------
        // Normalize deleted restaurant ID from payload
        // (backend sometimes sends { deletedId }, sometimes just the id)
        // --------------------------------------------------
        const deletedId =
          action.payload?.deletedId ??
          (typeof action.payload === "string" ? action.payload : null);

        if (!deletedId) return;

        // --------------------------------------------------
        // 1. Remove restaurant from list
        // --------------------------------------------------
        state.allRestaurants = state.allRestaurants.filter(
          (restaurant) => restaurant._id !== deletedId
        );

        // --------------------------------------------------
        // 2. If currently selected restaurant was deleted
        //    → remove it from state
        // --------------------------------------------------
        if (state.currentRestaurantId === deletedId) {
          state.singleRestaurant = null;
          state.currentRestaurantId = null;
        }

        // --------------------------------------------------
        // 3. Remove all seller products related to this restaurant
        // --------------------------------------------------
        if (Array.isArray(state.sellerProducts)) {
          state.sellerProducts = state.sellerProducts.filter(
            (product) => product.restaurant !== deletedId
          );
        }
      })

      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default restaurantSlice.reducer;
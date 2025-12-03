import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllProductsApi,
  getProductByIdApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../api/productApi";

// ----------------------- THUNKS ----------------------------
// CREATE
export const createProduct = createAsyncThunk(
  "products/create",
  async ({ id, formData, token }, { rejectWithValue }) => {
    try {
      const res = await createProductApi(id, formData, token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// GET ALL
export const fetchProductsByRestaurant = createAsyncThunk(
  "products/getByRestaurant",
  async (params, { rejectWithValue }) => {
    try {
      const res = await getAllProductsApi(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// GET ONE
export const fetchProductById = createAsyncThunk(
  "products/getOne",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const res = await getProductByIdApi(id, token);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// UPDATE
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, formData, token }, thunkAPI) => {
    try {
      const res = await updateProductApi(id, formData, token);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// DELETE
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async ({ id, token }, thunkAPI) => {
    try {
      await deleteProductApi(id, token);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// --------------------------- SLICE ---------------------------

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    byRestaurant: [],
    singleProduct: null,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
    // CREATE
    .addCase(createProduct.pending, (state) => {
      state.loading = true;
    })
    .addCase(createProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.list.push(action.payload);
    })
    .addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
      // GET ALL
      .addCase(fetchProductsByRestaurant.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.byRestaurant = action.payload; // array of products
      })
      .addCase(fetchProductsByRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ONE
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // UPDATE
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;

        //  Remove from sellerProducts
        if (state.sellerProducts) {
          state.sellerProducts = state.sellerProducts.filter(
            (p) => p._id !== action.payload
          );
        }

        // Remove from general product list if exists
        if (state.list) {
          state.list = state.list.filter((p) => p._id !== action.payload);
        }
      })

      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
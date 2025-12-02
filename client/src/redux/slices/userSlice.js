import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import * as api from "../api/userApi";

export const fetchCurrentAuthUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.CurrentAuthUser(token);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Auth check failed"
      );
    }
  }
);


const userSlice = createSlice({
    name:"AuthUser",

    initialState:{
        users:[],
        viewingUser:null,
        currentAuthUser:null,
        loading:false,

        error:null
    },

    extraReducers:(builder) =>{
        builder
        // Auth check
        .addCase(fetchCurrentAuthUser.pending,(state)=>{
            state.loading = true,
            state.error = null
        })
        .addCase(fetchCurrentAuthUser.fulfilled,(state, action)=>{
            state.currentAuthUser = action.payload
        })
        .addCase(fetchCurrentAuthUser.rejected,(state, action)=>{
            state.error = action.payload
            state.loading = false
        })
    }
})

export default userSlice.reducer
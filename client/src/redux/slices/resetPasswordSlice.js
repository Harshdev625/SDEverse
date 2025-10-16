import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Send reset email
export const sendResetEmail = createAsyncThunk(
  "resetPassword/sendResetEmail",
  async (email, { rejectWithValue }) => {
    try {
      // Use full backend URL
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Something went wrong");
    }
  }
);

// ✅ Reset password
export const resetPassword = createAsyncThunk(
  "resetPassword/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Something went wrong");
    }
  }
);

const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: null,
  },
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // sendResetEmail
      .addCase(sendResetEmail.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(sendResetEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(sendResetEmail.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      // resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { clearState } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;

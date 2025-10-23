import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUserAPI, registerUserAPI, getMeAPI, forgotPasswordAPI, validateOTPAPI, resetPasswordAPI} from "./authAPI";

const tokenFromStorage = localStorage.getItem("token");

const initialState = {
  user: null,
  token: tokenFromStorage || null,
  loading: false,
  error: null,
  resetSuccess: false,
  otpSent: false,
  otpValidated: false,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const data = await registerUserAPI(userData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const data = await loginUserAPI(userData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const getMe = createAsyncThunk("auth/getMe", async (token, thunkAPI) => {
  try {
    const data = await getMeAPI(token);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Get user failed"
    );
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData, thunkAPI) => {
    try {
      const data = await forgotPasswordAPI(emailData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Forgot password request failed"
      );
    }
  }
);

export const validateOTP = createAsyncThunk(
  "auth/validateOTP",
  async (otpData, thunkAPI) => {
    try {
      const data = await validateOTPAPI(otpData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Invalid or expired OTP"
      );
    }
  }
);  

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, thunkAPI) => {
    try {
      const data = await resetPasswordAPI(resetData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);  

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.resetSuccess = false;
      state.otpSent = false;
      state.otpValidated = false;
      localStorage.removeItem("token");
    },
    clearResetSuccess: (state) => {
      state.resetSuccess = false;
      state.otpSent = false;
      state.otpValidated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          _id: action.payload._id,
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
        };
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          _id: action.payload._id,
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
        };
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = {
          _id: action.payload._id,
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
        };
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpSent = false;
        state.otpValidated = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.otpSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpSent = false;
      })
      .addCase(validateOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpValidated = false;
      })
      .addCase(validateOTP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.otpValidated = true;
      })
      .addCase(validateOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpValidated = false;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.resetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.resetSuccess = false;
      });
  },
});
export const selectCurrentUser = (state) => state.auth.user;

export const { logout, clearResetSuccess } = authSlice.actions;
export default authSlice.reducer;

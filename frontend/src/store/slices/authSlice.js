import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// Login Action

const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const response = await axiosInstance.post("/auth/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    toast.success(response.data.message || "Login successful");
    return response.data.user;
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
    return thunkAPI.rejectWithValue(
      error.response?.data.message || "Login failed"
    );
  }
});

// Forgot password action

const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/auth/password/forgot",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(response.data.message || "Password reset link sent");
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Failed to send reset link"
      );
    }
  }
);

// Reset password action

const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/auth/password/reset/${token}`,
        { token, password, confirmPassword },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(response.data.message || "Password reset successful");
      return response.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Failed to reset password"
      );
    }
  }
);

// Get user action

const getUser = createAsyncThunk("auth/getUser", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/auth/me`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data.message || "Failed to fetch user"
    );
  }
});

// logout action

const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.put(
      `/auth/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    toast.success(response.data.message || "Logout successful");
    return null;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to logout");
    return thunkAPI.rejectWithValue(
      error.response?.data.message || "Failed to logout"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
  },
  extraReducers: (builder) => {
    // Login reducers
    builder
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      });

    // getUser reducers
    builder
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
        state.authUser = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      });

    // logout reducers
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.authUser;
      });

    // forgotPassword reducers
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      });

    // resetPassword reducers
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      });
  },
});

export default authSlice.reducer;
export { login, forgotPassword, resetPassword, getUser, logout };

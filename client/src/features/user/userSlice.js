import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllUsers,
  fetchUserById,
  fetchUserByUsername,
  deleteUserById,
  updateUserRole,
  fetchMyProfile,
  updateMyProfile,
  updateSocialProfiles,
  updateCompetitiveStats,
  updateSingleSocialStat,
  updateSingleCompetitiveStat,
  fetchAdminAnalytics,
} from "./userAPI";

const initialState = {
  users: [],
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  selectedUser: null,
  myProfile: null,
  extraCompetitiveStats: null,
  adminAnalytics: null,
  status: {
    fetchUsers: "idle",
    fetchProfile: "idle",
    updateProfile: "idle",
    updateSocialStats: "idle",
    updateCompetitiveStats: "idle",
    updateSingleSocialStat: "idle",
    updateSingleCompetitiveStat: "idle",
    fetchAdminAnalytics: "idle",
  },
  error: {
    fetchUsers: null,
    fetchProfile: null,
    updateProfile: null,
    updateSocialStats: null,
    updateCompetitiveStats: null,
    fetchSelectedUser: null,
    updateSingleSocialStat: null,
    updateSingleCompetitiveStat: null,
    fetchAdminAnalytics: null,
  },
};

const safeReject = (error) =>
  error.response?.data?.message || error.message || "Unknown error";

export const getAdminAnalytics = createAsyncThunk(
  "user/getAdminAnalytics",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await fetchAdminAnalytics(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAll",
  async (params = {}, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;

    const finalParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      ...(params.role ? { role: params.role } : {}),
    };

    try {
      return await fetchAllUsers(token, finalParams);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const getUserById = createAsyncThunk(
  "user/getById",
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await fetchUserById(id, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const getUserByUsername = createAsyncThunk(
  "user/getByUsername",
  async (username, thunkAPI) => {
    try {
      return await fetchUserByUsername(username);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const removeUser = createAsyncThunk(
  "user/delete",
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      await deleteUserById(id, token);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const changeUserRole = createAsyncThunk(
  "user/updateRole",
  async ({ id, role }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateUserRole(id, role, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const getMyProfile = createAsyncThunk(
  "user/getMyProfile",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await fetchMyProfile(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const patchMyProfile = createAsyncThunk(
  "user/patchMyProfile",
  async (profileData, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateMyProfile(profileData, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const refreshSocialStats = createAsyncThunk(
  "user/refreshSocialStats",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateSocialProfiles(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const refreshCompetitiveStats = createAsyncThunk(
  "user/refreshCompetitiveStats",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateCompetitiveStats(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const refreshSingleSocialStat = createAsyncThunk(
  "user/refreshSingleSocialStat",
  async (platform, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateSingleSocialStat(platform, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const refreshSingleCompetitiveStat = createAsyncThunk(
  "user/refreshSingleCompetitiveStat",
  async (platform, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateSingleCompetitiveStat(platform, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearMyProfile: (state) => {
      state.myProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.status.fetchUsers = "loading";
        state.error.fetchUsers = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.status.fetchUsers = "succeeded";
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.status.fetchUsers = "failed";
        state.error.fetchUsers = action.payload;
      })

      .addCase(getUserById.pending, (state) => {
        state.status.fetchSelectedUser = "loading";
        state.error.fetchSelectedUser = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.status.fetchSelectedUser = "succeeded";
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.status.fetchSelectedUser = "failed";
        state.error.fetchSelectedUser = action.payload;
      })

      .addCase(getUserByUsername.pending, (state) => {
        state.status.fetchSelectedUser = "loading";
        state.error.fetchSelectedUser = null;
      })
      .addCase(getUserByUsername.fulfilled, (state, action) => {
        state.status.fetchSelectedUser = "succeeded";
        state.selectedUser = action.payload;
      })
      .addCase(getUserByUsername.rejected, (state, action) => {
        state.status.fetchSelectedUser = "failed";
        state.error.fetchSelectedUser = action.payload;
      })

      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      })

      .addCase(changeUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.meta.arg.id
        );
        if (index !== -1) {
          state.users[index].role = action.meta.arg.role;
        }
      })

      .addCase(getMyProfile.pending, (state) => {
        state.status.fetchProfile = "loading";
        state.error.fetchProfile = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.status.fetchProfile = "succeeded";
        state.myProfile = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.status.fetchProfile = "failed";
        state.error.fetchProfile = action.payload;
      })

      .addCase(patchMyProfile.pending, (state) => {
        state.status.updateProfile = "loading";
        state.error.updateProfile = null;
      })
      .addCase(patchMyProfile.fulfilled, (state, action) => {
        state.status.updateProfile = "succeeded";
        state.myProfile = {
          ...state.myProfile,
          ...action.payload,
        };
      })
      .addCase(patchMyProfile.rejected, (state, action) => {
        state.status.updateProfile = "failed";
        state.error.updateProfile = action.payload;
      })

      .addCase(refreshSocialStats.pending, (state) => {
        state.status.updateSocialStats = "loading";
        state.error.updateSocialStats = null;
      })
      .addCase(refreshSocialStats.fulfilled, (state, action) => {
        state.status.updateSocialStats = "succeeded";
        if (state.myProfile) {
          // Update social stats
          state.myProfile.socialStats = {
            ...state.myProfile.socialStats,
            ...action.payload.socialStats,
          };
        }
      })
      .addCase(refreshSocialStats.rejected, (state, action) => {
        state.status.updateSocialStats = "failed";
        state.error.updateSocialStats = action.payload;
      })

      .addCase(refreshCompetitiveStats.pending, (state) => {
        state.status.updateCompetitiveStats = "loading";
        state.error.updateCompetitiveStats = null;
      })
      .addCase(refreshCompetitiveStats.fulfilled, (state, action) => {
        state.status.updateCompetitiveStats = "succeeded";
        if (state.myProfile) {
          // Update competitive stats
          state.myProfile.competitiveStats = {
            ...state.myProfile.competitiveStats,
            ...action.payload.competitiveStats,
          };

          // Update extraCompetitiveStats
          state.myProfile.extraCompetitiveStats = {
            ...state.myProfile.extraCompetitiveStats,
            ...action.payload.extraStats,
          };
        }
      })
      .addCase(refreshCompetitiveStats.rejected, (state, action) => {
        state.status.updateCompetitiveStats = "failed";
        state.error.updateCompetitiveStats = action.payload;
      })
      // Single social stat update
      .addCase(refreshSingleSocialStat.pending, (state) => {
        state.status.updateSingleSocialStat = "loading";
        state.error.updateSingleSocialStat = null;
      })
      .addCase(refreshSingleSocialStat.fulfilled, (state, action) => {
        state.status.updateSingleSocialStat = "succeeded";
        if (state.myProfile) {
          // 1. Update entire socialStats object
          state.myProfile.socialStats = action.payload.socialStats;

          // 2. Merge new extraSocialStats for this platform
          state.myProfile.extraSocialStats = {
            ...(state.myProfile.extraSocialStats || {}),
            ...action.payload.extraSocialStats,
          };
        }
      })
      .addCase(refreshSingleSocialStat.rejected, (state, action) => {
        state.status.updateSingleSocialStat = "failed";
        state.error.updateSingleSocialStat = action.payload;
      })

      // Single competitive stat update
      .addCase(refreshSingleCompetitiveStat.pending, (state) => {
        state.status.updateSingleCompetitiveStat = "loading";
        state.error.updateSingleCompetitiveStat = null;
      })
      .addCase(refreshSingleCompetitiveStat.fulfilled, (state, action) => {
        state.status.updateSingleCompetitiveStat = "succeeded";
        if (state.myProfile) {
          state.myProfile.competitiveStats = action.payload.competitiveStats;
          state.myProfile.extraCompetitiveStats = {
            ...(state.myProfile.extraCompetitiveStats || {}),
            ...action.payload.extraStats,
          };
        }
      })

      .addCase(refreshSingleCompetitiveStat.rejected, (state, action) => {
        state.status.updateSingleCompetitiveStat = "failed";
        state.error.updateSingleCompetitiveStat = action.payload;
      })
      .addCase(getAdminAnalytics.pending, (state) => {
        state.status.fetchAdminAnalytics = "loading";
        state.error.fetchAdminAnalytics = null;
      })
      .addCase(getAdminAnalytics.fulfilled, (state, action) => {
        state.status.fetchAdminAnalytics = "succeeded";
        state.adminAnalytics = action.payload;
      })
      .addCase(getAdminAnalytics.rejected, (state, action) => {
        state.status.fetchAdminAnalytics = "failed";
        state.error.fetchAdminAnalytics = action.payload;
      });
  },
});

export const { clearSelectedUser, clearMyProfile } = userSlice.actions;
export default userSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAlgorithm,
  getAllAlgorithms,
  getAlgorithmsForList,
  getAlgorithmBySlug,
  updateAlgorithm,
  deleteAlgorithm,
  voteAlgorithm,
  getCategories,
  searchAlgorithms,
} from "./algorithmAPI";

const initialState = {
  algorithms: [],
  algorithm: null,
  categories: [],
  total: 0,
  pages: 0,
  currentPage: 1,
  loading: false,
  voteLoading: false,
  error: null,
  filters: {
    difficulty: "",
    category: "",
  },
  isSearchingActive: false,
};

const getUser = (getState) => getState().auth?.user;

export const createNewAlgorithm = createAsyncThunk(
  "algorithm/createNewAlgorithm",
  async (algorithmData, { getState, rejectWithValue }) => {
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("You are not authorized to create algorithms.");
    }

    try {
      return await createAlgorithm(algorithmData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchAlgorithms = createAsyncThunk(
  "algorithm/fetchAlgorithms",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {};

      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.category) params.category = filters.category;
      if (filters.page) params.page = filters.page; // existing pagination support

      // existing helper function already calls axios.get('/api/algorithms', { params })
      return await getAllAlgorithms(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchAlgorithmsForList = createAsyncThunk(
  "algorithm/fetchAlgorithmsForList",
  async (params, { rejectWithValue }) => {
    try {
      return await getAlgorithmsForList(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

export const fetchAlgorithmBySlug = createAsyncThunk(
  "algorithm/fetchAlgorithmBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      return await getAlgorithmBySlug(slug);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateExistingAlgorithm = createAsyncThunk(
  "algorithm/updateExistingAlgorithm",
  async ({ slug, algorithmData }, { getState, rejectWithValue }) => {
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("You are not authorized to update algorithms.");
    }

    try {
      return await updateAlgorithm(slug, algorithmData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteExistingAlgorithm = createAsyncThunk(
  "algorithm/deleteExistingAlgorithm",
  async (slug, { getState, rejectWithValue }) => {
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("Only admins can delete algorithms.");
    }

    try {
      await deleteAlgorithm(slug);
      return slug;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const voteOnAlgorithm = createAsyncThunk(
  "algorithm/voteOnAlgorithm",
  async ({ slug, voteData }, { rejectWithValue }) => {
    try {
      return await voteAlgorithm(slug, voteData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "algorithm/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategories();
      return response.categories;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const searchAllAlgorithms = createAsyncThunk(
  "algorithm/searchAllAlgorithms",
  async (params, { rejectWithValue }) => {
    try {
      return await searchAlgorithms(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const algorithmSlice = createSlice({
  name: "algorithm",
  initialState,
  reducers: {
    resetAlgorithmState: (state) => {
      state.loading = false;
      state.voteLoading = false;
      state.error = null;
    },
    clearAlgorithm: (state) => {
      state.algorithm = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { difficulty: "", category: "" };
    },
    setIsSearchingActive: (state, action) => {
      state.isSearchingActive = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchAlgorithms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlgorithms.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms = action.payload.algorithms;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAlgorithms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAlgorithmsForList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlgorithmsForList.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms = action.payload.algorithms;
        state.total = action.payload.total;
      })
      .addCase(fetchAlgorithmsForList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAlgorithmBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlgorithmBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithm = action.payload;
      })
      .addCase(fetchAlgorithmBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createNewAlgorithm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms.unshift(action.payload);
      })
      .addCase(createNewAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateExistingAlgorithm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.algorithms.findIndex(
          (a) => a.slug === action.payload.slug
        );
        if (index !== -1) state.algorithms[index] = action.payload;
        if (state.algorithm?.slug === action.payload.slug) {
          state.algorithm = action.payload;
        }
      })
      .addCase(updateExistingAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteExistingAlgorithm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms = state.algorithms.filter(
          (a) => a.slug !== action.payload
        );
      })
      .addCase(deleteExistingAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(voteOnAlgorithm.pending, (state) => {
        state.voteLoading = true;
        state.error = null;
      })
      .addCase(voteOnAlgorithm.fulfilled, (state, action) => {
        state.voteLoading = false;
        const updated = action.payload.algorithm;
        const index = state.algorithms.findIndex(
          (a) => a.slug === updated.slug
        );
        if (index !== -1) state.algorithms[index] = updated;
        if (state.algorithm?.slug === updated.slug) state.algorithm = updated;
      })
      .addCase(voteOnAlgorithm.rejected, (state, action) => {
        state.voteLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchAllAlgorithms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAllAlgorithms.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms = action.payload.algorithms;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(searchAllAlgorithms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAlgorithmState, clearAlgorithm, setFilters, clearFilters, setIsSearchingActive } =
  algorithmSlice.actions;
export default algorithmSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createDataStructure,
  getAllDataStructures,
  getAllDataStructuresForList,
  getDataStructureBySlug,
  updateDataStructure,
  deleteDataStructure,
  voteDataStructure,
  getDataStructureCategories,
  searchDataStructures,
  addOperationImplementation,
  getDataStructureContributors,
} from "./dataStructureAPI";

const initialState = {
  dataStructures: [],
  dataStructure: null,
  categories: [],
  contributors: [],
  total: 0,
  pages: 0,
  currentPage: 1,

  allDataStructuresLoading: false,
  singleDataStructureLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  voteLoading: false,
  categoriesLoading: false,
  addOperationImplLoading: false,
  contributorsLoading: false,

  error: null,
  isSearchingActive: false,
};

const getUserRole = (getState) => getState().auth?.user?.role;

export const createNewDataStructure = createAsyncThunk(
  "dataStructure/createNewDataStructure",
  async (dataStructureData, { getState, rejectWithValue }) => {
    if (getUserRole(getState) !== "admin") {
      return rejectWithValue(
        "You are not authorized to create data structures."
      );
    }
    try {
      return await createDataStructure(dataStructureData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDataStructures = createAsyncThunk(
  "dataStructure/fetchDataStructures",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllDataStructures(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchAllDataStructuresForList = createAsyncThunk(
  "dataStructure/fetchAllDataStructuresForList",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllDataStructuresForList(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDataStructureBySlug = createAsyncThunk(
  "dataStructure/fetchDataStructureBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      return await getDataStructureBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateExistingDataStructure = createAsyncThunk(
  "dataStructure/updateExistingDataStructure",
  async ({ slug, dataStructureData }, { getState, rejectWithValue }) => {
    if (getUserRole(getState) !== "admin") {
      return rejectWithValue(
        "You are not authorized to update data structures."
      );
    }
    try {
      return await updateDataStructure(slug, dataStructureData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteExistingDataStructure = createAsyncThunk(
  "dataStructure/deleteExistingDataStructure",
  async (slug, { getState, rejectWithValue }) => {
    if (getUserRole(getState) !== "admin") {
      return rejectWithValue("Only admins can delete data structures.");
    }
    try {
      await deleteDataStructure(slug);
      return slug;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const voteOnDataStructure = createAsyncThunk(
  "dataStructure/voteOnDataStructure",
  async ({ slug, voteData }, { rejectWithValue }) => {
    try {
      return await voteDataStructure(slug, voteData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDataStructureCategories = createAsyncThunk(
  "dataStructure/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDataStructureCategories();
      return response.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const searchAllDataStructures = createAsyncThunk(
  "dataStructure/searchAllDataStructures",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await searchDataStructures(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addNewOperationImplementation = createAsyncThunk(
  "dataStructure/addOperationImplementation",
  async ({ slug, implementationData }, { rejectWithValue }) => {
    try {
      return await addOperationImplementation(slug, implementationData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDataStructureContributors = createAsyncThunk(
  "dataStructure/fetchContributors",
  async (slug, { rejectWithValue }) => {
    try {
      return await getDataStructureContributors(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const dataStructureSlice = createSlice({
  name: "dataStructure",
  initialState,
  reducers: {
    resetDataStructureState: (state) => {
      state.allDataStructuresLoading = false;
      state.singleDataStructureLoading = false;
      state.createLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.voteLoading = false;
      state.categoriesLoading = false;
      state.addOperationImplLoading = false;
      state.contributorsLoading = false;
      state.error = null;
    },
    clearDataStructure: (state) => {
      state.dataStructure = null;
    },
    clearFilters: (state) => {
      state.isSearchingActive = false;
      state.dataStructures = [];
      state.total = 0;
      state.pages = 0;
      state.currentPage = 1;
    },
    setIsSearchingActive: (state, action) => {
      state.isSearchingActive = action.payload;
    },
    updateDataStructureInState: (state, action) => {
      const updatedDs = action.payload;
      const index = state.dataStructures.findIndex(
        (ds) => ds.slug === updatedDs.slug
      );
      if (index !== -1) {
        state.dataStructures[index] = updatedDs;
      }
      if (state.dataStructure?.slug === updatedDs.slug) {
        state.dataStructure = updatedDs;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataStructures.pending, (state) => {
        state.allDataStructuresLoading = true;
        state.error = null;
      })
      .addCase(fetchDataStructures.fulfilled, (state, action) => {
        state.allDataStructuresLoading = false;
        state.dataStructures = action.payload.dataStructures;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchDataStructures.rejected, (state, action) => {
        state.allDataStructuresLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllDataStructuresForList.pending, (state) => {
        state.allDataStructuresLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDataStructuresForList.fulfilled, (state, action) => {
        state.allDataStructuresLoading = false;
        state.dataStructures = action.payload.dataStructures;
        state.total = action.payload.total;
        state.pages = 1;
        state.currentPage = 1;
      })
      .addCase(fetchAllDataStructuresForList.rejected, (state, action) => {
        state.allDataStructuresLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDataStructureBySlug.pending, (state) => {
        state.singleDataStructureLoading = true;
        state.error = null;
      })
      .addCase(fetchDataStructureBySlug.fulfilled, (state, action) => {
        state.singleDataStructureLoading = false;
        state.dataStructure = action.payload;
      })
      .addCase(fetchDataStructureBySlug.rejected, (state, action) => {
        state.singleDataStructureLoading = false;
        state.error = action.payload;
      })
      .addCase(createNewDataStructure.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createNewDataStructure.fulfilled, (state, action) => {
        state.createLoading = false;
        state.dataStructures.unshift(action.payload);
        state.total++;
      })
      .addCase(createNewDataStructure.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      .addCase(updateExistingDataStructure.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateExistingDataStructure.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedDs = action.payload;
        const index = state.dataStructures.findIndex(
          (ds) => ds.slug === updatedDs.slug
        );
        if (index !== -1) state.dataStructures[index] = updatedDs;
        if (state.dataStructure?.slug === updatedDs.slug) {
          state.dataStructure = updatedDs;
        }
      })
      .addCase(updateExistingDataStructure.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteExistingDataStructure.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteExistingDataStructure.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.dataStructures = state.dataStructures.filter(
          (ds) => ds.slug !== action.payload
        );
        state.total--;
        if (state.dataStructure?.slug === action.payload) {
          state.dataStructure = null;
        }
      })
      .addCase(deleteExistingDataStructure.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      .addCase(voteOnDataStructure.pending, (state) => {
        state.voteLoading = true;
        state.error = null;
      })
      .addCase(voteOnDataStructure.fulfilled, (state, action) => {
        state.voteLoading = false;
        const updated = action.payload.dataStructure;
        const index = state.dataStructures.findIndex(
          (ds) => ds.slug === updated.slug
        );
        if (index !== -1) state.dataStructures[index] = updated;
        if (state.dataStructure?.slug === updated.slug) {
          state.dataStructure = updated;
        }
      })
      .addCase(voteOnDataStructure.rejected, (state, action) => {
        state.voteLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDataStructureCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchDataStructureCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchDataStructureCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      })
      .addCase(searchAllDataStructures.pending, (state) => {
        state.allDataStructuresLoading = true;
        state.error = null;
      })
      .addCase(searchAllDataStructures.fulfilled, (state, action) => {
        state.allDataStructuresLoading = false;
        state.dataStructures = action.payload.results || [];
        state.total = action.payload.total || 0;
        state.pages = action.payload.pages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(searchAllDataStructures.rejected, (state, action) => {
        state.allDataStructuresLoading = false;
        state.error = action.payload;
      })
      .addCase(addNewOperationImplementation.pending, (state) => {
        state.addOperationImplLoading = true;
        state.error = null;
      })
      .addCase(addNewOperationImplementation.fulfilled, (state, action) => {
        state.addOperationImplLoading = false;
        const updatedDs = action.payload;
        if (state.dataStructure?.slug === updatedDs.slug) {
          state.dataStructure = updatedDs;
        }
        const index = state.dataStructures.findIndex(
          (ds) => ds.slug === updatedDs.slug
        );
        if (index !== -1) {
          state.dataStructures[index] = updatedDs;
        }
      })
      .addCase(addNewOperationImplementation.rejected, (state, action) => {
        state.addOperationImplLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDataStructureContributors.pending, (state) => {
        state.contributorsLoading = true;
        state.error = null;
      })
      .addCase(fetchDataStructureContributors.fulfilled, (state, action) => {
        state.contributorsLoading = false;
        state.contributors = action.payload;
      })
      .addCase(fetchDataStructureContributors.rejected, (state, action) => {
        state.contributorsLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetDataStructureState,
  clearDataStructure,
  updateDataStructureInState,
  setIsSearchingActive,
  clearFilters
} = dataStructureSlice.actions;
export default dataStructureSlice.reducer;

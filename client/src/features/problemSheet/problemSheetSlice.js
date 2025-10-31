import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as problemSheetAPI from './problemSheetAPI';

// Async thunks
export const fetchAllSheets = createAsyncThunk(
  'problemSheets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await problemSheetAPI.getAllSheets();
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch sheets');
    }
  }
);

export const createSheet = createAsyncThunk(
  'problemSheets/create',
  async (sheetData, { rejectWithValue }) => {
    try {
      return await problemSheetAPI.createProblemSheet(sheetData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create sheet');
    }
  }
);

export const updateSheet = createAsyncThunk(
  'problemSheets/update',
  async ({ slug, sheetData }, { rejectWithValue }) => {
    try {
      return await problemSheetAPI.updateProblemSheet(slug, sheetData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update sheet');
    }
  }
);

export const deleteSheet = createAsyncThunk(
  'problemSheets/delete',
  async (slug, { rejectWithValue }) => {
    try {
      await problemSheetAPI.deleteProblemSheet(slug);
      return slug;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete sheet');
    }
  }
);

// Problem management thunks
export const createProblem = createAsyncThunk(
  'problemSheets/problems/create',
  async ({ sheetId, problemData }, { rejectWithValue }) => {
    try {
      return await problemSheetAPI.createProblem(sheetId, problemData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create problem');
    }
  }
);

export const updateProblem = createAsyncThunk(
  'problemSheets/problems/update',
  async ({ problemId, problemData }, { rejectWithValue }) => {
    try {
      return await problemSheetAPI.updateProblem(problemId, problemData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update problem');
    }
  }
);

export const deleteProblem = createAsyncThunk(
  'problemSheets/problems/delete',
  async (problemId, { rejectWithValue }) => {
    try {
      await problemSheetAPI.deleteProblem(problemId);
      return problemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete problem');
    }
  }
);

const problemSheetSlice = createSlice({
  name: 'problemSheets',
  initialState: {
    sheets: [],
    currentSheet: null,
    problems: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSheet: (state, action) => {
      state.currentSheet = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sheets
      .addCase(fetchAllSheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSheets.fulfilled, (state, action) => {
        state.loading = false;
        state.sheets = action.payload;
      })
      .addCase(fetchAllSheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create sheet
      .addCase(createSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.sheets.push(action.payload);
      })
      .addCase(createSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update sheet
      .addCase(updateSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSheet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sheets.findIndex(sheet => sheet.slug === action.payload.slug);
        if (index !== -1) {
          state.sheets[index] = action.payload;
        }
      })
      .addCase(updateSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete sheet
      .addCase(deleteSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.sheets = state.sheets.filter(sheet => sheet.slug !== action.payload);
      })
      .addCase(deleteSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Problems management
      .addCase(createProblem.fulfilled, (state, action) => {
        state.problems.push(action.payload);
      })
      .addCase(updateProblem.fulfilled, (state, action) => {
        const index = state.problems.findIndex(prob => prob._id === action.payload._id);
        if (index !== -1) {
          state.problems[index] = action.payload;
        }
      })
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.problems = state.problems.filter(prob => prob._id !== action.payload);
      });
  },
});

export const { clearError, setCurrentSheet } = problemSheetSlice.actions;
export default problemSheetSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as problemSheetAPI from './problemSheetAPI';

// Async thunks for fetching data
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

export const fetchSheetById = createAsyncThunk(
  'problemSheets/fetchSheetById',
  async (sheetId, { rejectWithValue }) => {
    try {
      return await problemSheetAPI.getSheetById(sheetId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch sheet');
    }
  }
);

export const fetchSheetProblems = createAsyncThunk(
  'problemSheets/fetchSheetProblems',
  async ({ sheetId, params }, { rejectWithValue }) => {
    try {
      const res = await problemSheetAPI.getSheetProblems(sheetId, params);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch problems');
    }
  }
);

export const fetchSheetMetrics = createAsyncThunk(
  'problemSheets/fetchSheetMetrics',
  async ({ sheetId, params }, { rejectWithValue }) => {
    try {
      return await problemSheetAPI.getSheetMetrics(sheetId, params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch metrics');
    }
  }
);

export const toggleProblemComplete = createAsyncThunk(
  'problemSheets/toggleProblemComplete',
  async ({ problemId, completed }, { rejectWithValue }) => {
    try {
      return await problemSheetAPI.markProblemComplete(problemId, completed);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update problem');
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

// Sheet management thunks
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

const problemSheetSlice = createSlice({
  name: 'problemSheets',
  initialState: {
    sheets: [],
    currentSheet: null,
    problems: [],
    metrics: null,
    pagination: null,
    loading: false,
    sheetLoading: false,
    problemsLoading: false,
    metricsLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSheet: (state, action) => {
      state.currentSheet = action.payload;
    },
    setProblems: (state, action) => {
      state.problems = action.payload;
    },
    clearCurrentSheet: (state) => {
      state.currentSheet = null;
      state.problems = [];
      state.metrics = null;
      state.pagination = null;
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

      // Fetch sheet by ID
      .addCase(fetchSheetById.pending, (state) => {
        state.sheetLoading = true;
        state.error = null;
      })
      .addCase(fetchSheetById.fulfilled, (state, action) => {
        state.sheetLoading = false;
        state.currentSheet = action.payload;
      })
      .addCase(fetchSheetById.rejected, (state, action) => {
        state.sheetLoading = false;
        state.error = action.payload;
      })

      // Fetch sheet problems
      .addCase(fetchSheetProblems.pending, (state) => {
        state.problemsLoading = true;
        state.error = null;
      })
      .addCase(fetchSheetProblems.fulfilled, (state, action) => {
        state.problemsLoading = false;
        state.problems = action.payload.problems || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchSheetProblems.rejected, (state, action) => {
        state.problemsLoading = false;
        state.error = action.payload;
      })

      // Fetch sheet metrics
      .addCase(fetchSheetMetrics.pending, (state) => {
        state.metricsLoading = true;
        state.error = null;
      })
      .addCase(fetchSheetMetrics.fulfilled, (state, action) => {
        state.metricsLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchSheetMetrics.rejected, (state, action) => {
        state.metricsLoading = false;
        state.error = action.payload;
      })

      // Toggle problem complete
      .addCase(toggleProblemComplete.fulfilled, (state, action) => {
        const problem = state.problems.find(p => p._id === action.payload._id);
        if (problem) {
          problem.completed = action.payload.completed;
        }
      })
      .addCase(toggleProblemComplete.rejected, (state, action) => {
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

      // Create problem
      .addCase(createProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.problems.push(action.payload);
      })
      .addCase(createProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update problem
      .addCase(updateProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProblem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.problems.findIndex(prob => prob._id === action.payload._id);
        if (index !== -1) {
          state.problems[index] = action.payload;
        }
      })
      .addCase(updateProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete problem
      .addCase(deleteProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = state.problems.filter(prob => prob._id !== action.payload);
      })
      .addCase(deleteProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentSheet, setProblems, clearCurrentSheet } = problemSheetSlice.actions;
export default problemSheetSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './problemSheetAPI';

const initialState = {
    sheets: [],
    currentSheet: null,
    problems: [],
    metrics: null,
    pagination: null,
    sheetsLoading: false,
    sheetLoading: false,
    problemsLoading: false,
    metricsLoading: false,
    error: null,
};

// Async thunks
export const fetchAllSheets = createAsyncThunk(
    'problemSheet/fetchAllSheets',
    async (_, { rejectWithValue }) => {
        try {
            const data = await api.getAllSheets();
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchSheetById = createAsyncThunk(
    'problemSheet/fetchSheetById',
    async (sheetId, { rejectWithValue }) => {
        try {
            const data = await api.getSheetById(sheetId);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchSheetProblems = createAsyncThunk(
    'problemSheet/fetchSheetProblems',
    async ({ sheetId, params }, { rejectWithValue }) => {
        try {
            const data = await api.getSheetProblems(sheetId, params);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchSheetMetrics = createAsyncThunk(
    'problemSheet/fetchSheetMetrics',
    async ({ sheetId, params }, { rejectWithValue }) => {
        try {
            const data = await api.getSheetMetrics(sheetId, params);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const toggleProblemComplete = createAsyncThunk(
    'problemSheet/toggleProblemComplete',
    async ({ problemId, completed }, { rejectWithValue }) => {
        try {
            const data = await api.markProblemComplete(problemId, completed);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Slice
const problemSheetSlice = createSlice({
    name: 'problemSheet',
    initialState,
    reducers: {
        clearCurrentSheet(state) {
            state.currentSheet = null;
            state.problems = [];
            state.metrics = null;
            state.pagination = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchAllSheets
            .addCase(fetchAllSheets.pending, (state) => {
                state.sheetsLoading = true;
                state.error = null;
            })
            .addCase(fetchAllSheets.fulfilled, (state, action) => {
                state.sheetsLoading = false;
                state.sheets = action.payload;
            })
            .addCase(fetchAllSheets.rejected, (state, action) => {
                state.sheetsLoading = false;
                state.error = action.payload;
            })
            // fetchSheetById
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
            // fetchSheetProblems
            .addCase(fetchSheetProblems.pending, (state) => {
                state.problemsLoading = true;
                state.error = null;
            })
            .addCase(fetchSheetProblems.fulfilled, (state, action) => {
                state.problemsLoading = false;
                state.problems = action.payload.problems;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchSheetProblems.rejected, (state, action) => {
                state.problemsLoading = false;
                state.error = action.payload;
            })
            // fetchSheetMetrics
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
            // toggleProblemComplete
            .addCase(toggleProblemComplete.fulfilled, (state, action) => {
                const problem = state.problems.find(p => p._id === action.payload.data.problemId);
                if (problem) {
                    problem.completed = action.payload.data.completed;
                }
            });
    },
});

export const { clearCurrentSheet, updateProblemInList } = problemSheetSlice.actions;

export default problemSheetSlice.reducer;
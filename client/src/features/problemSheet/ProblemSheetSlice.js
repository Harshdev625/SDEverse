import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from  './problemSheetAPI';

const initialState = {
    sheets: [],
    currentSheet: null,
    currentSuite: null,
    problems: [],
    metrics: null,
    paginsation: null,
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
        } catch (err){
            return rejectWithValue(err.response?.data?.message || err.message);                     
        } 
    }
);

export const fetchSuiteProblems = createAsyncThunk(
    'problemSheet/fetchSuiteProblems',
    async ({ sheetId, suiteId, params }, { rejectWithValue }) => {
        try {
            const data = await api.getSuiteProblems(sheetId, suiteId, params);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchSuiteMetrics = createAsyncThunk(
    'problemSheet/fetchSuiteMetrics',
    async ({ sheetId, suiteId, params }, { rejectWithValue }) => {
        try {
            const data = await api.getSuiteMetrics(sheetId, suiteId, params);
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
            state.currentSuite = null;
            state.problems = [];
            state.metrics = null;
            state.pagination = null;
        },      
        updateProblemList: (state, action) => {
            const updatedProblem = action.payload;
            const index = state.problems.findIndex(problem => problem.id === updatedProblem.id);
            if (index !== -1) {
                state.problems[index] = {...state.problems[index], ...updatedProblem };
            }
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
            // fetchSuiteProblems
            .addCase(fetchSuiteProblems.pending, (state) => {
                state.problemsLoading = true;
                state.error = null;
            })
            .addCase(fetchSuiteProblems.fulfilled, (state, action) => {
                state.problemsLoading = false;
                state.problems = action.payload.problems;
                state.pagination = action.payload.pagination;
                state.currentSuite = {
                    id: action.meta.arg.suiteId,
                    name: action.payload.suiteName,
                };
            })
            .addCase(fetchSuiteProblems.rejected, (state, action) => {
                state.problemsLoading = false;
                state.error = action.payload;
            })
            // fetchSuiteMetrics
            .addCase(fetchSuiteMetrics.pending, (state) => {
                state.metricsLoading = true;
                state.error = null;
            })
            .addCase(fetchSuiteMetrics.fulfilled, (state, action) => {
                state.metricsLoading = false;
                state.metrics = action.payload;
            })
            .addCase(fetchSuiteMetrics.rejected, (state, action) => {
                state.metricsLoading = false;
                state.error = action.payload;
            })
            // toggleProblemComplete
            .addCase(toggleProblemComplete.fulfilled, (state, action) => {
                const problem = state.problems.find(p => p.id === action.payload.data.problemId);
                if (problem) {
                    problem.completed = action.payload.data.completed;
                }
            });
    },
});

export const { clearCurrentSheet, updateProblemList } = problemSheetSlice.actions;

export default problemSheetSlice.reducer;   
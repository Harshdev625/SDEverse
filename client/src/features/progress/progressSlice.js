import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyProgressAPI, incrementProgressAPI, setProgressAPI } from "./progressAPI";

const initialState = {
  bySheet: {}, // sheetId -> { solvedCount }
  loading: false,
  error: null,
};

export const fetchMyProgress = createAsyncThunk(
  "progress/fetchMy",
  async (sheetId, { rejectWithValue }) => {
    try {
      return { sheetId, data: await getMyProgressAPI(sheetId) };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const incrementMyProgress = createAsyncThunk(
  "progress/increment",
  async (sheetId, { rejectWithValue }) => {
    try {
      return { sheetId, data: await incrementProgressAPI(sheetId) };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const setMyProgress = createAsyncThunk(
  "progress/set",
  async ({ sheetId, solvedCount }, { rejectWithValue }) => {
    try {
      return { sheetId, data: await setProgressAPI(sheetId, solvedCount) };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const slice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    clearProgressError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProgress.pending, (state) => { state.loading = true; })
      .addCase(fetchMyProgress.fulfilled, (state, action) => {
        state.loading = false; state.bySheet[action.payload.sheetId] = action.payload.data;
      })
      .addCase(fetchMyProgress.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(incrementMyProgress.pending, (state) => { state.loading = true; })
      .addCase(incrementMyProgress.fulfilled, (state, action) => {
        state.loading = false; state.bySheet[action.payload.sheetId] = action.payload.data;
      })
      .addCase(incrementMyProgress.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(setMyProgress.pending, (state) => { state.loading = true; })
      .addCase(setMyProgress.fulfilled, (state, action) => {
        state.loading = false; state.bySheet[action.payload.sheetId] = action.payload.data;
      })
      .addCase(setMyProgress.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearProgressError } = slice.actions;
export default slice.reducer;

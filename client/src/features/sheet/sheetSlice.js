import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createSheetAPI,
  listSheetsAPI,
  getSheetBySlugAPI,
  updateSheetAPI,
  deleteSheetAPI,
} from "./sheetAPI";

const initialState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

export const listSheets = createAsyncThunk(
  "sheet/list",
  async (params, { rejectWithValue }) => {
    try {
      return await listSheetsAPI(params);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getSheetBySlug = createAsyncThunk(
  "sheet/getBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      return await getSheetBySlugAPI(slug);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createSheet = createAsyncThunk(
  "sheet/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createSheetAPI(data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateSheet = createAsyncThunk(
  "sheet/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateSheetAPI(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteSheet = createAsyncThunk(
  "sheet/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteSheetAPI(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const sheetSlice = createSlice({
  name: "sheet",
  initialState,
  reducers: {
    clearSheetError: (state) => { state.error = null; },
    clearCurrentSheet: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listSheets.pending, (state) => { state.loading = true; })
      .addCase(listSheets.fulfilled, (state, action) => {
        state.loading = false; state.items = action.payload;
      })
      .addCase(listSheets.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(getSheetBySlug.pending, (state) => { state.loading = true; })
      .addCase(getSheetBySlug.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(getSheetBySlug.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createSheet.pending, (state) => { state.loading = true; })
      .addCase(createSheet.fulfilled, (state, action) => { state.loading = false; state.items.unshift(action.payload); })
      .addCase(createSheet.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateSheet.pending, (state) => { state.loading = true; })
      .addCase(updateSheet.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(s => s._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })
      .addCase(updateSheet.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteSheet.pending, (state) => { state.loading = true; })
      .addCase(deleteSheet.fulfilled, (state, action) => {
        state.loading = false; state.items = state.items.filter(s => s._id !== action.meta.arg);
      })
      .addCase(deleteSheet.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearSheetError, clearCurrentSheet } = sheetSlice.actions;
export default sheetSlice.reducer;

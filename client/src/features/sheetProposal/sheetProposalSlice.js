import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitSheetProposalAPI,
  listMySheetProposalsAPI,
  listSheetProposalsAPI,
  approveSheetProposalAPI,
  rejectSheetProposalAPI,
} from "./sheetProposalAPI";

const initialState = {
  myProposals: [],
  sheetProposals: {}, // key by sheetId
  loading: false,
  error: null,
};

export const submitSheetProposal = createAsyncThunk(
  "sheetProposal/submit",
  async ({ sheetId, changes, notes }, { rejectWithValue }) => {
    try {
      return await submitSheetProposalAPI(sheetId, { changes, notes });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const listMySheetProposals = createAsyncThunk(
  "sheetProposal/listMine",
  async (_, { rejectWithValue }) => {
    try {
      return await listMySheetProposalsAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const listSheetProposals = createAsyncThunk(
  "sheetProposal/listBySheet",
  async (sheetId, { rejectWithValue }) => {
    try {
      const data = await listSheetProposalsAPI(sheetId);
      return { sheetId, data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const approveSheetProposal = createAsyncThunk(
  "sheetProposal/approve",
  async (proposalId, { rejectWithValue }) => {
    try {
      return await approveSheetProposalAPI(proposalId);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const rejectSheetProposal = createAsyncThunk(
  "sheetProposal/reject",
  async ({ proposalId, notes }, { rejectWithValue }) => {
    try {
      return await rejectSheetProposalAPI(proposalId, { notes });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const slice = createSlice({
  name: "sheetProposal",
  initialState,
  reducers: {
    clearSheetProposalError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitSheetProposal.pending, (state) => { state.loading = true; })
      .addCase(submitSheetProposal.fulfilled, (state, action) => {
        state.loading = false; state.myProposals.unshift(action.payload);
      })
      .addCase(submitSheetProposal.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(listMySheetProposals.pending, (state) => { state.loading = true; })
      .addCase(listMySheetProposals.fulfilled, (state, action) => { state.loading = false; state.myProposals = action.payload; })
      .addCase(listMySheetProposals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(listSheetProposals.pending, (state) => { state.loading = true; })
      .addCase(listSheetProposals.fulfilled, (state, action) => {
        state.loading = false; state.sheetProposals[action.payload.sheetId] = action.payload.data;
      })
      .addCase(listSheetProposals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(approveSheetProposal.pending, (state) => { state.loading = true; })
      .addCase(approveSheetProposal.fulfilled, (state) => { state.loading = false; })
      .addCase(approveSheetProposal.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(rejectSheetProposal.pending, (state) => { state.loading = true; })
      .addCase(rejectSheetProposal.fulfilled, (state) => { state.loading = false; })
      .addCase(rejectSheetProposal.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearSheetProposalError } = slice.actions;
export default slice.reducer;

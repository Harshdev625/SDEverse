import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitContact, fetchAllContacts, deleteContact } from "./contactAPI";

// 🔹 Initial State
const initialState = {
  contactList: [],
  loading: false,
  error: null,
  success: false,
  currentPage: 1,

};

// 🔹 Async Thunks

// Send contact form data (user side)
export const sendContact = createAsyncThunk(
  "contact/sendContact",
  async (payload, { rejectWithValue }) => {
    try {
      return await submitContact(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch all contact submissions (admin side)
export const getContactList = createAsyncThunk(
  "contact/getContactList",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllContacts();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete contact (admin side)
export const removeContact = createAsyncThunk(
  "contact/removeContact",
  async (contactId, { rejectWithValue }) => {
    try {
      return await deleteContact(contactId);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🔹 Slice
const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    clearContactStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Send Contact ---
      .addCase(sendContact.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sendContact.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Contact List ---
      .addCase(getContactList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getContactList.fulfilled, (state, action) => {
        state.loading = false;
        state.contactList = action.payload;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getContactList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Delete Contact ---
      .addCase(removeContact.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contactList = state.contactList.filter(
          (contact) => contact._id !== action.meta.arg
        );
        state.success = true;
      })
      .addCase(removeContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 🔹 Export Actions and Reducer
export const { clearContactStatus } = contactSlice.actions;
export default contactSlice.reducer;

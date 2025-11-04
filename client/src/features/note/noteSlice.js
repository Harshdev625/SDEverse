import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNoteByParent, upsertNote, deleteNoteByParent, getMyNotes } from './noteAPI';

const initialState = {
  note: null, // single note for current parent
  notes: [], // user's notes list
  loading: false,
  error: null,
  total: 0,
  pages: 0,
  currentPage: 1,
};

export const fetchNoteByParent = createAsyncThunk(
  'note/fetchNoteByParent',
  async ({ parentType, parentId }, { rejectWithValue }) => {
    try {
      const response = await getNoteByParent(parentType, parentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const saveNote = createAsyncThunk(
  'note/saveNote',
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await upsertNote(noteData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeNote = createAsyncThunk(
  'note/removeNote',
  async ({ parentType, parentId }, { rejectWithValue }) => {
    try {
      const response = await deleteNoteByParent(parentType, parentId);
      return { parentType, parentId, response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyNotes = createAsyncThunk(
  'note/fetchMyNotes',
  async ({ page = 1, limit = 9, q = '', parentType = '' } = {}, { rejectWithValue }) => {
    try {
      const response = await getMyNotes(page, limit, q, parentType);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    clearNote(state) {
      state.note = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoteByParent.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNoteByParent.fulfilled, (state, action) => {
        state.loading = false;
        state.note = action.payload;
      })
      .addCase(fetchNoteByParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching note';
      })

      .addCase(saveNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveNote.fulfilled, (state, action) => {
        state.loading = false;
        state.note = action.payload;
      })
      .addCase(saveNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error saving note';
      })

      .addCase(removeNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeNote.fulfilled, (state, action) => {
        state.loading = false;
        // if current loaded note matches removed parent, clear it
        const { parentType, parentId } = action.payload;
        if (state.note && state.note.parentType === parentType && state.note.parentId === parentId) {
          state.note = null;
        }
      })
      .addCase(removeNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error deleting note';
      })

      .addCase(fetchMyNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.notes || [];
        state.total = action.payload.total || 0;
        state.pages = action.payload.pages || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchMyNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching my notes';
      });
  },
});

export const { clearNote } = noteSlice.actions;

export default noteSlice.reducer;
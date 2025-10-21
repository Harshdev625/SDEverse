// In client/src/features/note/noteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNote, setNote } from './noteAPI';

// This is an async "thunk" for GETTING the note
export const getNoteAsync = createAsyncThunk(
  'note/getNote',
  async (algorithmId) => {
    const data = await getNote(algorithmId);
    return data;
  }
);

// This is an async "thunk" for SAVING (setting) the note
export const setNoteAsync = createAsyncThunk(
  'note/setNote',
  async (noteData) => { // noteData will be { algorithmId, content }
    const data = await setNote(noteData);
    return data;
  }
);

const initialState = {
  content: '',
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  saveStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
};

export const noteSlice = createSlice({
  name: 'note',
  initialState,
  // Regular "reducers" run instantly
  reducers: {
    // This lets us update the note text in the UI as the user types
    setNoteContent: (state, action) => {
      state.content = action.payload;
    },
  },
  // "extraReducers" handle the async thunks (API calls)
  extraReducers: (builder) => {
    builder
      // Cases for Getting the Note
      .addCase(getNoteAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getNoteAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.content = action.payload.content; // Update state with the loaded note
      })
      .addCase(getNoteAsync.rejected, (state) => {
        state.status = 'failed';
      })
      // Cases for Saving the Note
      .addCase(setNoteAsync.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(setNoteAsync.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.content = action.payload.content; // Update state with the saved note
      })
      .addCase(setNoteAsync.rejected, (state) => {
        state.saveStatus = 'failed';
      });
  },
});

export const { setNoteContent } = noteSlice.actions;

// These are "selectors" that let our components read this state
export const selectNoteContent = (state) => state.note.content;
export const selectNoteStatus = (state) => state.note.status;
export const selectNoteSaveStatus = (state) => state.note.saveStatus;

export default noteSlice.reducer;
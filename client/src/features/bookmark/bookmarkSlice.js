import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBookmarkByParent, upsertBookmark, deleteBookmarkByParent, getMyBookmarks } from './bookmarkAPI';

const initialState = {
  bookmark: null,
  bookmarks: [],
  loading: false,
  error: null,
  total: 0,
  pages: 0,
  currentPage: 1,
  filter: {
    q: '',
    parentType: '',
    page: 1,
    limit: 12,
  },
};

export const fetchBookmarkByParent = createAsyncThunk(
  'bookmark/fetchBookmarkByParent',
  async ({ parentType, parentId }, { rejectWithValue }) => {
    try {
      const response = await getBookmarkByParent(parentType, parentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addBookmark = createAsyncThunk(
  'bookmark/addBookmark',
  async (data, { rejectWithValue }) => {
    try {
      const response = await upsertBookmark(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeBookmark = createAsyncThunk(
  'bookmark/removeBookmark',
  async ({ parentType, parentId }, { rejectWithValue }) => {
    try {
      const response = await deleteBookmarkByParent(parentType, parentId);
      return { parentType, parentId, response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyBookmarks = createAsyncThunk(
  'bookmark/fetchMyBookmarks',
  async ({ page = 1, limit = 12, q = '', parentType = '' } = {}, { rejectWithValue }) => {
    try {
      const response = await getMyBookmarks(page, limit, q, parentType);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState,
  reducers: {
    clearBookmark(state) {
      state.bookmark = null;
      state.error = null;
    },
    setBookmarkFilter(state, action) {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearBookmarkFilter(state) {
      state.filter = { q: '', parentType: '', page: 1, limit: 9 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarkByParent.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookmarkByParent.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmark = action.payload;
      })
      .addCase(fetchBookmarkByParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching bookmark';
      })

      .addCase(addBookmark.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmark = action.payload;
      })
      .addCase(addBookmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error saving bookmark';
      })

      .addCase(removeBookmark.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.loading = false;
        const { parentType, parentId } = action.payload;
        if (state.bookmark && state.bookmark.parentType === parentType && state.bookmark.parentId === parentId) {
          state.bookmark = null;
        }
      })
      .addCase(removeBookmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error deleting bookmark';
      })

      .addCase(fetchMyBookmarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks = action.payload.bookmarks || [];
        state.total = action.payload.total || 0;
        state.pages = action.payload.pages || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchMyBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching my bookmarks';
      });
  },
});

export const { clearBookmark } = bookmarkSlice.actions;
export const { setBookmarkFilter, clearBookmarkFilter } = bookmarkSlice.actions;

export default bookmarkSlice.reducer;

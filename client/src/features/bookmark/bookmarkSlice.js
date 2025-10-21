import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addBookmark as addBookmarkAPI,
  removeBookmark as removeBookmarkAPI,
  getUserBookmarks as getUserBookmarksAPI,
  checkBookmark as checkBookmarkAPI,
} from "./bookmarkAPI";

const initialState = {
  bookmarks: [],
  bookmarkStatus: {},
  total: 0,
  currentPage: 1,
  totalPages: 1,
  status: {
    fetchBookmarks: "idle",
    addBookmark: "idle",
    removeBookmark: "idle",
    checkBookmark: "idle",
  },
  error: {
    fetchBookmarks: null,
    addBookmark: null,
    removeBookmark: null,
    checkBookmark: null,
  },
};

export const addBookmark = createAsyncThunk(
  "bookmark/add",
  async ({ contentType, contentId }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const response = await addBookmarkAPI(contentType, contentId, token);
      return { ...response, contentId, contentType };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to add bookmark"
      );
    }
  }
);

export const removeBookmark = createAsyncThunk(
  "bookmark/remove",
  async ({ contentId, contentType }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const response = await removeBookmarkAPI(contentId, token, contentType);
      return { ...response, contentId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to remove bookmark"
      );
    }
  }
);

export const getUserBookmarks = createAsyncThunk(
  "bookmark/getUserBookmarks",
  async (params = {}, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await getUserBookmarksAPI(token, params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch bookmarks"
      );
    }
  }
);

export const checkBookmark = createAsyncThunk(
  "bookmark/check",
  async (contentId, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const response = await checkBookmarkAPI(contentId, token);
      return { contentId, isBookmarked: response.isBookmarked };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to check bookmark"
      );
    }
  }
);

const bookmarkSlice = createSlice({
  name: "bookmark",
  initialState,
  reducers: {
    clearBookmarks: (state) => {
      state.bookmarks = [];
      state.bookmarkStatus = {};
      state.total = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
    setBookmarkStatus: (state, action) => {
      const { contentId, isBookmarked } = action.payload;
      state.bookmarkStatus[contentId] = isBookmarked;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addBookmark.pending, (state) => {
        state.status.addBookmark = "loading";
        state.error.addBookmark = null;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.status.addBookmark = "succeeded";
        const { contentId } = action.payload;
        state.bookmarkStatus[contentId] = true;
      })
      .addCase(addBookmark.rejected, (state, action) => {
        state.status.addBookmark = "failed";
        state.error.addBookmark = action.payload;
      })

      .addCase(removeBookmark.pending, (state) => {
        state.status.removeBookmark = "loading";
        state.error.removeBookmark = null;
      })
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.status.removeBookmark = "succeeded";
        const { contentId } = action.payload;
        state.bookmarkStatus[contentId] = false;

        state.bookmarks = state.bookmarks.filter(
          (bookmark) => bookmark.contentId._id !== contentId
        );
      })
      .addCase(removeBookmark.rejected, (state, action) => {
        state.status.removeBookmark = "failed";
        state.error.removeBookmark = action.payload;
      })

      .addCase(getUserBookmarks.pending, (state) => {
        state.status.fetchBookmarks = "loading";
        state.error.fetchBookmarks = null;
      })
      .addCase(getUserBookmarks.fulfilled, (state, action) => {
        state.status.fetchBookmarks = "succeeded";
        state.bookmarks = action.payload.bookmarks;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        

        action.payload.bookmarks.forEach((bookmark) => {
          state.bookmarkStatus[bookmark.contentId._id] = true;
        });
      })
      .addCase(getUserBookmarks.rejected, (state, action) => {
        state.status.fetchBookmarks = "failed";
        state.error.fetchBookmarks = action.payload;
      })

      .addCase(checkBookmark.pending, (state) => {
        state.status.checkBookmark = "loading";
        state.error.checkBookmark = null;
      })
      .addCase(checkBookmark.fulfilled, (state, action) => {
        state.status.checkBookmark = "succeeded";
        const { contentId, isBookmarked } = action.payload;
        state.bookmarkStatus[contentId] = isBookmarked;
      })
      .addCase(checkBookmark.rejected, (state, action) => {
        state.status.checkBookmark = "failed";
        state.error.checkBookmark = action.payload;
      });
  },
});

export const { clearBookmarks, setBookmarkStatus } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
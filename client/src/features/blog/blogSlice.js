import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listPublicBlogsAPI,
  getBlogBySlugAPI,
  createBlogAPI,
  updateBlogAPI,
  deleteBlogAPI,
  approveBlogAPI,
  rejectBlogAPI,
  toggleLikeAPI,
  toggleBookmarkAPI,
} from "./blogAPI";

const initialState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

export const listPublicBlogs = createAsyncThunk(
  "blog/listPublic",
  async (params, { rejectWithValue }) => {
    try { return await listPublicBlogsAPI(params); }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

export const getBlogBySlug = createAsyncThunk(
  "blog/getBySlug",
  async (slug, { rejectWithValue }) => {
    try { return await getBlogBySlugAPI(slug); }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

export const createBlog = createAsyncThunk(
  "blog/create",
  async (data, { rejectWithValue }) => {
    try { return await createBlogAPI(data); }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

export const updateBlog = createAsyncThunk(
  "blog/update",
  async ({ id, data }, { rejectWithValue }) => {
    try { return await updateBlogAPI(id, data); }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

export const deleteBlog = createAsyncThunk(
  "blog/delete",
  async (id, { rejectWithValue }) => {
    try { return await deleteBlogAPI(id); }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

export const approveBlog = createAsyncThunk(
  "blog/approve",
  async (id, { rejectWithValue }) => {
    try { return await approveBlogAPI(id); }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

export const rejectBlog = createAsyncThunk(
  "blog/reject",
  async ({ id, reviewNotes }, { rejectWithValue }) => {
    try { return await rejectBlogAPI(id, reviewNotes); }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

export const toggleLike = createAsyncThunk(
  "blog/toggleLike",
  async (id, { rejectWithValue }) => {
    try { return { id, data: await toggleLikeAPI(id) }; }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

export const toggleBookmark = createAsyncThunk(
  "blog/toggleBookmark",
  async (id, { rejectWithValue }) => {
    try { return { id, data: await toggleBookmarkAPI(id) }; }
    catch (err) { return rejectWithValue(err.response?.data || err.message); }
  }
);

const slice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listPublicBlogs.pending, (state) => { state.loading = true; })
      .addCase(listPublicBlogs.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(listPublicBlogs.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(getBlogBySlug.pending, (state) => { state.loading = true; })
      .addCase(getBlogBySlug.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(getBlogBySlug.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createBlog.pending, (state) => { state.loading = true; })
      .addCase(createBlog.fulfilled, (state, action) => { state.loading = false; state.items.unshift(action.payload); })
      .addCase(createBlog.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateBlog.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })

      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.items = state.items.filter(b => b._id !== action.meta.arg);
        if (state.current?._id === action.meta.arg) state.current = null;
      })

      .addCase(toggleLike.fulfilled, (state, action) => {
        if (state.current?._id === action.payload.id) {
          state.current.likesCount = action.payload.data.likesCount;
        }
      })

      .addCase(toggleBookmark.fulfilled, (state, action) => {
        // No-op for list; could update local bookmark state if tracked client-side
      })

      .addCase(approveBlog.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(rejectBlog.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  }
});

export const { clearBlogError } = slice.actions;
export default slice.reducer;

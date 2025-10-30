import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllBlogs,
  getBlogBySlug,
  getBlogForEdit,
  getBlogsByAuthor,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getMyBlogs,
  getBlogCategories,
  getPopularTags,
} from "./blogAPI";

const initialState = {
  blogs: [],
  currentBlog: null,
  myBlogs: [],
  categories: [],
  popularTags: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNext: false,
    hasPrev: false,
  },
};

export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getAllBlogs(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blogs"
      );
    }
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  "blog/fetchBlogBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const data = await getBlogBySlug(slug);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blog"
      );
    }
  }
);

export const fetchBlogForEdit = createAsyncThunk(
  "blog/fetchBlogForEdit",
  async (slug, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await getBlogForEdit(slug, token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blog for edit"
      );
    }
  }
);

export const fetchBlogsByAuthor = createAsyncThunk(
  "blog/fetchBlogsByAuthor",
  async (username, { rejectWithValue }) => {
    try {
      const data = await getBlogsByAuthor(username);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blogs by author"
      );
    }
  }
);

export const createNewBlog = createAsyncThunk(
  "blog/createNewBlog",
  async (blogData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await createBlog(blogData, token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create blog"
      );
    }
  }
);

export const updateExistingBlog = createAsyncThunk(
  "blog/updateExistingBlog",
  async ({ slug, blogData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await updateBlog(slug, blogData, token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update blog"
      );
    }
  }
);

export const deleteExistingBlog = createAsyncThunk(
  "blog/deleteExistingBlog",
  async (slug, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await deleteBlog(slug, token);
      return slug;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete blog"
      );
    }
  }
);

export const toggleBlogLike = createAsyncThunk(
  "blog/toggleBlogLike",
  async (slug, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await likeBlog(slug, token);
      const userId = getState().auth.user?._id;
      return { slug, userId, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle like"
      );
    }
  }
);

export const fetchMyBlogs = createAsyncThunk(
  "blog/fetchMyBlogs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const data = await getMyBlogs(token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch my blogs"
      );
    }
  }
);

export const fetchBlogCategories = createAsyncThunk(
  "blog/fetchBlogCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getBlogCategories();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchPopularTags = createAsyncThunk(
  "blog/fetchPopularTags",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getPopularTags();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch popular tags"
      );
    }
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogError: (state) => {
      state.error = null;
    },
    setCurrentBlog: (state, action) => {
      state.currentBlog = action.payload;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchBlogBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchBlogForEdit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogForEdit.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogForEdit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchBlogsByAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogsByAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogsByAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createNewBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.myBlogs.unshift(action.payload);
      })
      .addCase(createNewBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateExistingBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingBlog.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myBlogs.findIndex(
          (blog) => blog.slug === action.payload.slug
        );
        if (index !== -1) {
          state.myBlogs[index] = action.payload;
        }
        if (state.currentBlog?.slug === action.payload.slug) {
          state.currentBlog = action.payload;
        }
      })
      .addCase(updateExistingBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteExistingBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.myBlogs = state.myBlogs.filter(
          (blog) => blog.slug !== action.payload
        );
      })
      .addCase(deleteExistingBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(toggleBlogLike.fulfilled, (state, action) => {
        const { slug, liked, likesCount, userId } = action.payload;

        const blogIndex = state.blogs.findIndex((blog) => blog.slug === slug);
        if (blogIndex !== -1) {
          state.blogs[blogIndex].likes = likesCount;
          state.blogs[blogIndex].likedBy = liked
            ? Array.from(
                new Set([...(state.blogs[blogIndex].likedBy || []), userId])
              )
            : (state.blogs[blogIndex].likedBy || []).filter(
                (id) => id !== userId
              );
        }

        if (state.currentBlog?.slug === slug) {
          state.currentBlog.likes = likesCount;
          state.currentBlog.likedBy = liked
            ? Array.from(
                new Set([...(state.currentBlog.likedBy || []), userId])
              )
            : (state.currentBlog.likedBy || []).filter((id) => id !== userId);
        }
      })

      .addCase(fetchMyBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.myBlogs = action.payload;
      })
      .addCase(fetchMyBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })

      .addCase(fetchPopularTags.fulfilled, (state, action) => {
        state.popularTags = action.payload;
      });
  },
});

export const { clearBlogError, setCurrentBlog, clearCurrentBlog } =
  blogSlice.actions;
export default blogSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createGroup as apiCreateGroup,
  getMyGroups as apiGetMyGroups,
  getGroup as apiGetGroup,
  updateGroup as apiUpdateGroup,
  deleteGroup as apiDeleteGroup,
  addLinkToGroup as apiAddLinkToGroup,
  updateLinkInGroup as apiUpdateLinkInGroup,
  removeLinkFromGroup as apiRemoveLinkFromGroup,
  shareGroup as apiShareGroup,
  unshareGroup as apiUnshareGroup,
  getGroupsSharedWithMe as apiGetGroupsSharedWithMe,
} from './linkGroupAPI';

const initialState = {
  group: null,
  groups: [],
  sharedGroups: [],
  loading: false,
  error: null,
  total: 0,
  pages: 0,
  currentPage: 1,
  filter: { q: '', page: 1, limit: 20 },
};

export const createGroup = createAsyncThunk('linkGroup/createGroup', async (data, { rejectWithValue }) => {
  try {
    const res = await apiCreateGroup(data);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const fetchMyGroups = createAsyncThunk('linkGroup/fetchMyGroups', async ({ page = 1, limit = 20, q = '' } = {}, { rejectWithValue }) => {
  try {
    const res = await apiGetMyGroups(page, limit, q);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const fetchGroup = createAsyncThunk('linkGroup/fetchGroup', async (id, { rejectWithValue }) => {
  try {
    const res = await apiGetGroup(id);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const editGroup = createAsyncThunk('linkGroup/editGroup', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await apiUpdateGroup(id, data);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const removeGroup = createAsyncThunk('linkGroup/removeGroup', async (id, { rejectWithValue }) => {
  try {
    const res = await apiDeleteGroup(id);
    return { id, res };
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const addLink = createAsyncThunk('linkGroup/addLink', async ({ groupId, data }, { rejectWithValue }) => {
  try {
    const res = await apiAddLinkToGroup(groupId, data);
    return { groupId, link: res };
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateLink = createAsyncThunk('linkGroup/updateLink', async ({ groupId, linkId, data }, { rejectWithValue }) => {
  try {
    const res = await apiUpdateLinkInGroup(groupId, linkId, data);
    return { groupId, linkId, link: res };
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const removeLink = createAsyncThunk('linkGroup/removeLink', async ({ groupId, linkId }, { rejectWithValue }) => {
  try {
    const res = await apiRemoveLinkFromGroup(groupId, linkId);
    return { groupId, linkId, res };
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const share = createAsyncThunk('linkGroup/share', async ({ groupId, data }, { rejectWithValue }) => {
  try {
    const res = await apiShareGroup(groupId, data);
    return { groupId, sharedWith: res.sharedWith };
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const unshare = createAsyncThunk('linkGroup/unshare', async ({ groupId, userId }, { rejectWithValue }) => {
  try {
    const res = await apiUnshareGroup(groupId, userId);
    return { groupId, sharedWith: res.sharedWith };
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const fetchSharedWithMe = createAsyncThunk('linkGroup/fetchSharedWithMe', async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
  try {
    const res = await apiGetGroupsSharedWithMe(page, limit);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const slice = createSlice({
  name: 'linkGroup',
  initialState,
  reducers: {
    clearGroup(state) {
      state.group = null;
      state.error = null;
    },
    setGroupFilter(state, action) {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearGroupFilter(state) {
      state.filter = { q: '', page: 1, limit: 20 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = [action.payload, ...(state.groups || [])];
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error creating group';
      })

      .addCase(fetchMyGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.groups || [];
        state.total = action.payload.total || 0;
        state.pages = action.payload.pages || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchMyGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching groups';
      })

      .addCase(fetchGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.group = action.payload;
      })
      .addCase(fetchGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching group';
      })

      .addCase(editGroup.fulfilled, (state, action) => {
        state.group = action.payload;
        state.groups = (state.groups || []).map((g) => (g._id === action.payload._id ? action.payload : g));
      })

      .addCase(removeGroup.fulfilled, (state, action) => {
        state.groups = (state.groups || []).filter((g) => g._id !== action.payload.id);
        if (state.group && state.group._id === action.payload.id) state.group = null;
      })

      .addCase(addLink.fulfilled, (state, action) => {
        const { groupId, link } = action.payload;
        if (state.group && state.group._id === groupId) {
          state.group.links = state.group.links || [];
          state.group.links.push(link);
        }
        state.groups = (state.groups || []).map((g) => (g._id === groupId ? { ...g, links: [...(g.links || []), link] } : g));
      })

      .addCase(updateLink.fulfilled, (state, action) => {
        const { groupId, linkId, link } = action.payload;
        if (state.group && state.group._id === groupId) {
          state.group.links = (state.group.links || []).map((l) => (l._id === linkId ? link : l));
        }
        state.groups = (state.groups || []).map((g) => {
          if (g._id !== groupId) return g;
          return { ...g, links: (g.links || []).map((l) => (l._id === linkId ? link : l)) };
        });
      })

      .addCase(removeLink.fulfilled, (state, action) => {
        const { groupId, linkId } = action.payload;
        if (state.group && state.group._id === groupId) {
          state.group.links = (state.group.links || []).filter((l) => l._id !== linkId);
        }
        state.groups = (state.groups || []).map((g) => {
          if (g._id !== groupId) return g;
          return { ...g, links: (g.links || []).filter((l) => l._id !== linkId) };
        });
      })

      .addCase(share.fulfilled, (state, action) => {
        const { groupId, sharedWith } = action.payload;
        if (state.group && state.group._id === groupId) state.group.sharedWith = sharedWith;
        state.groups = (state.groups || []).map((g) => (g._id === groupId ? { ...g, sharedWith } : g));
      })

      .addCase(unshare.fulfilled, (state, action) => {
        const { groupId, sharedWith } = action.payload;
        if (state.group && state.group._id === groupId) state.group.sharedWith = sharedWith;
        state.groups = (state.groups || []).map((g) => (g._id === groupId ? { ...g, sharedWith } : g));
      })

      .addCase(fetchSharedWithMe.fulfilled, (state, action) => {
        state.sharedGroups = action.payload.groups || [];
      });
  },
});

export const { clearGroup, setGroupFilter, clearGroupFilter } = slice.actions;
export default slice.reducer;

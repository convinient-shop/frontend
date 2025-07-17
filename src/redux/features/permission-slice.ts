import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Permission {
  id: string;
  name: string;
  description: string;
  group: string;
}

interface PermissionState {
  permissions: Permission[];
  userPermissions: Permission[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  userPermissions: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPermissions = createAsyncThunk(
  'permission/fetchPermissions',
  async () => {
    const response = await axios.get('/api/permissions');
    return response.data;
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'permission/fetchUserPermissions',
  async (userId: string) => {
    const response = await axios.get(`/api/users/${userId}/permissions`);
    return response.data;
  }
);

export const updateUserPermissions = createAsyncThunk(
  'permission/updateUserPermissions',
  async ({ userId, permissions }: { userId: string; permissions: string[] }) => {
    const response = await axios.put(`/api/users/${userId}/permissions`, { permissions });
    return response.data;
  }
);

export const createPermission = createAsyncThunk(
  'permission/createPermission',
  async (permission: Omit<Permission, 'id'>) => {
    const response = await axios.post('/api/permissions', permission);
    return response.data;
  }
);

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch permissions';
      })
      // Fetch User Permissions
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.userPermissions = action.payload;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user permissions';
      })
      // Update User Permissions
      .addCase(updateUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.userPermissions = action.payload;
      })
      .addCase(updateUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user permissions';
      })
      // Create Permission
      .addCase(createPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions.push(action.payload);
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create permission';
      });
  },
});

export default permissionSlice.reducer; 
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Sign in failed');

      return {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || null,
        avatar: data.user.user_metadata?.avatar_url || null,
        created_at: data.user.created_at,
      } as User;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) throw new Error('No user found');

      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || null,
        avatar: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
      } as User;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;

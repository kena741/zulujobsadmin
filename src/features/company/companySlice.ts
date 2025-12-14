import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { Company, CompanyEntity } from '@/lib/types/admin.types';

interface CompanyState {
  companies: Company[];
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  loading: false,
  error: null,
};

// Map database entity to frontend format
const mapCompanyFromDB = (entity: CompanyEntity): Company => {
  return {
    id: entity.id,
    companyName: entity.name, // Database column is 'name'
    userId: entity.user_id,
    tin: entity.tin,
    phoneNumber: entity.phone_number,
    email: entity.email,
    address: entity.address,
    country: entity.country,
    businessLicence: entity.business_licence,
    establishedDate: entity.established_date,
    businessDescription: entity.business_description,
    website: entity.website,
    isOwner: entity.is_owner,
    isVerified: entity.is_verified,
    requestVerify: entity.request_verify || false,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
};

export const fetchAllCompanies = createAsyncThunk(
  'company/fetchAllCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapCompanyFromDB);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUnverifiedCompanies = createAsyncThunk(
  'company/fetchUnverifiedCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('is_verified', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapCompanyFromDB);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const verifyCompany = createAsyncThunk(
  'company/verifyCompany',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      return mapCompanyFromDB(data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const rejectCompany = createAsyncThunk(
  'company/rejectCompany',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .update({ 
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      return mapCompanyFromDB(data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchAllCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnverifiedCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnverifiedCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchUnverifiedCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCompany.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
      })
      .addCase(verifyCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(rejectCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectCompany.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
      })
      .addCase(rejectCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = companySlice.actions;
export default companySlice.reducer;

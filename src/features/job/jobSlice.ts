import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { Job, JobEntity } from '@/lib/types/admin.types';

interface JobState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  loading: false,
  error: null,
};

// Map database entity to frontend format
const mapJobFromDB = (entity: JobEntity): Job => {
  return {
    id: entity.id,
    jobTitle: entity.job_title,
    description: entity.description,
    deadline: entity.deadline,
    company: entity.company,
    jobType: entity.job_type,
    experienceLevel: entity.experience_level,
    workingHours: entity.working_hours,
    location: entity.location,
    salary: entity.salary,
    maxApplicants: entity.max_applicants,
    applyLink: entity.apply_link,
    companyId: entity.company_id,
    employerId: entity.employer_id,
    status: entity.status,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
};

export const fetchAllJobs = createAsyncThunk(
  'job/fetchAllJobs',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapJobFromDB);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateJobStatus = createAsyncThunk(
  'job/updateJobStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapJobFromDB(data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateJobStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobs.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = jobSlice.actions;
export default jobSlice.reducer;

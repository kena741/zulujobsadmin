import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationEntity } from '@/lib/types/admin.types';

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  applications: [],
  loading: false,
  error: null,
};

export const fetchAllApplications = createAsyncThunk(
  'application/fetchAllApplications',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch applications with job details
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            job_title,
            company
          ),
          freelancers (
            id,
            email,
            professional_title
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map to frontend format
      const mapped = (data || []).map((app: any) => ({
        id: app.id,
        applicantId: app.applicant_id,
        jobId: app.job_id,
        jobTitle: app.jobs?.job_title || 'Unknown Job',
        company: app.jobs?.company || null,
        applicantName: app.freelancers?.professional_title || app.freelancers?.email || 'Unknown Applicant',
        applicantEmail: app.freelancers?.email || null,
        status: (app.status || 'pending') as Application['status'],
        coverLetter: app.cover_later || null,
        portfolioLinks: app.protfolio_links || null,
        createdAt: app.created_at,
      }));
      
      return mapped;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'application/updateApplicationStatus',
  async ({ id, status }: { id: string; status: Application['status'] }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          jobs (
            id,
            job_title,
            company,
            company_id
          ),
          freelancers (
            id,
            email,
            professional_title
          )
        `)
        .single();
      
      if (error) throw error;
      
      // If status is 'hired', update hiring_rate for the company
      if (status === 'hired' && data.jobs?.company_id) {
        try {
          // Get all jobs for this company
          const { data: companyJobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id')
            .eq('company_id', data.jobs.company_id);
          
          if (!jobsError && companyJobs && companyJobs.length > 0) {
            const jobIds = companyJobs.map(job => job.id);
            
            // Get all applications for all jobs from this company
            const { data: allApplications, error: appsError } = await supabase
              .from('applications')
              .select('status')
              .in('job_id', jobIds);
            
            if (!appsError && allApplications) {
              const totalApplications = allApplications.length;
              const hiredCount = allApplications.filter(app => app.status === 'hired').length;
              const hiringRate = totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0;
              
              // Update hiring_rate for the company
              const { error: updateError } = await supabase
                .from('employers')
                .update({ 
                  hiring_rate: hiringRate,
                  updated_at: new Date().toISOString()
                })
                .eq('id', data.jobs.company_id);
              
              if (updateError) {
                console.error('Failed to update hiring_rate:', updateError);
              }
            }
          }
        } catch (error) {
          console.error('Error updating hiring_rate:', error);
        }
      }
      
      return {
        id: data.id,
        applicantId: data.applicant_id,
        jobId: data.job_id,
        jobTitle: data.jobs?.job_title || 'Unknown Job',
        company: data.jobs?.company || null,
        applicantName: data.freelancers?.professional_title || data.freelancers?.email || 'Unknown Applicant',
        applicantEmail: data.freelancers?.email || null,
        status: (data.status || 'pending') as Application['status'],
        coverLetter: data.cover_later || null,
        portfolioLinks: data.protfolio_links || null,
        createdAt: data.created_at,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchAllApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.applications.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = applicationSlice.actions;
export default applicationSlice.reducer;

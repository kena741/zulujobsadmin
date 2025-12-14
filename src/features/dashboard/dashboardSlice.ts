import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, MonthlyJobData } from '@/lib/types/admin.types';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

// Helper function to calculate growth percentage
const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Helper function to get last 6 months data
const getLast6Months = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }
  return months;
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      // Fetch all stats in parallel
      const [
        companiesResult,
        verifiedCompaniesResult,
        jobsResult,
        activeJobsResult,
        applicationsResult,
        pendingApplicationsResult,
        freelancersResult,
        freelancersLastMonthResult,
        companiesLastMonthResult,
        jobsDataResult,
      ] = await Promise.all([
        supabase.from('employers').select('*', { count: 'exact', head: true }),
        supabase.from('employers').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('freelancers').select('*', { count: 'exact', head: true }),
        supabase.from('freelancers').select('*', { count: 'exact', head: true }).lt('created_at', oneMonthAgo.toISOString()),
        supabase.from('employers').select('*', { count: 'exact', head: true }).lt('created_at', oneMonthAgo.toISOString()),
        supabase.from('jobs').select('created_at').gte('created_at', sixMonthsAgo.toISOString()).order('created_at', { ascending: true }),
      ]);

      // Calculate pending verifications
      const totalCompanies = companiesResult.count || 0;
      const verifiedCompanies = verifiedCompaniesResult.count || 0;
      const pendingVerifications = totalCompanies - verifiedCompanies;
      const totalFreelancers = freelancersResult.count || 0;
      const freelancersLastMonth = freelancersLastMonthResult.count || 0;
      const companiesLastMonth = companiesLastMonthResult.count || 0;

      // Calculate growth percentages
      const freelancerGrowth = calculateGrowth(totalFreelancers, freelancersLastMonth);
      const companyGrowth = calculateGrowth(totalCompanies, companiesLastMonth);

      // Process jobs by month
      const jobsByMonth: MonthlyJobData[] = [];
      const monthLabels = getLast6Months();
      const jobsData = jobsDataResult.data || [];

      monthLabels.forEach((monthLabel, index) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - index) + 1, 0);
        
        const count = jobsData.filter((job: any) => {
          const jobDate = new Date(job.created_at);
          return jobDate >= monthStart && jobDate <= monthEnd;
        }).length;

        jobsByMonth.push({ month: monthLabel, count });
      });

      const stats: DashboardStats = {
        totalCompanies,
        verifiedCompanies,
        pendingVerifications,
        totalJobs: jobsResult.count || 0,
        activeJobs: activeJobsResult.count || 0,
        totalApplications: applicationsResult.count || 0,
        pendingApplications: pendingApplicationsResult.count || 0,
        totalFreelancers,
        freelancerGrowth,
        jobsPostedByMonth: jobsByMonth,
        companyGrowth,
      };

      return stats;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

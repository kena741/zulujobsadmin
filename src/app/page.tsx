'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/features/dashboard/dashboardSlice';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600 bg-green-50';
    if (growth < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
    }
    if (growth < 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
        </svg>
      );
    }
    return null;
  };

  // Calculate max value for chart scaling
  const maxJobCount = stats?.jobsPostedByMonth
    ? Math.max(...stats.jobsPostedByMonth.map((m) => m.count), 1)
    : 1;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50 lg:ml-64">
        <Header title="Dashboard Analytics" />
        
        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Freelancers Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    {stats?.freelancerGrowth !== undefined && (
                      <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold ${getGrowthColor(stats.freelancerGrowth)}`}>
                        {getGrowthIcon(stats.freelancerGrowth)}
                        <span>{Math.abs(stats.freelancerGrowth)}%</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Freelancers</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalFreelancers || 0}</p>
                  <p className="text-xs text-gray-500">Registered users</p>
                  <button
                    onClick={() => router.push('/freelancers')}
                    className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm"
                  >
                    See All →
                  </button>
                </div>

                {/* Companies Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    {stats?.companyGrowth !== undefined && (
                      <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold ${getGrowthColor(stats.companyGrowth)}`}>
                        {getGrowthIcon(stats.companyGrowth)}
                        <span>{Math.abs(stats.companyGrowth)}%</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Companies</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalCompanies || 0}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {stats?.verifiedCompanies || 0} Verified
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      {stats?.pendingVerifications || 0} Pending
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/companies')}
                    className="w-full py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors text-sm"
                  >
                    See All →
                  </button>
                </div>

                {/* Jobs Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Jobs</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalJobs || 0}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {stats?.activeJobs || 0} Active
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/jobs')}
                    className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors text-sm"
                  >
                    See All →
                  </button>
                </div>

                {/* Applications Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Applications</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalApplications || 0}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      {stats?.pendingApplications || 0} Pending
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/applications')}
                    className="w-full py-2 bg-pink-50 text-pink-600 rounded-lg font-medium hover:bg-pink-100 transition-colors text-sm"
                  >
                    See All →
                  </button>
                </div>
              </div>

              {/* Jobs Posted Over Time Chart */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Jobs Posted Over Time</h2>
                    <p className="text-sm text-gray-600 mt-1">Last 6 months trend</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {stats?.jobsPostedByMonth && stats.jobsPostedByMonth.length > 0 ? (
                    <>
                      {/* Chart Bars */}
                      <div className="flex items-end justify-between gap-2 h-64">
                        {stats.jobsPostedByMonth.map((monthData, index) => {
                          const height = (monthData.count / maxJobCount) * 100;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full flex flex-col items-center justify-end h-full">
                                <div
                                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all hover:from-purple-700 hover:to-purple-500"
                                  style={{ height: `${Math.max(height, 5)}%` }}
                                  title={`${monthData.count} jobs`}
                                >
                                  <div className="h-full flex items-end justify-center pb-2">
                                    <span className="text-white text-xs font-semibold">{monthData.count}</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-gray-600 font-medium text-center">{monthData.month}</span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Total (6 months)</p>
                          <p className="text-lg font-bold text-gray-900">
                            {stats.jobsPostedByMonth.reduce((sum, m) => sum + m.count, 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Average per month</p>
                          <p className="text-lg font-bold text-gray-900">
                            {Math.round(stats.jobsPostedByMonth.reduce((sum, m) => sum + m.count, 0) / stats.jobsPostedByMonth.length)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Peak month</p>
                          <p className="text-lg font-bold text-gray-900">
                            {Math.max(...stats.jobsPostedByMonth.map((m) => m.count))}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>No job posting data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Company Verification Status</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Verified Companies</p>
                          <p className="text-sm text-gray-600">Approved and active</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{stats?.verifiedCompanies || 0}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Pending Verification</p>
                          <p className="text-sm text-gray-600">Awaiting review</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">{stats?.pendingVerifications || 0}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Verification Rate</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {stats?.totalCompanies
                            ? Math.round((stats.verifiedCompanies / stats.totalCompanies) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${stats?.totalCompanies ? (stats.verifiedCompanies / stats.totalCompanies) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Statistics</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Active Jobs</span>
                      <span className="text-lg font-bold text-blue-600">{stats?.activeJobs || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Applications</span>
                      <span className="text-lg font-bold text-purple-600">{stats?.totalApplications || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Pending Applications</span>
                      <span className="text-lg font-bold text-orange-600">{stats?.pendingApplications || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Freelancers</span>
                      <span className="text-lg font-bold text-indigo-600">{stats?.totalFreelancers || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

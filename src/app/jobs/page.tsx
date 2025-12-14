'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllJobs, updateJobStatus } from '@/features/job/jobSlice';
import { fetchAllApplications, updateApplicationStatus } from '@/features/application/applicationSlice';
import { addNotification } from '@/features/ui/uiSlice';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import type { Application } from '@/lib/types/admin.types';

interface JobWithApplications {
  jobId: string;
  jobTitle: string;
  company: string | null;
  status: string | null;
  applications: Application[];
}

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { jobs, loading: jobsLoading } = useAppSelector((state) => state.job);
  const { applications, loading: applicationsLoading } = useAppSelector((state) => state.application);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobWithApplications | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedCoverLetters, setExpandedCoverLetters] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchAllJobs());
    dispatch(fetchAllApplications());
  }, [dispatch]);

  // Merge jobs with their applications
  const jobsWithApplications = useMemo(() => {
    const appsByJob = new Map<string, Application[]>();
    
    applications.forEach((app) => {
      if (!appsByJob.has(app.jobId)) {
        appsByJob.set(app.jobId, []);
      }
      appsByJob.get(app.jobId)!.push(app);
    });

    return jobs.map((job) => ({
      jobId: job.id,
      jobTitle: job.jobTitle,
      company: job.company,
      status: job.status,
      location: job.location,
      salary: job.salary,
      jobType: job.jobType,
      description: job.description,
      deadline: job.deadline,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      applications: appsByJob.get(job.id) || [],
    }));
  }, [jobs, applications]);

  const handleJobStatusUpdate = async (jobId: string, newStatus: string) => {
    const result = await dispatch(updateJobStatus({ id: jobId, status: newStatus }));
    if (updateJobStatus.fulfilled.match(result)) {
      dispatch(addNotification({
        type: 'success',
        message: 'Job status updated successfully!',
      }));
      dispatch(fetchAllJobs());
    } else {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update job status',
      }));
    }
  };

  const handleApplicationStatusUpdate = async (applicationId: string, newStatus: Application['status']) => {
    const result = await dispatch(updateApplicationStatus({ id: applicationId, status: newStatus }));
    if (updateApplicationStatus.fulfilled.match(result)) {
      dispatch(addNotification({
        type: 'success',
        message: 'Application status updated successfully!',
      }));
      dispatch(fetchAllApplications());
      // Update selected job applications
      if (selectedJob) {
        setSelectedJob({
          ...selectedJob,
          applications: selectedJob.applications.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          ),
        });
      }
    } else {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update application status',
      }));
    }
  };

  const handleViewDetails = (job: JobWithApplications) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const toggleCoverLetter = (applicationId: string) => {
    setExpandedCoverLetters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  const filteredJobs = jobsWithApplications.filter((job) => {
    if (statusFilter === 'all') return true;
    return job.status === statusFilter;
  });

  const statusCounts = {
    all: jobs.length,
    active: jobs.filter((j) => j.status === 'active').length,
    closed: jobs.filter((j) => j.status === 'closed').length,
    draft: jobs.filter((j) => j.status === 'draft').length,
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-review':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate status counts for a job
  const getApplicationStatusCounts = (apps: Application[]) => {
    return {
      pending: apps.filter((a) => a.status === 'pending').length,
      'in-review': apps.filter((a) => a.status === 'in-review').length,
      shortlisted: apps.filter((a) => a.status === 'shortlisted').length,
      rejected: apps.filter((a) => a.status === 'rejected').length,
      hired: apps.filter((a) => a.status === 'hired').length,
    };
  };

  const loading = jobsLoading || applicationsLoading;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50 lg:ml-64">
        <Header title="Jobs & Applications" />
        
        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Status Filter */}
          <div className="mb-6 flex gap-2">
            {(['all', 'active', 'closed', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  statusFilter === status
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p className="text-lg font-medium">No jobs found</p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const appStatusCounts = getApplicationStatusCounts(job.applications);
                  return (
                    <div
                      key={job.jobId}
                      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>
                          {job.company && (
                            <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status || 'Unknown'}
                        </span>
                      </div>

                      {/* Job Details */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        {job.location && (
                          <div>
                            <span className="font-medium">Location:</span> {job.location}
                          </div>
                        )}
                        {job.salary && (
                          <div>
                            <span className="font-medium">Salary:</span> {job.salary}
                          </div>
                        )}
                        {job.jobType && (
                          <div>
                            <span className="font-medium">Type:</span> {job.jobType}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(job.createdAt)}
                        </div>
                      </div>

                      {/* Applications Count */}
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">Applications</span>
                          <span className="px-2 py-1 bg-purple-600 text-white rounded-lg text-sm font-bold">
                            {job.applications.length}
                          </span>
                        </div>
                        {job.applications.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {appStatusCounts.pending > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Pending</span>
                                <span className="font-medium">{appStatusCounts.pending}</span>
                              </div>
                            )}
                            {appStatusCounts['in-review'] > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">In Review</span>
                                <span className="font-medium">{appStatusCounts['in-review']}</span>
                              </div>
                            )}
                            {appStatusCounts.shortlisted > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Shortlisted</span>
                                <span className="font-medium">{appStatusCounts.shortlisted}</span>
                              </div>
                            )}
                            {appStatusCounts.rejected > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Rejected</span>
                                <span className="font-medium">{appStatusCounts.rejected}</span>
                              </div>
                            )}
                            {appStatusCounts.hired > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Hired</span>
                                <span className="font-medium">{appStatusCounts.hired}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        {job.applications.length > 0 && (
                          <button
                            onClick={() => handleViewDetails(job)}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            See Applications ({job.applications.length})
                          </button>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2 font-medium">Update Job Status:</p>
                          <div className="flex flex-wrap gap-2">
                            {(['active', 'closed', 'draft'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleJobStatusUpdate(job.jobId, status)}
                                disabled={loading}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  job.status === status
                                    ? getStatusColor(status) + ' border-2 border-gray-400'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>

        {/* Detail Modal - All Applicants for Selected Job */}
        {showDetailModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 border-b border-purple-700 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedJob.jobTitle}</h2>
                  {selectedJob.company && (
                    <p className="text-purple-100 text-sm mt-1">{selectedJob.company}</p>
                  )}
                  <p className="text-purple-200 text-xs mt-1">
                    {selectedJob.applications.length} {selectedJob.applications.length === 1 ? 'Applicant' : 'Applicants'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Job Details Summary */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {selectedJob.location && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="font-medium text-gray-900">{selectedJob.location}</p>
                      </div>
                    )}
                    {selectedJob.salary && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Salary</p>
                        <p className="font-medium text-gray-900">{selectedJob.salary}</p>
                      </div>
                    )}
                    {selectedJob.jobType && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="font-medium text-gray-900">{selectedJob.jobType}</p>
                      </div>
                    )}
                    {selectedJob.deadline && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Deadline</p>
                        <p className="font-medium text-gray-900">{formatDate(selectedJob.deadline)}</p>
                      </div>
                    )}
                  </div>
                  {selectedJob.description && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-700">{selectedJob.description}</p>
                    </div>
                  )}
                </div>

                {selectedJob.applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium">No applicants for this job</p>
                  </div>
                ) : (
                  selectedJob.applications.map((application) => (
                    <div
                      key={application.id}
                      className="bg-gray-50 rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{application.applicantName}</h3>
                          {application.applicantEmail && (
                            <p className="text-sm text-gray-600 mt-1">{application.applicantEmail}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">Applied:</span> {formatDateTime(application.createdAt)}
                      </div>

                      {application.coverLetter && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700 block mb-2">Cover Letter:</span>
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            {expandedCoverLetters.has(application.id) ? (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                            ) : (
                              <p className="text-sm text-gray-700">
                                {application.coverLetter.length > 200
                                  ? application.coverLetter.substring(0, 200) + '...'
                                  : application.coverLetter}
                              </p>
                            )}
                            {application.coverLetter.length > 200 && (
                              <button
                                onClick={() => toggleCoverLetter(application.id)}
                                className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                              >
                                {expandedCoverLetters.has(application.id) ? 'Show Less' : 'Show More'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {application.portfolioLinks && application.portfolioLinks.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700 block mb-2">Portfolio Links:</span>
                          <div className="flex flex-wrap gap-2">
                            {application.portfolioLinks.map((link, index) => (
                              <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-700 underline"
                              >
                                {link}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Update Status:</p>
                        <div className="flex flex-wrap gap-2">
                          {(['in-review', 'shortlisted', 'rejected', 'hired'] as Application['status'][]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleApplicationStatusUpdate(application.id, status)}
                              disabled={loading}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                application.status === status
                                  ? getApplicationStatusColor(status) + ' border-2 border-gray-400'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

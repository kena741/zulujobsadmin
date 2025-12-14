/**
 * Database entity interface for employers table (snake_case)
 */
export interface CompanyEntity {
  id: string;
  name: string; // Database column is 'name'
  user_id?: string | null;
  tin?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  country?: string | null;
  business_licence?: string | null;
  established_date?: string | null;
  business_description?: string | null;
  website?: string | null;
  is_owner?: boolean | null;
  is_verified?: boolean | null;
  request_verify?: boolean | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database entity interface for applications table (snake_case)
 */
export interface ApplicationEntity {
  id: string;
  applicant_id: string;
  job_id: string;
  created_at: string;
  cover_later?: string | null;
  protfolio_links?: string[] | null;
  status?: 'pending' | 'in-review' | 'shortlisted' | 'rejected' | 'hired' | null;
}

/**
 * Database entity interface for jobs table (snake_case)
 */
export interface JobEntity {
  id: string;
  job_title: string;
  description: string | null;
  deadline: string | null;
  company: string | null;
  job_type: string | null;
  experience_level: string | null;
  working_hours: string | null;
  location: string | null;
  salary: string | null;
  max_applicants: number | null;
  apply_link: string | null;
  company_id: string | null;
  employer_id: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Frontend interface for Company (camelCase)
 */
export interface Company {
  id: string;
  companyName: string;
  userId?: string | null;
  tin?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  country?: string | null;
  businessLicence?: string | null;
  establishedDate?: string | null;
  businessDescription?: string | null;
  website?: string | null;
  isOwner?: boolean | null;
  isVerified?: boolean | null;
  requestVerify?: boolean | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Frontend interface for Application with details (camelCase)
 */
export interface Application {
  id: string;
  applicantId: string;
  jobId: string;
  jobTitle: string;
  company: string | null;
  applicantName: string;
  applicantEmail?: string | null;
  status: 'pending' | 'in-review' | 'shortlisted' | 'rejected' | 'hired';
  coverLetter?: string | null;
  portfolioLinks?: string[] | null;
  createdAt: string;
}

/**
 * Frontend interface for Job (camelCase)
 */
export interface Job {
  id: string;
  jobTitle: string;
  description: string | null;
  deadline: string | null;
  company: string | null;
  jobType: string | null;
  experienceLevel: string | null;
  workingHours: string | null;
  location: string | null;
  salary: string | null;
  maxApplicants: number | null;
  applyLink: string | null;
  companyId: string | null;
  employerId: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalCompanies: number;
  verifiedCompanies: number;
  pendingVerifications: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalFreelancers: number;
  freelancerGrowth: number; // Percentage growth
  jobsPostedByMonth: Array<{ month: string; count: number }>; // Last 6 months
  companyGrowth: number; // Percentage growth
}

/**
 * Monthly job posting data
 */
export interface MonthlyJobData {
  month: string;
  count: number;
}

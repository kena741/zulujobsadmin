# Zulu Jobs Admin

Admin panel for managing the Zulu Jobs platform. This application handles company verifications, job applications, and job postings.

## Features

- **Dashboard**: Overview statistics for companies, jobs, and applications
- **Company Management**: View, verify, and reject company verification requests
- **Application Management**: View and update application statuses
- **Job Management**: View and manage job postings

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The admin app works with the following Supabase tables:
- `employers` - Company information and verification status
- `jobs` - Job postings
- `applications` - Job applications
- `freelancers` - Applicant/freelancer profiles

## Pages

- `/` - Dashboard with statistics
- `/companies` - Company verification management
- `/applications` - Application management
- `/jobs` - Job management
- `/signin` - Admin login

## Tech Stack

- Next.js 16
- React 19
- Redux Toolkit
- Supabase
- TypeScript
- Tailwind CSS
# zulujobsadmin

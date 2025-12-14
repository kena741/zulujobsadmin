'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/signin' }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

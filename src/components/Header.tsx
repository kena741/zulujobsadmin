'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import Sidebar from './Sidebar';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const username = user?.name || user?.email?.split('@')[0] || 'Admin';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <>
      <Sidebar isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          {/* Hamburger menu - only visible on mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* User info - only visible on mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{username}</div>
            </div>
          </div>

          {/* Page title */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>

        {/* User info - only visible on desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-gray-900 text-sm">{username}</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
        </div>
      </header>
    </>
  );
}

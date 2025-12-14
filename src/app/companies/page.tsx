'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllCompanies, verifyCompany, rejectCompany } from '@/features/company/companySlice';
import { addNotification } from '@/features/ui/uiSlice';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import type { Company } from '@/lib/types/admin.types';

export default function CompaniesPage() {
  const dispatch = useAppDispatch();
  const { companies, loading } = useAppSelector((state) => state.company);
  const [activeTab, setActiveTab] = useState<'all' | 'requesting' | 'others'>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchAllCompanies());
  }, [dispatch]);

  const handleVerify = async (companyId: string) => {
    const result = await dispatch(verifyCompany(companyId));
    if (verifyCompany.fulfilled.match(result)) {
      dispatch(addNotification({
        type: 'success',
        message: 'Company verified successfully!',
      }));
      dispatch(fetchAllCompanies());
      setShowDetailModal(false);
    } else {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to verify company',
      }));
    }
  };

  const handleReject = async (companyId: string) => {
    const result = await dispatch(rejectCompany(companyId));
    if (rejectCompany.fulfilled.match(result)) {
      dispatch(addNotification({
        type: 'success',
        message: 'Company verification rejected',
      }));
      dispatch(fetchAllCompanies());
      setShowDetailModal(false);
    } else {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to reject company',
      }));
    }
  };

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailModal(true);
  };

  // Get unique countries for filter
  const uniqueCountries = useMemo(() => {
    const countries = companies
      .map(c => c.country)
      .filter((country): country is string => country !== null && country !== undefined && country.trim() !== '');
    return Array.from(new Set(countries)).sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter((company) => {
      if (activeTab === 'requesting') return company.requestVerify === true && company.isVerified === false;
      if (activeTab === 'others') return !(company.requestVerify === true && company.isVerified === false);
      return true;
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => {
        return (
          c.companyName?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.country?.toLowerCase().includes(query) ||
          c.tin?.toLowerCase().includes(query)
        );
      });
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(c => c.country === countryFilter);
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(c => {
        switch (verificationFilter) {
          case 'verified':
            return c.isVerified === true;
          case 'unverified':
            return c.isVerified === false;
          case 'requesting':
            return c.requestVerify === true && c.isVerified === false;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [companies, activeTab, searchQuery, countryFilter, verificationFilter]);

  // Sort: requesting verification first, then by creation date
  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      const aRequesting = a.requestVerify === true && a.isVerified === false;
      const bRequesting = b.requestVerify === true && b.isVerified === false;
      if (aRequesting && !bRequesting) return -1;
      if (!aRequesting && bRequesting) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredCompanies]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tabs = [
    { id: 'all' as const, label: 'All Companies', count: companies.length, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'requesting' as const, label: 'Requesting Verification', count: companies.filter(c => c.requestVerify === true && c.isVerified === false).length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'others' as const, label: 'Others', count: companies.filter(c => !(c.requestVerify === true && c.isVerified === false)).length, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50 lg:ml-64">
        <Header title="Companies" />
        
        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Search and Filters */}
          <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Verification Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="requesting">Requesting</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || countryFilter !== 'all' || verificationFilter !== 'all') && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCountryFilter('all');
                    setVerificationFilter('all');
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 rounded-lg font-semibold transition-all duration-200
                  flex items-center gap-3
                  ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                  }
                `}
              >
                <svg className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading companies...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCompanies.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-lg font-medium">
                    {companies.length === 0 ? 'No companies found' : 'No companies match your filters'}
                  </p>
                  <p className="text-sm mt-1">
                    {companies.length === 0 ? 'No companies in the database' : 'Try adjusting your search or filters'}
                  </p>
                </div>
              ) : (
                sortedCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {company.requestVerify && !company.isVerified && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium animate-pulse">
                            ⚡ Requesting
                          </span>
                        )}
                        {company.isVerified && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ✓ Verified
                          </span>
                        )}
                        {!company.isVerified && !company.requestVerify && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Company Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {company.companyName}
                    </h3>

                    {/* Quick Info */}
                    <div className="space-y-2 mb-6 text-sm text-gray-600">
                      {company.email && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}
                      {company.country && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{company.country}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Joined {formatDate(company.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(company)}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        See Details
                      </button>
                      {company.requestVerify && !company.isVerified && (
                        <>
                          <button
                            onClick={() => handleVerify(company.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReject(company.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            title="Reject"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        {/* Detail Modal */}
        {showDetailModal && selectedCompany && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 border-b border-purple-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{selectedCompany.companyName}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  {selectedCompany.requestVerify && !selectedCompany.isVerified && (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">
                      ⚡ Requesting Verification
                    </span>
                  )}
                  {selectedCompany.isVerified && (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      {selectedCompany.email && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <p className="text-gray-900 font-medium">{selectedCompany.email}</p>
                        </div>
                      )}
                      {selectedCompany.phoneNumber && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phone</p>
                          <p className="text-gray-900 font-medium">{selectedCompany.phoneNumber}</p>
                        </div>
                      )}
                      {selectedCompany.website && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Website</p>
                          <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">
                            {selectedCompany.website}
                          </a>
                        </div>
                      )}
                      {selectedCompany.country && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Country</p>
                          <p className="text-gray-900 font-medium">{selectedCompany.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Business Details
                    </h3>
                    <div className="space-y-3">
                      {selectedCompany.tin && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tax ID (TIN)</p>
                          <p className="text-gray-900 font-medium">{selectedCompany.tin}</p>
                        </div>
                      )}
                      {selectedCompany.businessLicence && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Business Licence</p>
                          <p className="text-gray-900 font-medium">{selectedCompany.businessLicence}</p>
                        </div>
                      )}
                      {selectedCompany.establishedDate && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Established Date</p>
                          <p className="text-gray-900 font-medium">{formatDate(selectedCompany.establishedDate)}</p>
                        </div>
                      )}
                      {selectedCompany.address && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-gray-900 font-medium">{selectedCompany.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Description */}
                {selectedCompany.businessDescription && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Business Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedCompany.businessDescription}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="text-gray-900 font-medium">{formatDate(selectedCompany.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="text-gray-900 font-medium">{formatDate(selectedCompany.updatedAt)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedCompany.requestVerify && !selectedCompany.isVerified && (
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleVerify(selectedCompany.id)}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                    >
                      ✓ Approve Verification
                    </button>
                    <button
                      onClick={() => handleReject(selectedCompany.id)}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
                    >
                      ✕ Reject Verification
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

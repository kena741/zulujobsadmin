'use client';

import { useEffect, useState, useMemo } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

interface Freelancer {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  gender: string | null;
  age: number | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_links: string[] | Array<{ link: string; description?: string | null; technologies?: string[] | null }> | null;
  professional_title: string | null;
  about: string | null;
  profile_image: string | null;
  profile_completion: number | null;
  created_at: string;
  updated_at: string;
  services: string[] | null;
  skills: Array<{ name: string; level: string }> | null;
  work_experiences: Array<{
    title: string;
    company: string;
    type: string;
    location: string;
    start_date: string;
    end_date: string | null;
    technologies: string[];
    description: string;
  }> | null;
  education: Array<{
    institution: string;
    field: string;
    degree: string | null;
    start_date: string;
    end_date: string;
    coursework: string | null;
  }> | null;
  certifications: Array<{
    name: string;
    issuer: string;
    start_date: string;
    end_date: string | null;
  }> | null;
  languages: Array<{
    name: string;
    proficiency: string;
  }> | null;
}

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileCompletionFilter, setProfileCompletionFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const { data, error } = await supabase
          .from('freelancers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFreelancers(data || []);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  const handleViewDetails = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = freelancers
      .map(f => f.location)
      .filter((loc): loc is string => loc !== null && loc !== undefined && loc.trim() !== '');
    return Array.from(new Set(locations)).sort();
  }, [freelancers]);

  // Filter freelancers
  const filteredFreelancers = useMemo(() => {
    let filtered = freelancers;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => {
        const fullName = f.full_name || `${f.first_name || ''} ${f.last_name || ''}`.trim();
        return (
          fullName.toLowerCase().includes(query) ||
          f.email?.toLowerCase().includes(query) ||
          f.professional_title?.toLowerCase().includes(query) ||
          f.location?.toLowerCase().includes(query)
        );
      });
    }

    // Profile completion filter
    if (profileCompletionFilter !== 'all') {
      filtered = filtered.filter(f => {
        const completion = f.profile_completion || 0;
        switch (profileCompletionFilter) {
          case 'high':
            return completion >= 80;
          case 'medium':
            return completion >= 50 && completion < 80;
          case 'low':
            return completion < 50;
          default:
            return true;
        }
      });
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(f => f.location === locationFilter);
    }

    return filtered;
  }, [freelancers, searchQuery, profileCompletionFilter, locationFilter]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50 lg:ml-64">
        <Header title="Freelancers" />
        
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
                    placeholder="Search by name, email, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Profile Completion Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Completion</label>
                <select
                  value={profileCompletionFilter}
                  onChange={(e) => setProfileCompletionFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="high">High (80%+)</option>
                  <option value="medium">Medium (50-79%)</option>
                  <option value="low">Low (&lt;50%)</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || profileCompletionFilter !== 'all' || locationFilter !== 'all') && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setProfileCompletionFilter('all');
                    setLocationFilter('all');
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading freelancers...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">All Freelancers</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredFreelancers.length} of {freelancers.length} freelancers
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Completion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFreelancers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          {freelancers.length === 0 ? 'No freelancers found' : 'No freelancers match your filters'}
                        </td>
                      </tr>
                    ) : (
                      filteredFreelancers.map((freelancer) => (
                        <tr key={freelancer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {freelancer.full_name || `${freelancer.first_name || ''} ${freelancer.last_name || ''}`.trim() || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{freelancer.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{freelancer.professional_title || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${freelancer.profile_completion || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{freelancer.profile_completion || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(freelancer.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetails(freelancer)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Detail Modal */}
        {showDetailModal && selectedFreelancer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 border-b border-purple-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {selectedFreelancer.full_name || `${selectedFreelancer.first_name || ''} ${selectedFreelancer.last_name || ''}`.trim() || 'Freelancer Profile'}
                </h2>
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
                {/* Profile Header with Image */}
                <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                  {selectedFreelancer.profile_image && (
                    <div className="flex-shrink-0">
                      <img
                        src={selectedFreelancer.profile_image}
                        alt={selectedFreelancer.full_name || 'Profile'}
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedFreelancer.full_name || `${selectedFreelancer.first_name || ''} ${selectedFreelancer.last_name || ''}`.trim() || 'Freelancer'}
                    </h3>
                    {selectedFreelancer.professional_title && (
                      <p className="text-lg text-gray-600 mb-3">{selectedFreelancer.professional_title}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {selectedFreelancer.email && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {selectedFreelancer.email}
                        </div>
                      )}
                      {selectedFreelancer.location && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {selectedFreelancer.location}
                        </div>
                      )}
                      {selectedFreelancer.age && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {selectedFreelancer.age} years old
                        </div>
                      )}
                      {selectedFreelancer.gender && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {selectedFreelancer.gender}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      {selectedFreelancer.first_name && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">First Name</p>
                          <p className="text-gray-900 font-medium">{selectedFreelancer.first_name}</p>
                        </div>
                      )}
                      {selectedFreelancer.last_name && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Last Name</p>
                          <p className="text-gray-900 font-medium">{selectedFreelancer.last_name}</p>
                        </div>
                      )}
                      {selectedFreelancer.full_name && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Full Name</p>
                          <p className="text-gray-900 font-medium">{selectedFreelancer.full_name}</p>
                        </div>
                      )}
                      {selectedFreelancer.email && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <p className="text-gray-900 font-medium">{selectedFreelancer.email}</p>
                        </div>
                      )}
                      {selectedFreelancer.professional_title && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Professional Title</p>
                          <p className="text-gray-900 font-medium">{selectedFreelancer.professional_title}</p>
                        </div>
                      )}
                      {selectedFreelancer.location && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <p className="text-gray-900 font-medium">{selectedFreelancer.location}</p>
                        </div>
                      )}
                      {selectedFreelancer.age && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Age</p>
                          <p className="text-gray-900 font-medium">{selectedFreelancer.age} years</p>
                        </div>
                      )}
                      {selectedFreelancer.gender && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Gender</p>
                          <p className="text-gray-900 font-medium">{selectedFreelancer.gender}</p>
                        </div>
                      )}
                      {selectedFreelancer.user_id && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">User ID</p>
                          <p className="text-gray-900 font-medium text-xs font-mono">{selectedFreelancer.user_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Links & Social
                    </h3>
                    <div className="space-y-3">
                      {selectedFreelancer.linkedin_url && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">LinkedIn</p>
                          <a href={selectedFreelancer.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium text-sm break-all">
                            {selectedFreelancer.linkedin_url}
                          </a>
                        </div>
                      )}
                      {selectedFreelancer.github_url && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">GitHub</p>
                          <a href={selectedFreelancer.github_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium text-sm break-all">
                            {selectedFreelancer.github_url}
                          </a>
                        </div>
                      )}
                      {selectedFreelancer.portfolio_links && selectedFreelancer.portfolio_links.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Portfolio Links</p>
                          <div className="space-y-2">
                            {selectedFreelancer.portfolio_links.map((item, index) => {
                              const link = typeof item === 'string' ? item : item.link;
                              const description = typeof item === 'object' ? item.description : null;
                              const technologies = typeof item === 'object' ? item.technologies : null;
                              return (
                                <div key={index} className="border-l-2 border-purple-200 pl-3">
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-purple-600 hover:text-purple-700 font-medium text-sm break-all"
                                  >
                                    {link}
                                  </a>
                                  {description && (
                                    <p className="text-xs text-gray-600 mt-1">{description}</p>
                                  )}
                                  {technologies && technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {technologies.map((tech, techIndex) => (
                                        <span key={techIndex} className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Profile Completion</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${selectedFreelancer.profile_completion || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 font-medium">{selectedFreelancer.profile_completion || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Freelancer ID</p>
                      <p className="text-gray-900 font-medium text-xs font-mono break-all">{selectedFreelancer.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Joined</p>
                      <p className="text-gray-900 font-medium">{formatDate(selectedFreelancer.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                      <p className="text-gray-900 font-medium">{formatDate(selectedFreelancer.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* About */}
                {selectedFreelancer.about && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      About
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedFreelancer.about}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedFreelancer.skills && selectedFreelancer.skills.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFreelancer.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                        >
                          {skill.name} ({skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services */}
                {selectedFreelancer.services && selectedFreelancer.services.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Services
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFreelancer.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {selectedFreelancer.work_experiences && selectedFreelancer.work_experiences.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {selectedFreelancer.work_experiences.map((exp, index) => (
                        <div key={index} className="border-l-4 border-purple-600 pl-4">
                          <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                          <p className="text-gray-600">{exp.company} • {exp.type}</p>
                          <p className="text-sm text-gray-500">{exp.location}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                          </p>
                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {exp.technologies.map((tech, techIndex) => (
                                <span key={techIndex} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedFreelancer.education && selectedFreelancer.education.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9" />
                      </svg>
                      Education
                    </h3>
                    <div className="space-y-4">
                      {selectedFreelancer.education.map((edu, index) => (
                        <div key={index} className="border-l-4 border-indigo-600 pl-4">
                          <h4 className="font-semibold text-gray-900">{edu.institution}</h4>
                          <p className="text-gray-600">{edu.field} {edu.degree && `• ${edu.degree}`}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                          </p>
                          {edu.coursework && (
                            <p className="text-sm text-gray-700 mt-2">{edu.coursework}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {selectedFreelancer.certifications && selectedFreelancer.certifications.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Certifications
                    </h3>
                    <div className="space-y-3">
                      {selectedFreelancer.certifications.map((cert, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(cert.start_date)} {cert.end_date && `- ${formatDate(cert.end_date)}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedFreelancer.languages && selectedFreelancer.languages.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFreelancer.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
                        >
                          {lang.name} ({lang.proficiency})
                        </span>
                      ))}
                    </div>
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

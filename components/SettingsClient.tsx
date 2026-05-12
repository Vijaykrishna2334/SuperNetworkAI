'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsClient({ user, profile, blockedUsers: initialBlockedUsers }: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'privacy' | 'blocked' | 'export'>('privacy');
  const [loading, setLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);

  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState(profile.profileVisibility);
  const [searchable, setSearchable] = useState(profile.searchable);
  const [showEmail, setShowEmail] = useState(profile.showEmail);
  const [showLinks, setShowLinks] = useState(profile.showLinks);

  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileVisibility,
          searchable,
          showEmail,
          showLinks,
        }),
      });

      if (response.ok) {
        alert('Privacy settings updated successfully');
      } else {
        alert('Failed to update settings');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!confirm('Are you sure you want to unblock this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blocked/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlockedUsers(blockedUsers.filter((bu: any) => bu.blockedId !== userId));
        alert('User unblocked successfully');
      }
    } catch (error) {
      console.error('Unblock error:', error);
      alert('Failed to unblock user');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/settings/export');
      const data = await response.json();

      // Download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supernetwork-data-${user.id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'privacy'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'blocked'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Blocked Users ({blockedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Export Data
          </button>
        </div>

        {activeTab === 'privacy' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PUBLIC">Public - Everyone can see your profile</option>
                  <option value="PRIVATE">Private - Only connections can see your profile</option>
                  <option value="HIDDEN">Hidden - Not searchable at all</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <div className="font-medium text-gray-900">Searchable</div>
                  <div className="text-sm text-gray-500">
                    Allow others to find you in search results
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchable}
                    onChange={(e) => setSearchable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <div className="font-medium text-gray-900">Show Email</div>
                  <div className="text-sm text-gray-500">
                    Display your email address on your profile
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEmail}
                    onChange={(e) => setShowEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <div className="font-medium text-gray-900">Show Links</div>
                  <div className="text-sm text-gray-500">
                    Display your portfolio, LinkedIn, and other links
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLinks}
                    onChange={(e) => setShowLinks(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <button
                onClick={handleSavePrivacy}
                disabled={loading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'blocked' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Blocked Users</h2>

            {blockedUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No blocked users
              </div>
            ) : (
              <div className="space-y-4">
                {blockedUsers.map((blockedUser: any) => (
                  <div
                    key={blockedUser.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {blockedUser.blocked.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {blockedUser.blocked.email}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblock(blockedUser.blockedId)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Your Data</h2>

            <div className="space-y-4">
              <p className="text-gray-600">
                Download all your data from SuperNetwork AI in JSON format. This includes your
                profile, connections, messages, and all other data associated with your account.
              </p>

              <p className="text-sm text-gray-500">
                This feature is provided in compliance with GDPR and data privacy regulations.
              </p>

              <button
                onClick={handleExportData}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Download My Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

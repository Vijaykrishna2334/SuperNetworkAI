'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Match {
  userId: string;
  score: number;
  explanation: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  profile: {
    motivations: string;
    goals: string;
    skills: string[];
    experience: string;
    workingStyle: string;
    intent: string;
    aiGeneratedProfile?: string;
  };
}

export default function DashboardClient({ user, profile, pendingRequests, connections }: any) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'connections' | 'requests'>('search');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (response.ok) {
        alert('Connection request sent!');
        // Remove from matches
        setMatches(matches.filter((m) => m.userId !== userId));
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleConnectionResponse = async (connectionId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Connection response error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
            SuperNetwork AI
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Match
          </h1>
          <p className="text-gray-600">
            Search for cofounders, teammates, or clients using natural language
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg transition relative ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-3 rounded-lg transition ${
              activeTab === 'connections'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Connections
          </button>
        </div>

        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                  placeholder='Try "technical cofounder passionate about AI" or "designer for SaaS startup"'
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            <div className="grid gap-6">
              {matches.map((match) => (
                <div key={match.userId} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {match.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">{match.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {match.score}%
                        </div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                    <div className="text-sm font-medium text-indigo-900 mb-1">
                      Why this match:
                    </div>
                    <p className="text-sm text-indigo-700">{match.explanation}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    {match.profile.aiGeneratedProfile && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Profile:</div>
                        <p className="text-sm text-gray-600">{match.profile.aiGeneratedProfile}</p>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Looking for:</div>
                      <p className="text-sm text-gray-600">{match.profile.intent}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Skills:</div>
                      <div className="flex flex-wrap gap-2">
                        {match.profile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnect(match.userId)}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Send Connection Request
                  </button>
                </div>
              ))}

              {matches.length === 0 && searchQuery && !searching && (
                <div className="text-center py-12 text-gray-500">
                  No matches found. Try a different search query.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid gap-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No pending connection requests
              </div>
            ) : (
              pendingRequests.map((request: any) => (
                <div key={request.id} className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {request.sender.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{request.sender.email}</p>
                  {request.message && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{request.message}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleConnectionResponse(request.id, 'ACCEPTED')}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleConnectionResponse(request.id, 'DECLINED')}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="grid gap-6">
            {connections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No connections yet. Start searching to find matches!
              </div>
            ) : (
              connections.map((connection: any) => {
                const otherUser = connection.senderId === user.id ? connection.receiver : connection.sender;
                return (
                  <div key={connection.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {otherUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">{otherUser.email}</p>
                      </div>
                      <Link
                        href={`/messages/${otherUser.id}`}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Message
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

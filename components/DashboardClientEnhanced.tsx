'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search, Users, Mail, Settings, LogOut, Send,
  CheckCircle, XCircle, MessageCircle, Shield, Filter
} from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { EmptyState } from './ui/EmptyState';
import { MatchCardSkeleton } from './ui/Skeleton';
import { ThemeToggle } from './ui/ThemeToggle';
import { Sparkles } from 'lucide-react';

interface Match {
  userId: string;
  score: number;
  explanation: string;
  user: {
    id: string;
    name: string;
    email?: string;
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
    availability?: string;
    timezone?: string;
    interests?: string[];
  };
}

export default function DashboardClientEnhanced({ user, profile, pendingRequests, connections }: any) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'connections' | 'requests'>('search');
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ id: string; name: string } | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    const searchPromise = fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: searchQuery,
        intentFilter: intentFilter || undefined,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setMatches(data.matches || []);
        return data.matches?.length || 0;
      });

    toast.promise(searchPromise, {
      loading: 'Searching for matches...',
      success: (count) => `Found ${count} matches!`,
      error: 'Search failed',
    });

    try {
      await searchPromise;
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleConnect = async (userId: string) => {
    const promise = fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: userId }),
    }).then(res => {
      if (res.ok) {
        setMatches(matches.filter((m) => m.userId !== userId));
        return res;
      }
      throw new Error('Failed to send request');
    });

    toast.promise(promise, {
      loading: 'Sending connection request...',
      success: 'Connection request sent!',
      error: 'Failed to send request',
    });
  };

  const handleBlockConfirm = async () => {
    if (!userToBlock) return;

    const promise = fetch('/api/blocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUserId: userToBlock.id }),
    }).then(res => {
      if (res.ok) {
        setMatches(matches.filter((m) => m.userId !== userToBlock.id));
        setBlockModalOpen(false);
        setUserToBlock(null);
        return res;
      }
      throw new Error('Failed to block user');
    });

    toast.promise(promise, {
      loading: 'Blocking user...',
      success: 'User blocked successfully',
      error: 'Failed to block user',
    });
  };

  const handleConnectionResponse = async (connectionId: string, status: 'ACCEPTED' | 'DECLINED') => {
    const promise = fetch(`/api/connections/${connectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(res => {
      if (res.ok) {
        router.refresh();
        return status;
      }
      throw new Error('Failed to update connection');
    });

    toast.promise(promise, {
      loading: 'Updating connection...',
      success: (s) => s === 'ACCEPTED' ? 'Connection accepted!' : 'Connection declined',
      error: 'Failed to update connection',
    });
  };

  const tabs = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'requests', label: 'Requests', icon: Mail, badge: pendingRequests.length },
    { id: 'connections', label: 'Connections', icon: Users, badge: connections.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SuperNetwork AI
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Avatar src={user.image} alt={user.name} size="md" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Your Perfect Match
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search for cofounders, teammates, or clients using natural language
          </p>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
                {tab.badge > 0 && (
                  <Badge variant={isActive ? 'info' : 'danger'} className="ml-2">
                    {tab.badge}
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder='Try "technical cofounder passionate about AI" or "designer for SaaS startup"'
                    />
                  </div>
                  <Button type="submit" isLoading={searching} size="lg">
                    Search
                  </Button>
                </div>
                <div className="flex gap-4 items-center">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by role:</label>
                  <select
                    value={intentFilter}
                    onChange={(e) => {
                      setIntentFilter(e.target.value);
                      if (searchQuery) handleSearch();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Roles</option>
                    <option value="cofounder">Cofounder</option>
                    <option value="teammate">Teammate</option>
                    <option value="client">Client</option>
                    <option value="advisor">Advisor</option>
                    <option value="investor">Investor</option>
                    <option value="general">General Networking</option>
                  </select>
                </div>
              </form>

              <div className="grid gap-6">
                {searching ? (
                  <>
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                  </>
                ) : matches.length > 0 ? (
                  matches.map((match, index) => (
                    <motion.div
                      key={match.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar src={match.user.image} alt={match.user.name} size="lg" />
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {match.user.name}
                            </h3>
                            {match.user.email && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{match.user.email}</p>
                            )}
                            {match.profile.availability && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {match.profile.availability} • {match.profile.timezone || 'Flexible'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            {match.score}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Match Score</div>
                        </div>
                      </div>

                      <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <div className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Why this match:
                        </div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">{match.explanation}</p>
                      </div>

                      {match.profile.aiGeneratedProfile && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile:</div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{match.profile.aiGeneratedProfile}</p>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Looking for:</div>
                        <Badge variant="info">{match.profile.intent}</Badge>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills:</div>
                        <div className="flex flex-wrap gap-2">
                          {match.profile.skills.slice(0, 6).map((skill, idx) => (
                            <Badge key={idx}>{skill}</Badge>
                          ))}
                          {match.profile.skills.length > 6 && (
                            <Badge variant="default">+{match.profile.skills.length - 6} more</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={() => handleConnect(match.userId)} className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          Send Connection Request
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUserToBlock({ id: match.userId, name: match.user.name });
                            setBlockModalOpen(true);
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Block
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : searchQuery ? (
                  <EmptyState
                    icon="search"
                    title="No matches found"
                    description="Try adjusting your search query or filters to find more matches."
                  />
                ) : null}
              </div>
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6"
            >
              {pendingRequests.length === 0 ? (
                <EmptyState
                  icon="users"
                  title="No pending requests"
                  description="You don't have any connection requests at the moment."
                />
              ) : (
                pendingRequests.map((request: any, index: number) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar src={request.sender.image} alt={request.sender.name} size="lg" />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {request.sender.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{request.sender.email}</p>
                      </div>
                    </div>
                    {request.message && (
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{request.message}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button onClick={() => handleConnectionResponse(request.id, 'ACCEPTED')} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button variant="outline" onClick={() => handleConnectionResponse(request.id, 'DECLINED')} className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'connections' && (
            <motion.div
              key="connections"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6"
            >
              {connections.length === 0 ? (
                <EmptyState
                  icon="users"
                  title="No connections yet"
                  description="Start searching to find matches and build your network!"
                  action={
                    <Button onClick={() => setActiveTab('search')}>
                      <Search className="h-4 w-4 mr-2" />
                      Search Now
                    </Button>
                  }
                />
              ) : (
                connections.map((connection: any, index: number) => {
                  const otherUser = connection.senderId === user.id ? connection.receiver : connection.sender;
                  return (
                    <motion.div
                      key={connection.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Avatar src={otherUser.image} alt={otherUser.name} size="lg" />
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {otherUser.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{otherUser.email}</p>
                          </div>
                        </div>
                        <Link href={`/messages/${otherUser.id}`}>
                          <Button>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setUserToBlock(null);
        }}
        title="Block User"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to block <strong>{userToBlock?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            You will no longer see each other in search results, and any existing connections will be removed.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setBlockModalOpen(false);
                setUserToBlock(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleBlockConfirm} className="flex-1">
              Block User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

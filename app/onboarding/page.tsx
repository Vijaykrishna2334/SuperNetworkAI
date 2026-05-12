'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Onboarding() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    motivations: '',
    goals: '',
    skills: '',
    experience: '',
    workingStyle: '',
    intent: '',
    links: '',
    availability: '',
    timezone: '',
    interests: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);

  const [aiProfile, setAiProfile] = useState('');
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGenerateProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setAiProfile(data.profile.aiGeneratedProfile);
      setShowProfileEditor(true);
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/upload/cv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.parsedData) {
        // Auto-fill form with parsed data
        setFormData((prev) => ({
          ...prev,
          skills: data.parsedData.skills?.join(', ') || prev.skills,
          experience: data.parsedData.experience || prev.experience,
          links: data.parsedData.links?.join(', ') || prev.links,
          interests: data.parsedData.interests?.join(', ') || prev.interests,
        }));
        alert('CV parsed successfully! Your profile has been auto-filled.');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      alert('Failed to parse CV. Please fill the form manually.');
    } finally {
      setCvUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiGeneratedProfile: aiProfile }),
      });

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Failed to save profile');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {session.user.name}!
          </h1>
          <p className="text-gray-600 mb-8">
            Let's create your matchmaking profile. This helps us find the perfect matches for you.
          </p>

          {!showProfileEditor ? (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What drives you? What are your motivations? *
                </label>
                <textarea
                  value={formData.motivations}
                  onChange={(e) => handleChange('motivations', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., I'm passionate about making sustainable products accessible to everyone..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your goals? *
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => handleChange('goals', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Build a SaaS product that reaches 10k users in the first year..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your skills (comma-separated) *
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., React, Node.js, Product Design, Marketing"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience & Background
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., 5 years as a software engineer, 2 failed startups, worked at Google..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Style & Preferences
                </label>
                <input
                  type="text"
                  value={formData.workingStyle}
                  onChange={(e) => handleChange('workingStyle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Remote-first, EST timezone, async communication"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you looking for? *
                </label>
                <select
                  value={formData.intent}
                  onChange={(e) => handleChange('intent', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select...</option>
                  <option value="cofounder">Cofounder</option>
                  <option value="teammate">Teammate/Early Employee</option>
                  <option value="client">Clients</option>
                  <option value="advisor">Advisor/Mentor</option>
                  <option value="investor">Investor</option>
                  <option value="general">General Networking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Links (Portfolio, LinkedIn, GitHub, etc. - comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.links}
                  onChange={(e) => handleChange('links', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., linkedin.com/in/yourname, github.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => handleChange('availability', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="weekends">Weekends only</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., EST, PST, UTC+5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => handleChange('interests', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., AI/ML, Blockchain, Climate Tech"
                />
              </div>

              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or upload your CV/Resume (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  We'll parse your CV to auto-fill your profile. Supported formats: PDF, DOC, DOCX, TXT
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleCVUpload}
                  disabled={cvUploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {cvUploading && (
                  <p className="text-sm text-indigo-600 mt-2">Parsing CV...</p>
                )}
              </div>

              <button
                onClick={handleGenerateProfile}
                disabled={loading || !formData.motivations || !formData.goals || !formData.skills || !formData.intent}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Generating Profile...' : 'Generate My Profile'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your AI-Generated Profile (Edit as needed)
                </label>
                <textarea
                  value={aiProfile}
                  onChange={(e) => setAiProfile(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={8}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowProfileEditor(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

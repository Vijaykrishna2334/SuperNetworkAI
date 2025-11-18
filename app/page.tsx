import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-indigo-600">SuperNetwork AI</div>
        <div className="space-x-4">
          <Link
            href="/auth/signin"
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-indigo-600"> Cofounder</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            AI-powered matching that connects early-stage founders and indie builders
            with aligned collaborators, teammates, and clients in 24-48 hours.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition shadow-lg"
          >
            Start Networking Now
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              AI analyzes your skills, goals, and working style to find highly
              compatible matches.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Fast Results</h3>
            <p className="text-gray-600">
              Get quality matches within 24-48 hours. No more endless scrolling
              or cold outreach.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-3xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-2">Natural Search</h3>
            <p className="text-gray-600">
              Search using natural language like "technical cofounder passionate
              about AI ethics."
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-500">
        <p>&copy; 2024 SuperNetwork AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

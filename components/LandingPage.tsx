'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Target, Zap, Sparkles, ArrowRight, Users, MessageSquare, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { ThemeToggle } from './ui/ThemeToggle';

export function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'AI analyzes your skills, goals, and working style to find highly compatible matches.',
    },
    {
      icon: Zap,
      title: 'Fast Results',
      description: 'Get quality matches within 24-48 hours. No more endless scrolling or cold outreach.',
    },
    {
      icon: Sparkles,
      title: 'Natural Search',
      description: 'Search using natural language like "technical cofounder passionate about AI ethics."',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            SuperNetwork AI
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Networking Platform
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Cofounder
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            AI-powered matching that connects early-stage founders and indie builders
            with aligned collaborators, teammates, and clients in 24-48 hours.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link href="/auth/signup">
              <Button size="lg" className="group">
                Start Networking Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 mt-24"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="inline-flex p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-32 text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
            Get matched with the right people in three simple steps
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                icon: Users,
                title: 'Complete Your Profile',
                description: 'Share your motivations, skills, and what you\'re looking for. Our AI creates a compelling profile for you.',
              },
              {
                step: '2',
                icon: Search,
                title: 'Search & Discover',
                description: 'Use natural language to find matches. Our AI ranks and explains why each person is a great fit.',
              },
              {
                step: '3',
                icon: MessageSquare,
                title: 'Connect & Collaborate',
                description: 'Send connection requests and start meaningful conversations with your matches.',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2 }}
                className="relative"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.step}
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full">
                  <step.icon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="text-center py-8 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 mt-20">
        <p>&copy; 2024 SuperNetwork AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Code2,
  Target,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  LogOut,
} from 'lucide-react';

export function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">FlowCode</span>
            </div>

            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/problems"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Problems
                  </Link>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-300">{user?.displayName}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Master Coding with{' '}
            <span className="text-primary-500">Guided</span> Practice
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            An adaptive platform that personalizes your learning journey.
            Get problem recommendations tailored to your skill level and
            watch yourself improve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated ? '/problems' : '/register'}
              className="btn btn-primary text-lg px-8 py-3"
            >
              Start Practicing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why FlowCode?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Adaptive Learning"
              description="Our algorithm identifies your weak areas and suggests problems that help you improve where it matters most."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Skill Tracking"
              description="Track your progress across 20+ concepts including arrays, dynamic programming, graphs, and more."
            />
            <FeatureCard
              icon={<Lightbulb className="w-8 h-8" />}
              title="Progressive Hints"
              description="Stuck? Use our 3-level hint system that guides you without giving away the solution."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to level up your coding skills?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands of developers who are improving their problem-solving
              abilities with personalized practice.
            </p>
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-slate-500">
          <p>Built with React, Node.js, and MongoDB</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6">
      <div className="w-12 h-12 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

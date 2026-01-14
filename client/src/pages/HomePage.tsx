import { useState, useEffect } from 'react';
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

// Typing effect component for the hero heading
function TypedHeading() {
  const fullText = "Master Coding with Guided Practice";
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNext = () => {
      setDisplayedText(fullText.slice(0, i + 1));
      i += 1;

      if (i < fullText.length) {
        const delay = 50 + Math.random() * 50; // ~50–100ms per character
        timeoutId = setTimeout(typeNext, delay);
      } else {
        // Hide cursor after typing is done
        setTimeout(() => setShowCursor(false), 1000);
      }
    };

    // Small initial delay before typing starts
    timeoutId = setTimeout(typeNext, 400);

    return () => clearTimeout(timeoutId);
  }, []);

  // Split text to highlight "Guided"
  const renderText = () => {
    const guidedIndex = displayedText.indexOf("Guided");
    if (guidedIndex === -1) {
      return <>{displayedText}</>;
    }

    const before = displayedText.slice(0, guidedIndex);
    const guidedPart = displayedText.slice(guidedIndex, guidedIndex + 6);
    const after = displayedText.slice(guidedIndex + 6);

    return (
      <>
        {before}
        <span className="text-primary-500">{guidedPart}</span>
        {after}
      </>
    );
  };

  return (
    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
      {renderText()}
      {showCursor && (
        <span className="animate-pulse text-primary-500">|</span>
      )}
    </h1>
  );
}

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
          <TypedHeading />
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
              title="Guided Mode"
              description="Daily challenges tailored to your skill level. Build streaks, track progress, and let our algorithm guide your learning journey."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Skill Tracking"
              description="Track your progress across 20+ concepts including arrays, dynamic programming, graphs, and more."
            />
            <FeatureCard
              icon={<Lightbulb className="w-8 h-8" />}
              title="AI-Powered Hints"
              description="Stuck? Get personalized hints powered by AI that analyze your code and guide you to the solution."
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
    <div className="card p-6 transition-all duration-300 hover:scale-105 hover:bg-slate-700/50 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer">
      <div className="w-12 h-12 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

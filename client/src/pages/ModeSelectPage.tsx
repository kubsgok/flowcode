import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Target, List, ArrowRight } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

export function ModeSelectPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'guided' | 'practice' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedMode) return;

    setIsLoading(true);
    try {
      if (selectedMode === 'guided') {
        // Go to self-assessment for guided mode
        navigate('/onboarding/assessment');
      } else {
        // For practice mode, complete onboarding immediately
        await authApi.completeOnboarding('practice');
        await refreshUser();
        navigate('/problems');
      }
    } catch (error) {
      console.error('Failed to set mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-12 h-12 text-primary-500" />
            <h1 className="text-4xl font-bold text-white">FlowCode</h1>
          </div>
          <p className="text-xl text-slate-300">How would you like to practice?</p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Guided Mode */}
          <button
            onClick={() => setSelectedMode('guided')}
            className={`card p-8 text-left transition-all ${
              selectedMode === 'guided'
                ? 'ring-2 ring-primary-500 bg-slate-800/80'
                : 'hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                selectedMode === 'guided' ? 'bg-primary-500' : 'bg-slate-700'
              }`}>
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Guided Mode</h2>
                <p className="text-slate-300 mb-4">
                  Personalized daily challenges based on your skill level. Build consistency with streaks and track your progress.
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Daily challenge tailored to you
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Streak tracking for motivation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Focus on your weak areas
                  </li>
                </ul>
              </div>
            </div>
            {selectedMode === 'guided' && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-primary-400">
                  We'll ask a few questions to personalize your experience
                </p>
              </div>
            )}
          </button>

          {/* Practice Mode */}
          <button
            onClick={() => setSelectedMode('practice')}
            className={`card p-8 text-left transition-all ${
              selectedMode === 'practice'
                ? 'ring-2 ring-primary-500 bg-slate-800/80'
                : 'hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                selectedMode === 'practice' ? 'bg-primary-500' : 'bg-slate-700'
              }`}>
                <List className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Practice Mode</h2>
                <p className="text-slate-300 mb-4">
                  Browse and solve problems at your own pace. Filter by topic, difficulty, or search for specific problems.
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Full problem library access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Filter by topic & difficulty
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Practice at your own pace
                  </li>
                </ul>
              </div>
            </div>
            {selectedMode === 'practice' && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-primary-400">
                  Jump straight into solving problems
                </p>
              </div>
            )}
          </button>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedMode || isLoading}
            className="btn btn-primary px-8 py-3 text-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Note */}
        <p className="text-center text-slate-500 text-sm mt-6">
          You can switch between modes anytime from the dashboard
        </p>
      </div>
    </div>
  );
}

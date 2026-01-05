import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Flame,
  Target,
  Trophy,
  ArrowRight,
  List,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { challengeApi, DailyChallenge, StreakInfo, SkillProfile } from '../api/challengeApi';
import { Spinner } from '../components/common/Spinner';
import { CONCEPT_LABELS } from '@flowcode/shared';
import type { Concept } from '@flowcode/shared';

export function GuidedDashboard() {
  const { user, logout } = useAuth();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [challengeData, streakData, skillData] = await Promise.all([
          challengeApi.getDailyChallenge(),
          challengeApi.getStreakInfo(),
          challengeApi.getSkillProfile(),
        ]);
        setChallenge(challengeData);
        setStreakInfo(streakData);
        setSkillProfile(skillData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStreakMessage = () => {
    if (!streakInfo) return '';

    switch (streakInfo.streakStatus) {
      case 'active':
        return "Great job! You've completed today's challenge.";
      case 'at_risk':
        return "Complete today's challenge to keep your streak!";
      case 'broken':
        return streakInfo.currentStreak === 0
          ? "Start your streak by completing today's challenge!"
          : "Your streak ended. Start a new one today!";
      default:
        return '';
    }
  };

  const getTopSkills = () => {
    if (!skillProfile?.conceptScores) return [];

    return Object.entries(skillProfile.conceptScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([concept, score]) => ({
        concept: concept as Concept,
        score,
        label: CONCEPT_LABELS[concept as Concept] || concept,
      }));
  };

  const getWeakSkills = () => {
    if (!skillProfile?.conceptScores) return [];

    return Object.entries(skillProfile.conceptScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3)
      .map(([concept, score]) => ({
        concept: concept as Concept,
        score,
        label: CONCEPT_LABELS[concept as Concept] || concept,
      }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">FlowCode</span>
              <span className="text-sm text-slate-500 ml-2">Guided Mode</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/problems"
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">All Problems</span>
              </Link>
              <span className="text-slate-300">{user?.displayName}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-500">
            {error}
          </div>
        )}

        {/* Streak Section */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  streakInfo?.currentStreak && streakInfo.currentStreak > 0
                    ? 'bg-orange-500/20'
                    : 'bg-slate-700'
                }`}>
                  <Flame className={`w-8 h-8 ${
                    streakInfo?.currentStreak && streakInfo.currentStreak > 0
                      ? 'text-orange-500'
                      : 'text-slate-500'
                  }`} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {streakInfo?.currentStreak || 0} day{streakInfo?.currentStreak !== 1 ? 's' : ''}
                  </div>
                  <div className="text-slate-400">{getStreakMessage()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Best Streak</div>
                <div className="text-xl font-semibold text-white">
                  {streakInfo?.longestStreak || 0} days
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Daily Challenge - Main Column */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              Today's Challenge
            </h2>

            {challenge ? (
              <div className="card p-6">
                {challenge.isCompleted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Challenge Complete!
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Great work! Come back tomorrow for a new challenge.
                    </p>
                    <Link
                      to="/problems"
                      className="btn btn-secondary inline-flex items-center gap-2"
                    >
                      Practice More Problems
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {challenge.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-${challenge.difficulty}`}>
                            {challenge.difficulty.charAt(0).toUpperCase() +
                              challenge.difficulty.slice(1)}
                          </span>
                          {challenge.concepts.slice(0, 2).map((concept) => (
                            <span
                              key={concept}
                              className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded"
                            >
                              {CONCEPT_LABELS[concept] || concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                      <div className="text-sm text-slate-400 mb-1">Why this problem?</div>
                      <div className="text-white">{challenge.reason}</div>
                    </div>

                    <Link
                      to={`/practice/${challenge.slug}`}
                      className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                    >
                      Start Challenge
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="card p-6 text-center">
                <Trophy className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  You've solved all available problems!
                </h3>
                <p className="text-slate-400">
                  Amazing work! Check back later for new problems.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Problems Solved</span>
                  <span className="text-white font-semibold">
                    {skillProfile?.totalProblemsSolved || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Challenges Completed</span>
                  <span className="text-white font-semibold">
                    {streakInfo?.totalChallengesCompleted || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Overall Progress</span>
                  <span className="text-white font-semibold">
                    {skillProfile?.overallScore || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top Skills */}
            {getTopSkills().length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Strongest Areas</h3>
                <div className="space-y-3">
                  {getTopSkills().map(({ concept, score, label }) => (
                    <div key={concept}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{label}</span>
                        <span className="text-slate-500">{Math.round(score)}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success-500 rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Areas */}
            {getWeakSkills().length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Areas to Improve</h3>
                <div className="space-y-3">
                  {getWeakSkills().map(({ concept, score, label }) => (
                    <div key={concept}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{label}</span>
                        <span className="text-slate-500">{Math.round(score)}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning-500 rounded-full"
                          style={{ width: `${Math.max(score, 5)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

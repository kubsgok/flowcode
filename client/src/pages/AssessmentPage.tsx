import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi, SelfAssessment } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

interface ConceptRating {
  key: keyof SelfAssessment;
  label: string;
  description: string;
}

const CONCEPTS: ConceptRating[] = [
  {
    key: 'arrays',
    label: 'Arrays & Lists',
    description: 'Working with ordered collections, indexing, iterating',
  },
  {
    key: 'strings',
    label: 'Strings',
    description: 'String manipulation, substrings, pattern matching',
  },
  {
    key: 'hashmaps',
    label: 'Hash Maps / Dictionaries',
    description: 'Key-value storage, lookups, counting',
  },
  {
    key: 'twoPointers',
    label: 'Two Pointers',
    description: 'Using two indices to traverse arrays efficiently',
  },
  {
    key: 'slidingWindow',
    label: 'Sliding Window',
    description: 'Fixed or variable size windows over arrays',
  },
  {
    key: 'linkedLists',
    label: 'Linked Lists',
    description: 'Nodes with pointers, traversal, insertion, deletion',
  },
  {
    key: 'trees',
    label: 'Trees',
    description: 'Binary trees, BSTs, tree traversals',
  },
  {
    key: 'graphs',
    label: 'Graphs',
    description: 'Nodes and edges, BFS, DFS, shortest paths',
  },
  {
    key: 'dynamicProgramming',
    label: 'Dynamic Programming',
    description: 'Breaking problems into subproblems, memoization',
  },
  {
    key: 'recursion',
    label: 'Recursion',
    description: 'Functions that call themselves, base cases',
  },
];

const RATING_LABELS = [
  { value: 1, label: 'Never heard of it', emoji: '🤔' },
  { value: 2, label: 'Heard of it, never used', emoji: '👀' },
  { value: 3, label: 'Used it a few times', emoji: '👍' },
  { value: 4, label: 'Pretty comfortable', emoji: '💪' },
  { value: 5, label: 'Could teach this', emoji: '🚀' },
];

export function AssessmentPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [ratings, setRatings] = useState<Partial<SelfAssessment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const completedCount = Object.keys(ratings).length;
  const totalCount = CONCEPTS.length;
  const isComplete = completedCount === totalCount;

  const handleRating = (concept: keyof SelfAssessment, rating: number) => {
    setRatings((prev) => ({ ...prev, [concept]: rating }));
  };

  const handleSubmit = async () => {
    if (!isComplete) return;

    setIsSubmitting(true);
    try {
      await authApi.completeOnboarding('guided', ratings as SelfAssessment);
      await refreshUser();
      setShowResults(true);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToGuided = () => {
    navigate('/guided');
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <CheckCircle2 className="w-20 h-20 text-success-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">You're All Set!</h1>
            <p className="text-slate-300">
              We've created a personalized learning path based on your responses.
            </p>
          </div>

          {/* Skill Summary */}
          <div className="card p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-white mb-4">Your Learning Profile</h2>
            <div className="space-y-3">
              {CONCEPTS.map((concept) => {
                const rating = ratings[concept.key] || 1;
                const percentage = ((rating - 1) / 4) * 100;
                return (
                  <div key={concept.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{concept.label}</span>
                      <span className="text-slate-500">
                        {RATING_LABELS[rating - 1].emoji} {RATING_LABELS[rating - 1].label}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleContinueToGuided}
            className="btn btn-primary px-8 py-3 text-lg flex items-center gap-2 mx-auto"
          >
            Start Learning
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/onboarding')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-primary-500" />
              <span className="font-semibold text-white">FlowCode</span>
            </div>
            <div className="text-sm text-slate-400">
              {completedCount}/{totalCount}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Rate Your Familiarity
          </h1>
          <p className="text-slate-400">
            Help us personalize your learning path by rating your comfort level with each topic.
          </p>
        </div>

        {/* Concept Cards */}
        <div className="space-y-4 mb-8">
          {CONCEPTS.map((concept) => (
            <div key={concept.key} className="card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">{concept.label}</h3>
                <p className="text-sm text-slate-400">{concept.description}</p>
              </div>

              {/* Rating Options */}
              <div className="flex flex-wrap gap-2">
                {RATING_LABELS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleRating(concept.key, option.value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      ratings[concept.key] === option.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span>{option.emoji}</span>
                    <span className="hidden sm:inline">{option.label}</span>
                    <span className="sm:hidden">{option.value}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className="btn btn-primary px-8 py-3 text-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              'Setting up your profile...'
            ) : !isComplete ? (
              `Rate ${totalCount - completedCount} more topic${totalCount - completedCount > 1 ? 's' : ''}`
            ) : (
              <>
                Complete Setup
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

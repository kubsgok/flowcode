import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { problemApi } from '../api/problemApi';
import { Spinner } from '../components/common/Spinner';
import {
  Code2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shuffle,
} from 'lucide-react';
import type { ProblemSummary, Difficulty, Concept } from '@flowcode/shared';
import { CONCEPT_LABELS } from '@flowcode/shared';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const POPULAR_CONCEPTS: Concept[] = [
  'arrays',
  'strings',
  'hashmaps',
  'two-pointers',
  'dynamic-programming',
  'trees',
  'graphs',
];

export function ProblemListPage() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters from URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const difficulty = searchParams.get('difficulty') as Difficulty | null;
  const concepts = searchParams.get('concepts')?.split(',').filter(Boolean) as Concept[] || [];

  const [searchInput, setSearchInput] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await problemApi.getProblems({
          page,
          limit: 20,
          search: search || undefined,
          difficulty: difficulty || undefined,
          concepts: concepts.length > 0 ? concepts : undefined,
        });

        setProblems(result.items);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch (err) {
        setError('Failed to load problems');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [page, search, difficulty, concepts.join(',')]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // Reset to page 1 when filters change
    if (!updates.page) {
      newParams.delete('page');
    }

    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || null });
  };

  const toggleConcept = (concept: Concept) => {
    const newConcepts = concepts.includes(concept)
      ? concepts.filter((c) => c !== concept)
      : [...concepts, concept];

    updateFilters({
      concepts: newConcepts.length > 0 ? newConcepts.join(',') : null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">FlowCode</span>
            </Link>

            <div className="flex items-center gap-4">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search problems..."
                  className="input pl-10"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(difficulty || concepts.length > 0) && (
                <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {(difficulty ? 1 : 0) + concepts.length}
                </span>
              )}
            </button>

            {/* Random Problem */}
            <Link to="/practice/random" className="btn btn-secondary flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Random
            </Link>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="card p-4 space-y-4">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() =>
                        updateFilters({ difficulty: difficulty === d ? null : d })
                      }
                      className={`badge cursor-pointer transition-colors ${
                        difficulty === d
                          ? `badge-${d} ring-2 ring-offset-2 ring-offset-slate-800`
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concepts */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Concepts
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CONCEPTS.map((concept) => (
                    <button
                      key={concept}
                      onClick={() => toggleConcept(concept)}
                      className={`badge cursor-pointer transition-colors ${
                        concepts.includes(concept)
                          ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {CONCEPT_LABELS[concept]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(difficulty || concepts.length > 0 || search) && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams({});
                  }}
                  className="text-sm text-primary-500 hover:text-primary-400"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-slate-400">
          {total} problem{total !== 1 ? 's' : ''} found
        </div>

        {/* Problem List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-danger-500">{error}</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No problems found. Try adjusting your filters.
          </div>
        ) : (
          <div className="space-y-2">
            {problems.map((problem) => (
              <ProblemRow key={problem.id} problem={problem} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => updateFilters({ page: String(page - 1) })}
              disabled={page <= 1}
              className="btn btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => updateFilters({ page: String(page + 1) })}
              disabled={page >= totalPages}
              className="btn btn-secondary"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ProblemRow({ problem }: { problem: ProblemSummary }) {
  return (
    <Link
      to={`/practice/${problem.slug}`}
      className="card p-4 flex items-center justify-between hover:bg-slate-750 transition-colors block"
    >
      <div className="flex items-center gap-4">
        <div>
          <h3 className="text-white font-medium hover:text-primary-400 transition-colors">
            {problem.title}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {problem.concepts.slice(0, 3).map((concept) => (
              <span
                key={concept}
                className="text-xs text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded"
              >
                {CONCEPT_LABELS[concept as Concept] || concept}
              </span>
            ))}
            {problem.concepts.length > 3 && (
              <span className="text-xs text-slate-500">
                +{problem.concepts.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`badge badge-${problem.difficulty}`}
        >
          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
        </span>
        <div className="text-right text-sm">
          <div className="text-slate-400">
            {problem.successRate?.toFixed(0) || 0}% success
          </div>
        </div>
      </div>
    </Link>
  );
}

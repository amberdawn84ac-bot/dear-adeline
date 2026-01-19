'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, TrendingUp, Sparkles, Eye, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CompetencyService, type StudentCompetency, type CompetencySummary } from '@/lib/services/competencyService';

interface CompetencyViewProps {
  userId: string;
}

export function CompetencyView({ userId }: CompetencyViewProps) {
  const [summary, setSummary] = useState<CompetencySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchCompetencies();
  }, [userId]);

  const fetchCompetencies = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const data = await CompetencyService.getCompetencySummary(userId, supabase);
      setSummary(data);
    } catch (error) {
      console.error('Error fetching competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>Loading competencies...</span>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const categories = ['all', 'math', 'science', 'writing', 'reading', 'practical'];

  const filterByCategory = (competencies: StudentCompetency[]) => {
    if (selectedCategory === 'all') return competencies;
    return competencies.filter(c => c.competency?.category === selectedCategory);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'advanced':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'competent':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'developing':
        return 'bg-amber-100 border-amber-300 text-amber-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'advanced':
        return <Sparkles className="w-4 h-4" />;
      case 'competent':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'developing':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-[var(--forest)] to-[var(--forest-dark)] text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          What This Student Can Do
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-3xl font-bold">{summary.stats.advanced}</p>
            <p className="text-sm text-white/80">Advanced</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-3xl font-bold">{summary.stats.competent}</p>
            <p className="text-sm text-white/80">Competent</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-3xl font-bold">{summary.stats.developing}</p>
            <p className="text-sm text-white/80">Developing</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-3xl font-bold">{summary.stats.total}</p>
            <p className="text-sm text-white/80">Total</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-[var(--forest)] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Advanced Competencies */}
      {filterByCategory(summary.competencies.advanced).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            Advanced Competencies
          </h3>
          <div className="grid gap-4">
            {filterByCategory(summary.competencies.advanced).map((comp) => (
              <CompetencyCard key={comp.competency_id} competency={comp} />
            ))}
          </div>
        </div>
      )}

      {/* Competent */}
      {filterByCategory(summary.competencies.competent).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Competent
          </h3>
          <div className="grid gap-4">
            {filterByCategory(summary.competencies.competent).map((comp) => (
              <CompetencyCard key={comp.competency_id} competency={comp} />
            ))}
          </div>
        </div>
      )}

      {/* Developing */}
      {filterByCategory(summary.competencies.developing).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Developing
          </h3>
          <div className="grid gap-4">
            {filterByCategory(summary.competencies.developing).map((comp) => (
              <CompetencyCard key={comp.competency_id} competency={comp} />
            ))}
          </div>
        </div>
      )}

      {/* Not Started */}
      {filterByCategory(summary.competencies.notStarted).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-500 mb-3">Not Yet Started</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {filterByCategory(summary.competencies.notStarted).map((comp) => (
              <div
                key={comp.competency_id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <p className="font-medium text-gray-700 text-sm">{comp.competency?.name}</p>
                <p className="text-xs text-gray-500 mt-1">{comp.competency?.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetencyCard({ competency }: { competency: StudentCompetency }) {
  const [showEvidence, setShowEvidence] = useState(false);

  const statusColor = getStatusColor(competency.status);
  const statusIcon = getStatusIcon(competency.status);

  return (
    <div className={`border-2 rounded-lg p-6 ${statusColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {statusIcon}
            <h4 className="font-bold">{competency.competency?.name}</h4>
          </div>
          <p className="text-sm opacity-90">{competency.competency?.description}</p>
        </div>
        <span className="text-xs font-bold uppercase px-3 py-1 bg-white/50 rounded-full">
          {competency.status}
        </span>
      </div>

      {/* Real-world applications */}
      {competency.competency?.real_world_applications && competency.competency.real_world_applications.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase opacity-70 mb-2">Real-World Uses:</p>
          <div className="flex flex-wrap gap-2">
            {competency.competency.real_world_applications.map((app, idx) => (
              <span key={idx} className="text-xs bg-white/30 px-2 py-1 rounded">
                {app}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {competency.evidence && competency.evidence.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <Eye className="w-4 h-4" />
            {showEvidence ? 'Hide' : 'View'} Evidence ({competency.evidence.length})
          </button>

          {showEvidence && (
            <div className="mt-3 space-y-2">
              {competency.evidence.map((ev: any, idx: number) => (
                <div key={idx} className="bg-white/40 rounded p-3 text-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{ev.description}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {ev.type} • {new Date(ev.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 hover:underline"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {competency.last_demonstrated && (
        <p className="text-xs opacity-70 mt-4">
          Last demonstrated: {new Date(competency.last_demonstrated).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'advanced':
      return 'bg-green-50 border-green-200 text-green-900';
    case 'competent':
      return 'bg-blue-50 border-blue-200 text-blue-900';
    case 'developing':
      return 'bg-amber-50 border-amber-200 text-amber-900';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'advanced':
      return <Sparkles className="w-4 h-4" />;
    case 'competent':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'developing':
      return <TrendingUp className="w-4 h-4" />;
    default:
      return null;
  }
}

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Circle, Sparkles, Brain, BookOpen, FlaskConical, Star } from 'lucide-react';

interface PlacementReportViewProps {
  userId: string;
}

interface SubjectPlacement {
  currentLevel: string;
  mastered: SkillEval[];
  competent: SkillEval[];
  gaps: SkillEval[];
  notIntroduced: SkillEval[];
  recommendedAction: string;
}

interface SkillEval {
  skillName: string;
  level: string;
  evidence: string;
}

interface PlacementReport {
  studentId: string;
  assessmentId: string;
  date: string;
  studentName: string;
  gradeLevel: string;
  subjects: {
    [key: string]: SubjectPlacement;
  };
  learningProfile: {
    style: string;
    pace: string;
    interests: string[];
    needsBreaksWhenStuck: boolean;
  };
  recommendations: {
    startingPoint: string;
    criticalGaps: string[];
    strengths: string[];
  };
  summary: string;
}

export function PlacementReportView({ userId }: PlacementReportViewProps) {
  const [report, setReport] = useState<PlacementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [userId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/placement/report?userId=${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('No placement assessment found');
          return;
        }
        throw new Error('Failed to fetch placement report');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error('Error fetching placement report:', err);
      setError(err.message || 'Failed to load placement report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>Loading placement report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-yellow-800">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">No Placement Assessment</p>
            <p className="text-sm text-yellow-700">This student hasn't completed a placement assessment yet.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const subjectIcons: { [key: string]: any } = {
    math: Star,
    reading: BookOpen,
    science: FlaskConical,
    hebrew: Sparkles
  };

  const subjectColors: { [key: string]: string } = {
    math: 'text-blue-600 bg-blue-50 border-blue-200',
    reading: 'text-purple-600 bg-purple-50 border-purple-200',
    science: 'text-green-600 bg-green-50 border-green-200',
    hebrew: 'text-amber-600 bg-amber-50 border-amber-200'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--forest)] to-[var(--forest-dark)] text-white rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6" />
              <h2 className="text-2xl font-bold">{report.studentName}'s Placement Report</h2>
            </div>
            <p className="text-white/80 text-sm">
              Grade Level: {report.gradeLevel} | Completed: {new Date(report.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-lg p-4">
          <p className="text-white/90">{report.summary}</p>
        </div>
      </div>

      {/* Learning Profile */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--forest)]" />
          Learning Profile
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Learning Style</p>
            <p className="text-gray-900 font-medium capitalize">{report.learningProfile.style}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Pace</p>
            <p className="text-gray-900 font-medium capitalize">{report.learningProfile.pace}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Interests</p>
            <div className="flex flex-wrap gap-2">
              {report.learningProfile.interests.map((interest, idx) => (
                <span key={idx} className="text-xs bg-[var(--forest)]/10 text-[var(--forest)] px-2 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {report.recommendations.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Focus Areas
          </h3>
          <ul className="space-y-2">
            {report.recommendations.criticalGaps.map((gap, idx) => (
              <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Subject Assessment</h3>
        {Object.entries(report.subjects).map(([subject, data]) => {
          const Icon = subjectIcons[subject] || BookOpen;
          const colorClass = subjectColors[subject] || 'text-gray-600 bg-gray-50 border-gray-200';

          return (
            <div key={subject} className={`border-2 rounded-lg p-6 ${colorClass}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <div>
                    <h4 className="text-lg font-bold capitalize">{subject}</h4>
                    <p className="text-sm opacity-80">Current Level: {data.currentLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase opacity-70">Recommendation</p>
                  <p className="text-sm font-medium">{data.recommendedAction}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {data.mastered.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Mastered
                    </p>
                    <ul className="space-y-1">
                      {data.mastered.map((skill, idx) => (
                        <li key={idx} className="text-sm opacity-90">• {skill.skillName}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.competent.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1">
                      <Circle className="w-3 h-3" /> Competent (needs reinforcement)
                    </p>
                    <ul className="space-y-1">
                      {data.competent.map((skill, idx) => (
                        <li key={idx} className="text-sm opacity-90">• {skill.skillName}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.gaps.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Gaps (needs instruction)
                    </p>
                    <ul className="space-y-1">
                      {data.gaps.map((skill, idx) => (
                        <li key={idx} className="text-sm opacity-90">• {skill.skillName}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.notIntroduced.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1">
                      Not Yet Introduced
                    </p>
                    <ul className="space-y-1">
                      {data.notIntroduced.map((skill, idx) => (
                        <li key={idx} className="text-sm opacity-90">• {skill.skillName}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Starting Point */}
      <div className="bg-[var(--forest)]/5 border-2 border-[var(--forest)]/20 rounded-lg p-6">
        <h3 className="text-lg font-bold text-[var(--forest)] mb-2">Recommended Starting Point</h3>
        <p className="text-gray-700">{report.recommendations.startingPoint}</p>
      </div>
    </div>
  );
}

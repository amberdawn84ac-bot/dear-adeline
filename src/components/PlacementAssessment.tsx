'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { MultipleChoice } from './placement/MultipleChoice';
import { ProgressIndicator } from './placement/ProgressIndicator';

interface PlacementAssessmentProps {
  userId: string;
  onComplete: (report: any) => void;
}

type Phase = 'loading' | 'warmup' | 'transition' | 'assessment' | 'complete';

interface Question {
  id: string;
  type: string;
  prompt: string;
  options: { text: string; isCorrect: boolean }[];
  subject: string;
  estimatedSeconds: number;
}

export function PlacementAssessment({ userId, onComplete }: PlacementAssessmentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warmupKey, setWarmupKey] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [completedSubjects, setCompletedSubjects] = useState(0);
  const [gradeLevel, setGradeLevel] = useState('');
  const [isProbeUp, setIsProbeUp] = useState(false);
  const [isProbeDown, setIsProbeDown] = useState(false);
  const questionStartTime = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message, currentQuestion]);

  useEffect(() => {
    startAssessment();
  }, [userId]);

  const startAssessment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/placement/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (data.alreadyCompleted) {
        const reportResponse = await fetch(`/api/placement/report?userId=${userId}`);
        const report = await reportResponse.json();
        onComplete(report);
        return;
      }

      setAssessmentId(data.assessmentId);
      setSubjects(data.subjects || ['Mathematics', 'English Language Arts', 'Science', 'Social Studies']);

      if (data.phase === 'warmup' || !data.warmupComplete) {
        setPhase('warmup');
        setMessage(data.firstMessage);
        // Fetch first warmup question key
        const warmupResponse = await fetch('/api/placement/warmup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentId: data.assessmentId })
        });
        const warmupData = await warmupResponse.json();
        setWarmupKey(warmupData.questionKey);
      } else {
        setPhase('assessment');
        await fetchNextQuestion(data.assessmentId);
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      setMessage("Sorry, I'm having trouble starting. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWarmupResponse = async () => {
    if (!input.trim() || !assessmentId || !warmupKey) return;

    setIsLoading(true);
    const userResponse = input.trim();
    setInput('');

    try {
      const response = await fetch('/api/placement/warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          questionKey: warmupKey,
          response: userResponse
        })
      });

      const data = await response.json();

      if (data.warmupComplete) {
        setPhase('transition');
        setMessage(data.message);
        setTimeout(() => {
          setPhase('assessment');
          fetchNextQuestion(assessmentId);
        }, 2000);
      } else {
        setMessage(data.question);
        setWarmupKey(data.questionKey);
      }
    } catch (error) {
      console.error('Error in warmup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextQuestion = async (aId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/placement/question?assessmentId=${aId}`);
      const data = await response.json();

      if (data.complete) {
        await completeAssessment(aId);
        return;
      }

      if (data.transition) {
        setMessage(data.message);
        setCompletedSubjects(prev => prev + 1);
        setSubjectIndex(prev => prev + 1);
        setTimeout(() => fetchNextQuestion(aId), 1500);
        return;
      }

      setCurrentQuestion(data.question);
      setGradeLevel(data.gradeLevel);
      setIsProbeUp(data.isProbeUp);
      setIsProbeDown(data.isProbeDown);
      setSubjectIndex(data.subjectIndex);
      questionStartTime.current = Date.now();
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!assessmentId || !currentQuestion) return;

    setIsLoading(true);
    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);

    try {
      await fetch('/api/placement/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          questionId: currentQuestion.id,
          answer,
          gradeLevel,
          isProbeUp,
          isProbeDown,
          timeSpent
        })
      });

      setCurrentQuestion(null);
      await fetchNextQuestion(assessmentId);
    } catch (error) {
      console.error('Error recording answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeAssessment = async (aId: string) => {
    try {
      const response = await fetch('/api/placement/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: aId })
      });

      const data = await response.json();
      setPhase('complete');
      setMessage(data.message);
      setCompletedSubjects(subjects.length);

      setTimeout(() => {
        onComplete(data.placements);
      }, 2000);
    } catch (error) {
      console.error('Error completing assessment:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleWarmupResponse();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg border-2 border-[var(--forest)] shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 bg-[var(--forest)] text-white rounded-t-lg flex items-center gap-3">
        <Sparkles className="w-5 h-5" />
        <div>
          <h3 className="font-semibold text-lg">Getting to Know You</h3>
          <p className="text-sm text-white/80">This helps me understand where to start</p>
        </div>
      </div>

      {/* Progress (only show in assessment phase) */}
      {(phase === 'assessment' || phase === 'complete') && subjects.length > 0 && (
        <ProgressIndicator
          subjects={subjects}
          currentIndex={subjectIndex}
          completedCount={completedSubjects}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {phase === 'loading' && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--forest)]" />
          </div>
        )}

        {(phase === 'warmup' || phase === 'transition') && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
              <p className="whitespace-pre-wrap">{message}</p>
            </div>
          </div>
        )}

        {phase === 'assessment' && currentQuestion && (
          <MultipleChoice
            prompt={currentQuestion.prompt}
            options={currentQuestion.options}
            onAnswer={handleAnswer}
            disabled={isLoading}
          />
        )}

        {phase === 'assessment' && !currentQuestion && isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading next question...</span>
          </div>
        )}

        {phase === 'complete' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-50 border-2 border-green-500 text-green-900 rounded-2xl px-6 py-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold">Assessment Complete!</p>
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input (only for warmup phase) */}
      {phase === 'warmup' && (
        <div className="p-4 border-t-2 border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--forest)] disabled:bg-gray-100"
            />
            <button
              onClick={handleWarmupResponse}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-[var(--forest)] text-white rounded-lg hover:bg-[var(--forest-dark)] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This isn&apos;t a test - there are no wrong answers here!
          </p>
        </div>
      )}
    </div>
  );
}

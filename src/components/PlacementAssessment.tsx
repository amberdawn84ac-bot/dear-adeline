'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface PlacementAssessmentProps {
  userId: string;
  onComplete: (report: any) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function PlacementAssessment({ userId, onComplete }: PlacementAssessmentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start assessment on mount
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
        // Student already has a recent assessment
        setIsComplete(true);
        setMessages([{
          role: 'assistant',
          content: "You've already completed a placement assessment recently. Let's get you started with learning!",
          timestamp: new Date()
        }]);

        // Fetch and return the report
        const reportResponse = await fetch(`/api/placement/report?userId=${userId}`);
        const report = await reportResponse.json();
        onComplete(report);
        return;
      }

      setAssessmentId(data.assessmentId);

      setMessages([{
        role: 'assistant',
        content: data.firstQuestion,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error starting assessment:', error);
      setMessages([{
        role: 'assistant',
        content: "Sorry, I'm having trouble starting the assessment. Please try refreshing the page.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !assessmentId || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      const response = await fetch('/api/placement/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          response: userMessage
        })
      });

      const data = await response.json();

      if (data.completed) {
        // Assessment is complete!
        setIsComplete(true);

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || "Great! I've got everything I need. Let me put together your placement report...",
          timestamp: new Date()
        }]);

        // Fetch the full report
        const reportResponse = await fetch(`/api/placement/report?assessmentId=${assessmentId}`);
        const report = await reportResponse.json();

        setTimeout(() => {
          onComplete(report);
        }, 1500);

      } else {
        // Continue assessment
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.nextQuestion,
          timestamp: new Date()
        }]);
      }

    } catch (error) {
      console.error('Error continuing assessment:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble. Could you try that again?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-[var(--forest)] text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Adeline is thinking...</span>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="flex justify-center">
            <div className="bg-green-50 border-2 border-green-500 text-green-900 rounded-2xl px-6 py-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold">Assessment Complete!</p>
                <p className="text-sm text-green-700">Creating your personalized learning plan...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="p-4 border-t-2 border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--forest)] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-[var(--forest)] text-white rounded-lg hover:bg-[var(--forest-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This isn&apos;t a test - just say &quot;I don&apos;t know&quot; if you&apos;re not sure!
          </p>
        </div>
      )}
    </div>
  );
}

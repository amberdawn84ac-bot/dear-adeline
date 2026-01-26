import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Sparkles, X, Send } from 'lucide-react';
import { TRACKS, Track } from '@/types/learning';

interface ProjectProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onProjectCreated?: () => void;
}

export function ProjectProposalModal({ isOpen, onClose, studentId, onProjectCreated }: ProjectProposalModalProps) {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [track, setTrack] = useState<Track | 'uncertain'>('uncertain');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!topic.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          conversation_context: context,
          suggested_track: track === 'uncertain' ? undefined : track,
          is_student_initiated: true, // Key flag for student agency
        }),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const data = await response.json();

      // Simple success feedback
      alert("Project Proposed! 🚀 Adeline is reviewing your idea.");

      if (onProjectCreated) onProjectCreated();
      onClose();
      setTopic('');
      setContext('');
      setTrack('uncertain');
    } catch (error) {
      console.error('Error proposing project:', error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              Propose a Project
            </h2>
            <p className="text-indigo-100 mt-1 text-sm max-w-md">
              Have a great idea? Tell Adeline what you want to learn, and she'll help you turn it into a credit-earning project!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label htmlFor="topic" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              Project Idea / Title
            </label>
            <input
              id="topic"
              placeholder="e.g., Build a robot, Write a novel, Study local birds..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="context" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              Details & Goals
            </label>
            <textarea
              id="context"
              placeholder="What do you want to do? Why does this interest you? How will you show what you learned?"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full min-h-[120px] px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all resize-y"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="track" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              Subject Area (Optional)
            </label>
            <div className="relative">
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as Track | 'uncertain')}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all appearance-none bg-white"
              >
                <option value="uncertain">I'm not sure - let Adeline decide</option>
                {TRACKS.map((t) => (
                  <option key={t} value={t}>
                    {t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!topic.trim() || isSubmitting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Proposal
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

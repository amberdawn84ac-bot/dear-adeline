'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Search
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PeerLearningService, LearningPod, MentorshipLog, PeerReview } from '@/lib/services/peerLearningService';
import { PodWorkspace } from './PodWorkspace';

interface PeerLearningHubProps {
  userId: string;
}

export function PeerLearningHub({ userId }: PeerLearningHubProps) {
  const [selectedPod, setSelectedPod] = useState<LearningPod | null>(null);
  const [pods, setPods] = useState<LearningPod[]>([]);
  const [mentoringHours, setMentoringHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pods' | 'mentorship' | 'reviews'>('pods');
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    const [studentPods, hours] = await Promise.all([
      PeerLearningService.getStudentPods(userId, supabase),
      PeerLearningService.getMentoringHours(userId, supabase)
    ]);
    setPods(studentPods);
    setMentoringHours(hours);
    setLoading(false);
  };

  if (selectedPod) {
    return (
      <PodWorkspace
        podId={selectedPod.id}
        podName={selectedPod.name}
        userId={userId}
        onBack={() => setSelectedPod(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header / Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Your Pods</p>
            <p className="text-2xl font-bold serif text-slate-800">{pods.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Mentoring Hours</p>
            <p className="text-2xl font-bold serif text-slate-800">{mentoringHours} hrs</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Peer Credits</p>
            <p className="text-2xl font-bold serif text-slate-800">{Math.floor(mentoringHours / 5)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'pods', label: 'Collaboration Pods', icon: Users },
          { id: 'mentorship', label: 'Mentorship', icon: UserPlus },
          { id: 'reviews', label: 'Peer Reviews', icon: MessageSquare }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'pods' && (
              <div className="grid md:grid-cols-2 gap-6">
                {pods.length > 0 ? (
                  pods.map((pod) => (
                    <div key={pod.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 hover:border-purple-200 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                          <Users className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">Active</span>
                      </div>
                      <h4 className="text-xl font-bold serif text-slate-800 mb-2">{pod.name}</h4>
                      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{pod.description}</p>
                      <button
                        onClick={() => setSelectedPod(pod)}
                        className="flex items-center gap-2 text-purple-600 font-bold text-sm group-hover:gap-3 transition-all"
                      >
                        Enter Workspace <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-slate-50 rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                      <Search className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold serif text-slate-800 mb-2">No active pods found</h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
                      Collaboration pods are created by teachers. Ask your teacher to join a pod to start learning with others!
                    </p>
                    <button className="px-8 py-4 bg-white text-slate-800 rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-all border border-slate-100">
                      Browse Public Pods
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mentorship' && (
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h4 className="text-2xl font-bold serif text-slate-800 mb-2">Mentorship Program</h4>
                    <p className="text-sm text-slate-500">Log your hours spent helping other students to earn "Teaching" track credits.</p>
                  </div>
                  <button className="px-8 py-4 bg-purple-600 text-white rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all">
                    Log Session
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Recent Verified Sessions</p>
                  <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-500 shadow-sm">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Algebra Basics Help</p>
                        <p className="text-xs text-slate-500">Helping Sarah M. • Jan 12, 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-slate-800">60 min</p>
                        <p className="text-[10px] text-green-600 font-bold uppercase">Verified</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                    <MessageSquare className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 max-w-xl">
                    <h4 className="text-3xl font-bold serif mb-4">Peer Review Network</h4>
                    <p className="text-indigo-100 mb-8 leading-relaxed">
                      Give and receive constructive feedback. Reviewing others' work helps you master concepts more deeply while building community.
                    </p>
                    <button className="px-10 py-5 bg-white text-indigo-600 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all">
                      Review Work
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

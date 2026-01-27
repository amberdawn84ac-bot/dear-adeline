'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, Pin, Loader2 } from 'lucide-react';

interface Discussion {
    id: string;
    title: string;
    body: string;
    author?: { display_name: string };
    is_pinned: boolean;
    is_assignment: boolean;
    project_id: string | null;
    reply_count: number;
    created_at: string;
    updated_at: string;
}

interface PodDiscussionsProps {
    podId: string;
    userId: string;
}

// ... (previous imports and interfaces)

// Add Reply Interface
interface Reply {
    id: string;
    body: string;
    author?: { display_name: string };
    created_at: string;
}

type Filter = 'all' | 'project' | 'general' | 'assignment';

export function PodDiscussions({ podId, userId }: PodDiscussionsProps) {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>('all');
    const [showNewForm, setShowNewForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newBody, setNewBody] = useState('');
    const [creating, setCreating] = useState(false);
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

    // Inside component
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyBody, setReplyBody] = useState('');

    useEffect(() => {
        loadDiscussions();
    }, [podId, filter]);

    // scaffolding for constructive feedback
    const sentenceStarters = [
        "I appreciate how you...",
        "I wonder if...",
        "Have you considered...",
        "I agree because...",
        "Another perspective is...",
    ];

    useEffect(() => {
        if (selectedDiscussion) {
            loadReplies(selectedDiscussion.id);
        }
    }, [selectedDiscussion]);

    const loadDiscussions = async () => {
        try {
            const res = await fetch(`/api/pods/${podId}/discussions?filter=${filter}`);
            const data = await res.json();
            setDiscussions(data.discussions || []);
        } catch (error) {
            console.error('Error loading discussions:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadReplies = async (discussionId: string) => {
        setLoadingReplies(true);
        try {
            // We need an API for replies. I'll assume /api/pods/:podId/discussions/:discussionId/replies
            // But wait, my API route didn't handle nested replies route.
            // I only made /api/pods/:podId/discussions (GET/POST).
            // I need to update the API to fetch replies or include them.
            // Actually DiscussionService.getPodDiscussions includes reply_count but not replies.
            // I should add a specific route for fetching a single discussion details + replies?
            // Or just fetch from supabase client directly here for speed? 
            // I'll assume I can add a `?discussionId=` to the GET route or just use client-side supabase.
            // Using client-side supabase is faster for this.

            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data } = await supabase
                .from('discussion_replies')
                .select('*, author:author_id(display_name)')
                .eq('discussion_id', discussionId)
                .order('created_at', { ascending: true });

            setReplies(data as any || []);
        } catch (error) {
            console.error('Error loading replies:', error);
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle.trim() || !newBody.trim()) return;

        setCreating(true);
        try {
            const res = await fetch(`/api/pods/${podId}/discussions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, body: newBody }),
            });

            const data = await res.json();

            if (res.ok) {
                setNewTitle('');
                setNewBody('');
                setShowNewForm(false);
                loadDiscussions();

                if (data.pending) {
                    alert('Your discussion has been submitted for review.');
                }
            }
        } catch (error) {
            console.error('Error creating discussion:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleReply = async () => {
        if (!replyBody.trim() || !selectedDiscussion) return;

        // Optimistic update? No, stick to simple.
        // I need an endpoint to post reply. DiscussionService.createReply exists.
        // My API route `POST /api/pods/:podId/discussions` handled creating discussions.
        // Did it handle replies?
        // Checking route.ts... "const { title, body, projectId } = await request.json();"
        // It creates a DISCUSSION.
        // I missed the API endpoint for CREATING REPLY.
        // I will use Server Actions or Client Supabase for now to unblock.
        // Client Supabase is fine since I have RLS policies! "Pod members can create replies".
        // So I can write directly to 'discussion_replies'.

        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        // Get current user (needed for RLS check? No, auth.uid() works in postgres)
        // But I need to insert author_id.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('discussion_replies').insert({
            discussion_id: selectedDiscussion.id,
            author_id: user.id,
            body: replyBody
        });

        if (!error) {
            setReplyBody('');
            loadReplies(selectedDiscussion.id);
            // Update local discussion reply count (optional)
        }
    };

    const filters: { id: Filter; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'project', label: 'Project Threads' },
        { id: 'general', label: 'General' },
        { id: 'assignment', label: 'Assignments' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (selectedDiscussion) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedDiscussion(null)}
                    className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                    ← Back to discussions
                </button>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        {selectedDiscussion.is_pinned && <Pin className="w-4 h-4 text-purple-500" />}
                        <h2 className="text-2xl font-bold serif text-slate-800">{selectedDiscussion.title}</h2>
                    </div>

                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 text-sm">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                            {selectedDiscussion.author?.display_name?.[0] || '?'}
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">{selectedDiscussion.author?.display_name}</p>
                            <p className="text-slate-400">{new Date(selectedDiscussion.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                        {selectedDiscussion.body}
                    </div>

                    {/* Replies Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Replies ({replies.length})
                        </h3>

                        {replies.map(reply => (
                            <div key={reply.id} className="bg-slate-50 p-6 rounded-2xl">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-slate-700 text-sm">{reply.author?.display_name || 'Unknown'}</span>
                                    <span className="text-xs text-slate-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600 text-sm">{reply.body}</p>
                            </div>
                        ))}

                        {/* Reply Form with Scaffolding */}
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Join the Conversation</p>

                            {/* Sentence Starters */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {sentenceStarters.map(starter => (
                                    <button
                                        key={starter}
                                        onClick={() => setReplyBody(prev => prev + (prev ? ' ' : '') + starter)}
                                        className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs rounded-lg hover:bg-purple-100 transition-colors font-medium"
                                    >
                                        {starter}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={replyBody}
                                onChange={e => setReplyBody(e.target.value)}
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none h-32 text-sm"
                                placeholder="Type your reply here... Be kind and constructive!"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleReply}
                                    disabled={!replyBody.trim()}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm disabled:opacity-50"
                                >
                                    Post Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* New Discussion Button/Form */}
            {!showNewForm ? (
                <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full font-bold text-sm hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Discussion
                </button>
            ) : (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Discussion Title"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <textarea
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        placeholder="What do you want to discuss?"
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={creating || !newTitle.trim() || !newBody.trim()}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm disabled:opacity-50"
                        >
                            {creating ? 'Posting...' : 'Post Discussion'}
                        </button>
                        <button
                            onClick={() => setShowNewForm(false)}
                            className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Discussions List */}
            <div className="space-y-4">
                {discussions.map((discussion) => (
                    <div
                        key={discussion.id}
                        onClick={() => setSelectedDiscussion(discussion)}
                        className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all cursor-pointer"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {discussion.is_pinned && (
                                        <Pin className="w-4 h-4 text-purple-500" />
                                    )}
                                    {discussion.is_assignment && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded">
                                            Assignment
                                        </span>
                                    )}
                                    <h3 className="font-bold text-slate-800">{discussion.title}</h3>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2">{discussion.body}</p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                    <span>{discussion.author?.display_name || 'Unknown'}</span>
                                    <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3" />
                                        <span>{discussion.reply_count} replies</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {discussions.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p>No discussions yet. Start one!</p>
                </div>
            )}
        </div>
    );
}

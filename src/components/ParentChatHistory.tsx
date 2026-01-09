'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Eye, EyeOff, Calendar, AlertCircle } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface Conversation {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages: Message[];
}

interface ParentChatHistoryProps {
    studentId: string;
    studentName: string;
}

export function ParentChatHistory({ studentId, studentName }: ParentChatHistoryProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(true);

    useEffect(() => {
        loadConversations();
    }, [studentId]);

    const loadConversations = async () => {
        try {
            const res = await fetch(`/api/conversations/list?userId=${studentId}`);
            const data = await res.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFullConversation = async (convId: string) => {
        try {
            const res = await fetch(`/api/conversations/load/${convId}?userId=${studentId}`);
            const data = await res.json();
            setSelectedConv(data.conversation);
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            {studentName}'s Chat History
                        </h2>
                        <p className="text-purple-100">
                            View learning conversations and track progress
                        </p>
                    </div>
                    <button
                        onClick={() => setShowContent(!showContent)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                    >
                        {showContent ? (
                            <>
                                <Eye className="w-4 h-4" />
                                <span>Showing Content</span>
                            </>
                        ) : (
                            <>
                                <EyeOff className="w-4 h-4" />
                                <span>Content Hidden</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading conversations...</p>
                </div>
            ) : conversations.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No conversations yet</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Conversation List */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-white mb-3">
                            All Conversations ({conversations.length})
                        </h3>
                        {conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => loadFullConversation(conv.id)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                                    selectedConv?.id === conv.id
                                        ? 'bg-purple-600/20 border-purple-500'
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white truncate">
                                            {conv.title || 'Untitled Chat'}
                                        </div>
                                        <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(conv.updated_at)}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {Array.isArray(conv.messages) ? conv.messages.length : 0} messages
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Conversation Content */}
                    <div>
                        {selectedConv ? (
                            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                                <div className="mb-4 pb-4 border-b border-slate-700">
                                    <h3 className="text-lg font-bold text-white">
                                        {selectedConv.title || 'Conversation'}
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {formatDate(selectedConv.created_at)}
                                    </p>
                                </div>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {showContent ? (
                                        Array.isArray(selectedConv.messages) && selectedConv.messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg ${
                                                    msg.role === 'user'
                                                        ? 'bg-blue-600/20 border border-blue-700/50'
                                                        : 'bg-purple-600/20 border border-purple-700/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold text-slate-300 uppercase">
                                                        {msg.role === 'user' ? studentName : 'Adeline'}
                                                    </span>
                                                    {msg.timestamp && (
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-200 whitespace-pre-wrap">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <EyeOff className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-400">
                                                Content hidden for privacy
                                            </p>
                                            <p className="text-sm text-slate-500 mt-2">
                                                Click "Showing Content" to reveal
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
                                <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">
                                    Select a conversation to view details
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

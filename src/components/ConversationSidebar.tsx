'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Clock } from 'lucide-react';

interface Conversation {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: number;
}

interface ConversationSidebarProps {
    userId: string;
    currentConversationId?: string;
    onSelectConversation: (conversationId: string) => void;
    onNewConversation: () => void;
}

export function ConversationSidebar({
    userId,
    currentConversationId,
    onSelectConversation,
    onNewConversation
}: ConversationSidebarProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    // Load conversation list
    useEffect(() => {
        loadConversations();
    }, [userId]);

    const loadConversations = async () => {
        try {
            const response = await fetch(`/api/conversations/list?userId=${userId}`);
            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteConversation = async (conversationId: string) => {
        if (!confirm('Delete this conversation?')) return;
        
        try {
            await fetch(`/api/conversations/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, userId })
            });
            
            // Remove from list
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            
            // If deleting current conversation, start new one
            if (conversationId === currentConversationId) {
                onNewConversation();
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="w-64 bg-slate-900/50 border-r border-slate-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <button
                    onClick={onNewConversation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">New Chat</span>
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? (
                    <div className="text-center text-slate-400 p-4">
                        <Clock className="w-6 h-6 mx-auto mb-2 animate-spin" />
                        Loading...
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center text-slate-400 p-4 text-sm">
                        No conversations yet
                    </div>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`group relative rounded-lg p-3 cursor-pointer transition ${
                                conv.id === currentConversationId
                                    ? 'bg-purple-600/20 border border-purple-500'
                                    : 'hover:bg-slate-800 border border-transparent'
                            }`}
                            onClick={() => onSelectConversation(conv.id)}
                        >
                            <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 flex-shrink-0 mt-1 text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate">
                                        {conv.title || 'Untitled Chat'}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {formatDate(conv.updated_at)} • {conv.message_count} msgs
                                    </div>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteConversation(conv.id);
                                }}
                                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-600/20 transition"
                                title="Delete conversation"
                            >
                                <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Stats */}
            <div className="p-3 border-t border-slate-700 text-xs text-slate-400 text-center">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
}

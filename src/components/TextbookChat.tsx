'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Bot } from 'lucide-react';
import MessageContent from '@/components/MessageContent';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface TextbookChatProps {
    userId: string;
    title: string;
    context: string; // The "context" to prime the AI with (e.g. event description, sources)
    onClose: () => void;
    studentName?: string;
}

export default function TextbookChat({ userId, title, context, onClose, studentName }: TextbookChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // We construct a special prompt that includes the context
            // We send the FULL history to the chat API, but the very first message
            // or the system prompt needs to know about the context.
            // Since /api/chat is generic, we can prepend a system-like user message if the history is empty,
            // OR we can just add the context to the current message if it's the first one.

            // Approach: If it's the first message, prepend context.
            let messagesToSend = [...messages, userMsg];

            // If this is the start of the chat, we inject the context into the conversation
            // invisible to the user UI but visible to the AI.
            if (messages.length === 0) {
                messagesToSend = [
                    {
                        role: 'user',
                        content: `(System Context: Student is asking about "${title}". \nDetails: ${context}. \nStudent Name: ${studentName || 'Student'}). \n\n${input}`
                    }
                ];
            }

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messagesToSend,
                    userId,
                    studentInfo: { name: studentName }, // Minimal info needed
                    // we don't pass conversationId so it doesn't pollute the main history?
                    // actually we probably SHOULD save it, but for now let's keep it ephemeral 
                    // or let /api/chat generate a new one. 
                    // If we don't pass conversationId, it creates a new one each time.
                })
            });

            if (!res.ok) throw new Error('Failed to send');

            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.content
            }]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having a little trouble connecting right now. Try again?"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-[var(--forest)] text-white">
                <div>
                    <h3 className="font-bold flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        Ask Adeline
                    </h3>
                    <p className="text-xs opacity-80 truncate max-w-[250px]">
                        Re: {title}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--cream)]">
                {messages.length === 0 && (
                    <div className="text-center text-[var(--charcoal-light)] mt-10">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm">
                            I'm ready to discuss <strong>{title}</strong>!
                        </p>
                        <p className="text-xs mt-2 opacity-60">
                            Ask me about the history, science, or how this connects to God's design.
                        </p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                ? 'bg-[var(--forest)] text-white rounded-br-none'
                                : 'bg-white text-[var(--charcoal)] border border-[var(--cream-dark)] rounded-bl-none'
                            }`}>
                            {m.role === 'assistant' ? (
                                <MessageContent content={m.content} />
                            ) : (
                                m.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-3 rounded-2xl border border-[var(--cream-dark)] flex gap-1">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-[var(--cream-dark)]">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="flex-1 px-4 py-2 bg-[var(--cream)] border-transparent rounded-xl focus:bg-white focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition-all outline-none text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-[var(--forest)] text-white rounded-xl hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

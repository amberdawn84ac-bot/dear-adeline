'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ConversationBubble, ConversationOption, ConversationFlow } from './ConversationElements';
import { useRouter } from 'next/navigation';
import LessonCard, { LessonData } from './LessonCard';
import { Sparkles } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    speaker: 'adeline' | 'student';
    lesson?: LessonData;
}

const ConversationUI: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [interests, setInterests] = useState<string[]>([]);
    const [interestInput, setInterestInput] = useState<string>('');

    useEffect(() => {
        // Fetch initial interests
        const fetchInterests = async () => {
            try {
                const res = await fetch('/api/student-interests/get');
                if (res.ok) {
                    const { data } = await res.json();
                    if (data && data.interests) {
                        setInterests(data.interests);
                    }
                }
            } catch (err) {
                console.error('Failed to load interests', err);
            }
        };
        fetchInterests();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (input.trim() === '') return;

        const newMessage: Message = { id: messages.length + 1, text: input, speaker: 'student' };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/adeline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input }),
            });

            const data = await response.json();

            if (response.ok) {
                const adelineResponse: Message = {
                    id: messages.length + 2,
                    text: data.message,
                    speaker: 'adeline',
                };
                setMessages((prevMessages) => [...prevMessages, adelineResponse]);
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorResponse: Message = {
                id: messages.length + 2,
                text: 'Error: Could not connect to the server.',
                speaker: 'adeline',
            };
            setMessages((prevMessages) => [...prevMessages, errorResponse]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddInterest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!interestInput.trim()) return;

        const newInterest = interestInput.trim();
        const updatedInterests = [...interests, newInterest];

        setInterests(updatedInterests);
        setInterestInput('');

        try {
            await fetch('/api/student-interests/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interests: updatedInterests }),
            });
        } catch (err) {
            console.error('Failed to save interest', err);
        }
    };

    const handleGenerateLesson = async () => {
        if (interests.length === 0) {
            alert('Please add some interests first!');
            return;
        }

        setLoading(true);
        const newMessage: Message = { id: messages.length + 1, text: "Can you create a lesson plan for me based on my interests?", speaker: 'student' };
        setMessages((prev) => [...prev, newMessage]);

        try {
            const response = await fetch('/api/adeline/generate-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interests, age: 10 }),
            });

            const data = await response.json();

            if (response.ok && data.lesson) {
                const adelineResponse: Message = {
                    id: messages.length + 2,
                    text: `I've created a special lesson plan for you! 🌟`,
                    speaker: 'adeline',
                    lesson: data.lesson
                };
                setMessages((prev) => [...prev, adelineResponse]);
            } else {
                throw new Error(data.error);
            }

        } catch (error) {
            console.error(error);
            const errorResponse: Message = {
                id: messages.length + 2,
                text: "I'm having trouble generating a lesson right now. Please try again.",
                speaker: 'adeline',
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLesson = async (lesson: LessonData) => {
        try {
            await fetch('/api/personalized-lessons/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...lesson,
                    content: { steps: lesson.steps, materials: lesson.materials, goals: lesson.learning_goals },
                    generated_from_interests: interests
                }),
            });
        } catch (error) {
            console.error('Failed to save lesson', error);
            alert('Failed to save lesson to your library.');
        }
    };

    return (
        <div className="flex flex-col h-full bg-cream">
            <div className="flex-1 overflow-y-auto p-4">
                <ConversationFlow>
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col gap-2">
                            <ConversationBubble speaker={msg.speaker}>
                                {msg.text}
                            </ConversationBubble>
                            {msg.lesson && (
                                <div className="ml-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <LessonCard lesson={msg.lesson} onSave={handleSaveLesson} />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <ConversationBubble speaker="adeline">
                            <span className="animate-pulse">Adeline is thinking... 🧠</span>
                        </ConversationBubble>
                    )}
                </ConversationFlow>
                <div ref={messagesEndRef} />
            </div>

            {/* Student Interests Section */}
            <div className="p-4 bg-white/50 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">My Interests</div>
                    <button
                        onClick={handleGenerateLesson}
                        disabled={loading || interests.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={12} />
                        Generate Lesson
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {interests.map((interest, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium border border-purple-200">
                            {interest}
                        </span>
                    ))}
                    {interests.length === 0 && <span className="text-gray-400 text-xs italic">Add interests to generate lessons!</span>}
                </div>

                <form onSubmit={handleAddInterest} className="flex gap-2">
                    <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        placeholder="Add an interest (e.g., Robots, Dinosaurs)..."
                        className="flex-1 text-xs p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <button type="submit" className="text-xs px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors font-bold uppercase">
                        Add
                    </button>
                </form>
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-light"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple-dark focus:outline-none focus:ring-2 focus:ring-purple-light"
                        disabled={loading}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConversationUI;

// Re-export ConversationElements for convenience
export { ConversationBubble, ConversationOption, ConversationFlow } from './ConversationElements';
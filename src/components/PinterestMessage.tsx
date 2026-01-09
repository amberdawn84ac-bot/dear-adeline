'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface PinterestMessageProps {
    content: string;
    role: 'user' | 'assistant';
    timestamp?: string;
}

const NOTE_COLORS = [
    'bg-yellow-100 border-yellow-300',
    'bg-pink-100 border-pink-300',
    'bg-blue-100 border-blue-300',
    'bg-green-100 border-green-300',
    'bg-purple-100 border-purple-300',
];

const TAPE_STYLES = [
    'left-4 -top-2 rotate-[-5deg]',
    'right-4 -top-2 rotate-[5deg]',
    'left-8 -top-2 rotate-[3deg]',
    'right-8 -top-2 rotate-[-3deg]',
];

export function PinterestMessage({ content, role, timestamp }: PinterestMessageProps) {
    // Pick consistent color based on role
    const colorIndex = role === 'user' ? 2 : 0; // Blue for user, yellow for Adeline
    const noteColor = NOTE_COLORS[colorIndex];
    const tapeStyle = TAPE_STYLES[Math.floor(Math.random() * TAPE_STYLES.length)];
    
    if (role === 'user') {
        // User messages: Simple handwritten note
        return (
            <div className="flex justify-end mb-6">
                <div className="max-w-md">
                    <div className={`${noteColor} border-2 rounded-lg p-4 shadow-lg relative transform rotate-1 hover:rotate-0 transition-transform`}>
                        {/* Washi Tape */}
                        <div className={`absolute ${tapeStyle} w-16 h-6 bg-gradient-to-r from-pink-300 via-yellow-200 to-blue-300 opacity-70 rounded`}></div>
                        
                        {/* Content */}
                        <div className="font-handwriting text-gray-800 text-base leading-relaxed">
                            {content}
                        </div>
                        
                        {/* Timestamp */}
                        {timestamp && (
                            <div className="text-xs text-gray-500 mt-2 text-right font-sans">
                                {timestamp}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Adeline messages: Fancy sticky note with doodles
    return (
        <div className="flex justify-start mb-6">
            <div className="max-w-2xl">
                <div className={`${noteColor} border-2 rounded-lg p-6 shadow-xl relative transform -rotate-1 hover:rotate-0 transition-transform`}>
                    {/* Washi Tape */}
                    <div className={`absolute ${tapeStyle} w-20 h-6 bg-gradient-to-r from-purple-300 via-pink-200 to-orange-300 opacity-70 rounded`}></div>
                    
                    {/* Doodle accent in corner */}
                    <div className="absolute bottom-2 right-2 text-purple-300 opacity-50">
                        <svg width="40" height="40" viewBox="0 0 40 40">
                            <path d="M5,20 Q10,10 20,20 T35,20" stroke="currentColor" strokeWidth="2" fill="none" />
                            <circle cx="20" cy="5" r="3" fill="currentColor" />
                            <path d="M25,25 L30,30 M25,30 L30,25" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    
                    {/* Header with Adeline's name */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-dashed border-yellow-400">
                        <span className="text-2xl">✨</span>
                        <span className="font-handwriting text-xl text-purple-700 font-bold">
                            Adeline says:
                        </span>
                    </div>
                    
                    {/* Content with Markdown support */}
                    <div className="font-handwriting text-gray-800 text-base leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown
                            components={{
                                // Custom styles for markdown elements
                                p: ({node, ...props}) => <p className="mb-3" {...props} />,
                                strong: ({node, ...props}) => <strong className="text-purple-700 font-bold" {...props} />,
                                em: ({node, ...props}) => <em className="text-pink-600" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-none space-y-1 ml-4" {...props} />,
                                li: ({node, ...props}) => (
                                    <li className="before:content-['✦'] before:text-purple-400 before:mr-2" {...props} />
                                ),
                                code: ({node, ...props}) => (
                                    <code className="bg-purple-200 px-2 py-1 rounded text-sm font-mono" {...props} />
                                ),
                                blockquote: ({node, ...props}) => (
                                    <blockquote className="border-l-4 border-pink-400 pl-4 italic text-gray-700" {...props} />
                                ),
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                    
                    {/* Small doodles at bottom */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-yellow-300">
                        <div className="flex gap-2 text-lg">
                            <span>🌻</span>
                            <span>🦋</span>
                            <span>🌿</span>
                        </div>
                        {timestamp && (
                            <div className="text-xs text-gray-500 font-sans">
                                {timestamp}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

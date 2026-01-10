'use client';

import React from 'react';
import RoughBox from './RoughBox';
import { ArrowRight, Star, Lightbulb, Pencil } from 'lucide-react';

interface SketchnoteProps {
    content: string;
    onNoteClick?: (note: string) => void;
}

const AdelineSketchnote: React.FC<SketchnoteProps> = ({ content, onNoteClick }) => {
    // Basic Parsing: Assumes first line is Title, rest are bullets
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const title = lines[0] || "My Notes";
    const points = lines.slice(1);

    // Adeline's Sketchnote Palette
    const colors = ['#e76f51', '#2a9d8f', '#e9c46a', '#f4a261'];

    return (
        <div className="w-full max-w-4xl mx-auto p-6 my-8 bg-[#fdfcf0] rounded-xl shadow-xl overflow-hidden relative border-2 border-[#f0e6d2]">
            
            {/* Paper Texture Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Header Section */}
            <div className="flex justify-center mb-10 relative z-10 pt-4">
                <div className="transform -rotate-1 relative">
                    <RoughBox type="underline" color="#e76f51">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 px-6 py-2 font-handwriting">
                            {title.replace(/[*#]/g, '')}
                        </h2>
                    </RoughBox>
                    <Pencil className="absolute -right-8 -top-6 text-gray-400 opacity-50 w-8 h-8 transform rotate-12" />
                </div>
            </div>

            {/* Notes Grid */}
            <div className="flex flex-wrap justify-center gap-6 relative z-10 pb-8">
                {points.map((point, index) => {
                    // Randomize rotation slightly for organic feel
                    const rotate = index % 2 === 0 ? '1deg' : '-1deg';
                    const color = colors[index % colors.length];
                    const isLong = point.length > 80;
                    
                    const cleanText = point.replace(/^[-*•]\s*/, '').trim();
                    if (!cleanText) return null;

                    return (
                        <div 
                            key={index} 
                            style={{ transform: `rotate(${rotate})` }}
                            className={`relative ${isLong ? 'w-full md:w-3/4' : 'w-full md:w-[45%]'}`}
                            onClick={() => onNoteClick && onNoteClick(cleanText)}
                        >
                            <RoughBox 
                                type={isLong ? 'rectangle' : 'circle'} 
                                color={color} 
                                fill={isLong ? undefined : `${color}15`} // Slight tint for circles
                                className="w-full h-full"
                            >
                                <div className="p-4 flex flex-col items-center justify-center min-h-[100px]">
                                    {index === 0 && <Lightbulb className="mb-2 text-yellow-500 w-6 h-6" />}
                                    <p className="text-lg font-handwriting text-gray-700 leading-relaxed text-center">
                                        {cleanText}
                                    </p>
                                </div>
                            </RoughBox>
                            
                            {/* Connector Arrow (visual only, shown on larger screens) */}
                            {index < points.length - 1 && !isLong && (
                                <div className="absolute -right-5 top-1/2 text-gray-400 hidden md:block z-20">
                                    <ArrowRight className="w-5 h-5 opacity-40" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-right opacity-60 font-handwriting text-sm text-gray-500 pr-4">
                 ~ Visualized by Adeline
            </div>
        </div>
    );
};

export default AdelineSketchnote;

'use client';

import { ReactNode } from 'react';

interface PresentationCardProps {
    children: ReactNode;
    illustration?: 'wildflower' | 'child' | 'animal' | 'mushroom' | 'acorn';
    illustrationPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    colorTheme?: 'purple' | 'magenta' | 'coral' | 'blue' | 'gold';
    conversationPrompt?: string;
    onPromptClick?: () => void;
}

// Simple SVG illustrations (we'll expand these)
const illustrations = {
    wildflower: (color: string) => (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Simple wildflower illustration */}
            <circle cx="60" cy="40" r="15" stroke="black" strokeWidth="2" fill="none" />
            <circle cx="50" cy="30" r="8" fill={color} opacity="0.6" />
            <circle cx="70" cy="30" r="8" fill={color} opacity="0.6" />
            <circle cx="60" cy="20" r="8" fill={color} opacity="0.6" />
            <circle cx="50" cy="50" r="8" fill={color} opacity="0.6" />
            <circle cx="70" cy="50" r="8" fill={color} opacity="0.6" />
            <line x1="60" y1="55" x2="60" y2="100" stroke="black" strokeWidth="2" />
            <path d="M 50 70 Q 45 75 50 80" stroke="black" strokeWidth="2" fill="none" />
            <path d="M 70 75 Q 75 80 70 85" stroke="black" strokeWidth="2" fill="none" />
        </svg>
    ),
    child: (color: string) => (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Big-eyed child illustration */}
            <circle cx="60" cy="45" r="25" stroke="black" strokeWidth="2" fill="white" />
            {/* Big eyes */}
            <circle cx="52" cy="42" r="6" fill="black" />
            <circle cx="68" cy="42" r="6" fill="black" />
            <circle cx="53" cy="41" r="2" fill="white" />
            <circle cx="69" cy="41" r="2" fill="white" />
            {/* Smile */}
            <path d="M 50 52 Q 60 58 70 52" stroke="black" strokeWidth="2" fill="none" />
            {/* Hair with color */}
            <path d="M 40 35 Q 35 20 45 15 Q 50 10 60 10 Q 70 10 75 15 Q 85 20 80 35"
                stroke="black" strokeWidth="2" fill={color} opacity="0.3" />
            {/* Body */}
            <rect x="50" y="70" width="20" height="30" rx="10" stroke="black" strokeWidth="2" fill="white" />
        </svg>
    ),
    animal: (color: string) => (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Cute mouse */}
            <ellipse cx="60" cy="70" rx="20" ry="25" stroke="black" strokeWidth="2" fill="white" />
            {/* Ears */}
            <circle cx="45" cy="50" r="12" stroke="black" strokeWidth="2" fill={color} opacity="0.3" />
            <circle cx="75" cy="50" r="12" stroke="black" strokeWidth="2" fill={color} opacity="0.3" />
            {/* Eyes */}
            <circle cx="52" cy="65" r="4" fill="black" />
            <circle cx="68" cy="65" r="4" fill="black" />
            <circle cx="53" cy="64" r="1.5" fill="white" />
            <circle cx="69" cy="64" r="1.5" fill="white" />
            {/* Nose */}
            <circle cx="60" cy="75" r="3" fill={color} />
            {/* Whiskers */}
            <line x1="40" y1="72" x2="50" y2="72" stroke="black" strokeWidth="1" />
            <line x1="70" y1="72" x2="80" y2="72" stroke="black" strokeWidth="1" />
        </svg>
    ),
    mushroom: (color: string) => (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Whimsical mushroom */}
            <ellipse cx="60" cy="50" rx="30" ry="20" stroke="black" strokeWidth="2" fill={color} opacity="0.6" />
            <circle cx="45" cy="45" r="5" fill="white" opacity="0.8" />
            <circle cx="65" cy="48" r="4" fill="white" opacity="0.8" />
            <rect x="50" y="70" width="20" height="30" rx="5" stroke="black" strokeWidth="2" fill="white" />
        </svg>
    ),
    acorn: (color: string) => (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Cute acorn */}
            <ellipse cx="60" cy="70" rx="18" ry="22" stroke="black" strokeWidth="2" fill={color} opacity="0.4" />
            <path d="M 42 60 Q 60 50 78 60" stroke="black" strokeWidth="2" fill="none" />
            <ellipse cx="60" cy="55" rx="20" ry="8" stroke="black" strokeWidth="2" fill={color} opacity="0.6" />
            <rect x="58" y="40" width="4" height="10" rx="2" fill="black" />
        </svg>
    )
};

const colorMap = {
    purple: '#6B4B7E',
    magenta: '#C7396B',
    coral: '#E89B6F',
    blue: '#5B7B8F',
    gold: '#D4A574'
};

export function PresentationCard({
    children,
    illustration,
    illustrationPosition = 'top-right',
    colorTheme = 'purple',
    conversationPrompt,
    onPromptClick
}: PresentationCardProps) {
    const color = colorMap[colorTheme];

    const positionClasses = {
        'top-right': 'top-0 right-0 translate-x-4 -translate-y-4',
        'top-left': 'top-0 left-0 -translate-x-4 -translate-y-4',
        'bottom-right': 'bottom-0 right-0 translate-x-4 translate-y-4',
        'bottom-left': 'bottom-0 left-0 -translate-x-4 translate-y-4'
    };

    return (
        <div className="relative bg-white rounded-[2.5rem] p-8 shadow-lg border-2 border-purple-light/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            {/* Illustration */}
            {illustration && (
                <div className={`absolute ${positionClasses[illustrationPosition]} z-10`}>
                    {illustrations[illustration](color)}
                </div>
            )}

            {/* Content */}
            <div className="relative z-0">
                {children}
            </div>

            {/* Conversation Prompt */}
            {conversationPrompt && (
                <button
                    onClick={onPromptClick}
                    className="mt-6 w-full p-4 rounded-2xl bg-gradient-to-r from-purple/10 to-magenta/10 border-2 border-purple/20 hover:border-magenta hover:shadow-md transition-all text-left group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-magenta flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xl">💭</span>
                        </div>
                        <p className="text-purple font-medium italic group-hover:text-magenta transition-colors">
                            {conversationPrompt}
                        </p>
                    </div>
                </button>
            )}
        </div>
    );
}

// Helper components for card content
export function CardTitle({ children }: { children: ReactNode }) {
    return (
        <h3 className="text-2xl font-bold text-purple mb-3 font-heading">
            {children}
        </h3>
    );
}

export function CardContent({ children }: { children: ReactNode }) {
    return (
        <div className="text-lg text-charcoal leading-relaxed font-body">
            {children}
        </div>
    );
}

export function CardHighlight({ children, color = 'magenta' }: { children: ReactNode; color?: string }) {
    return (
        <span className={`font-bold text-${color} bg-${color}/10 px-2 py-1 rounded-lg`}>
            {children}
        </span>
    );
}

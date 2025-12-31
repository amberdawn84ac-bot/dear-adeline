'use client';

import { ReactNode, memo } from 'react';
import MessageContent from './MessageContent';


interface ConversationBubbleProps {
    speaker: 'adeline' | 'student';
    children: ReactNode;
    illustration?: ReactNode;
    colorTheme?: 'purple' | 'magenta' | 'coral' | 'blue' | 'gold';
}

// ⚡ Bolt: Memoize ConversationBubble to prevent unnecessary re-renders.
// By wrapping the component in React.memo, we ensure it only re-renders when
// its props (speaker, children, etc.) have actually changed. This is a big
// performance win in long conversations, as it prevents the entire list of
// messages from re-rendering every time a new one is added.
const Bubble = ({
    speaker,
    children,
    illustration,
    colorTheme = 'purple'
}: ConversationBubbleProps) => {
    const isAdeline = speaker === 'adeline';

    const bubbleColors = {
        purple: 'from-purple/10 to-purple-light/10 border-purple/20',
        magenta: 'from-magenta/10 to-magenta-light/10 border-magenta/20',
        coral: 'from-coral/10 to-coral-light/10 border-coral/20',
        blue: 'from-blue/10 to-blue-light/10 border-blue/20',
        gold: 'from-gold/10 to-gold-light/10 border-gold/20'
    };

    return (
        <div className={`flex gap-4 ${isAdeline ? 'flex-row' : 'flex-row-reverse'} mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${isAdeline
                    ? 'from-purple to-magenta'
                    : 'from-coral to-gold'
                    } flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">
                        {isAdeline ? '👵' : '👧'}
                    </span>
                </div>
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 max-w-2xl ${isAdeline ? '' : 'flex justify-end'}`}>
                <div className={`bg-gradient-to-br ${bubbleColors[colorTheme]} border-2 rounded-3xl p-6 shadow-md relative`}>
                    {/* Speech bubble tail */}
                    <div className={`absolute top-4 ${isAdeline ? '-left-2' : '-right-2'} w-4 h-4 bg-white border-2 ${isAdeline ? 'border-r-0 border-b-0 border-purple/20' : 'border-l-0 border-t-0 border-coral/20'
                        } transform rotate-45`} />

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="text-charcoal font-body text-lg leading-relaxed">
                            {isAdeline && typeof children === 'string' ? (
                                <MessageContent content={children} />
                            ) : (
                                children
                            )}
                        </div>

                        {/* Illustration */}
                        {illustration && (
                            <div className="mt-4 flex justify-center">
                                {illustration}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export const ConversationBubble = memo(Bubble);

interface ConversationOptionProps {
    children: ReactNode;
    illustration?: 'books' | 'tools' | 'question' | 'lightbulb' | 'heart';
    onClick?: () => void;
    colorTheme?: 'purple' | 'magenta' | 'coral' | 'blue' | 'gold';
}

const optionIcons = {
    books: '📚',
    tools: '🔨',
    question: '❓',
    lightbulb: '💡',
    heart: '💖'
};

export function ConversationOption({
    children,
    illustration = 'lightbulb',
    onClick,
    colorTheme = 'purple'
}: ConversationOptionProps) {
    const colors = {
        purple: 'hover:border-purple hover:shadow-purple/20',
        magenta: 'hover:border-magenta hover:shadow-magenta/20',
        coral: 'hover:border-coral hover:shadow-coral/20',
        blue: 'hover:border-blue hover:shadow-blue/20',
        gold: 'hover:border-gold hover:shadow-gold/20'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full p-6 rounded-2xl bg-white border-2 border-cream shadow-md ${colors[colorTheme]} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group text-left`}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple/10 to-magenta/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {optionIcons[illustration]}
                </div>
                <div className="flex-1 text-lg font-medium text-charcoal group-hover:text-purple transition-colors">
                    {children}
                </div>
                <div className="text-purple opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                </div>
            </div>
        </button>
    );
}

interface ConversationFlowProps {
    children: ReactNode;
}

export function ConversationFlow({ children }: ConversationFlowProps) {
    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {children}
        </div>
    );
}

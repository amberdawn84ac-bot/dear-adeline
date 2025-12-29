'use client';

import { PresentationCard, CardTitle, CardContent } from '@/components/PresentationCard';
import { ConversationBubble, ConversationOption, ConversationFlow } from '@/components/ConversationUI';
import { Sparkles, BookOpen, Heart, Target, Trophy, Palette } from 'lucide-react';

interface WhimsicalDashboardProps {
    displayName: string;
    gradeLevel?: string;
    onStartLesson: () => void;
    onContinueLearning: () => void;
    onOpenJournal: () => void;
    onOpenWisdom: () => void;
}

export function WhimsicalDashboard({
    displayName,
    gradeLevel,
    onStartLesson,
    onContinueLearning,
    onOpenJournal,
    onOpenWisdom
}: WhimsicalDashboardProps) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-soft via-cream to-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Whimsical Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
                    <div className="inline-block mb-4">
                        <div className="relative">
                            {/* Decorative flowers */}
                            <div className="absolute -top-8 -left-8 text-4xl opacity-60">🌸</div>
                            <div className="absolute -top-6 -right-6 text-3xl opacity-60">🌼</div>

                            <h1 className="text-5xl md:text-6xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-purple via-magenta to-coral">
                                {getGreeting()}, {displayName}!
                            </h1>
                        </div>
                    </div>
                    <p className="text-xl text-charcoal-light font-body italic">
                        What adventure shall we embark on today, my dear?
                    </p>
                </div>

                {/* Adeline's Welcome Message */}
                <div className="mb-12">
                    <ConversationFlow>
                        <ConversationBubble speaker="adeline" colorTheme="purple">
                            <p className="mb-3">
                                Welcome back, dear one! ✨ I've been thinking about you and wondering
                                what wonderful things you'll discover today.
                            </p>
                            <p>
                                In my years of teaching, I've learned that the best learning happens
                                when curiosity leads the way. So tell me - what calls to your heart?
                            </p>
                        </ConversationBubble>
                    </ConversationFlow>
                </div>

                {/* Learning Options Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <PresentationCard
                        illustration="wildflower"
                        illustrationPosition="top-right"
                        colorTheme="purple"
                        conversationPrompt="Ready to explore something new?"
                        onPromptClick={onStartLesson}
                    >
                        <CardTitle>Start a New Lesson 📚</CardTitle>
                        <CardContent>
                            <p className="mb-3">
                                Every seed of knowledge we plant today will grow into wisdom tomorrow.
                            </p>
                            <p className="text-purple-light">
                                Let's discover something wonderful together!
                            </p>
                        </CardContent>
                    </PresentationCard>

                    <PresentationCard
                        illustration="child"
                        illustrationPosition="bottom-left"
                        colorTheme="magenta"
                        conversationPrompt="Shall we continue where we left off?"
                        onPromptClick={onContinueLearning}
                    >
                        <CardTitle>Continue Learning 🌱</CardTitle>
                        <CardContent>
                            <p className="mb-3">
                                Like a garden that needs tending, learning grows best with consistency.
                            </p>
                            <p className="text-magenta-light">
                                Pick up where your curiosity last led you!
                            </p>
                        </CardContent>
                    </PresentationCard>

                    <PresentationCard
                        illustration="animal"
                        illustrationPosition="top-left"
                        colorTheme="coral"
                        conversationPrompt="What's on your heart today?"
                        onPromptClick={onOpenJournal}
                    >
                        <CardTitle>Spiritual Journal 💖</CardTitle>
                        <CardContent>
                            <p className="mb-3">
                                A quiet place for your thoughts, prayers, and reflections.
                            </p>
                            <p className="text-coral-light">
                                Your private space to grow closer to truth.
                            </p>
                        </CardContent>
                    </PresentationCard>

                    <PresentationCard
                        illustration="mushroom"
                        illustrationPosition="bottom-right"
                        colorTheme="blue"
                        conversationPrompt="Ready to practice wisdom?"
                        onPromptClick={onOpenWisdom}
                    >
                        <CardTitle>Wisdom in Action 🌟</CardTitle>
                        <CardContent>
                            <p className="mb-3">
                                Real wisdom shows itself in the choices we make each day.
                            </p>
                            <p className="text-blue-light">
                                Let's explore a scenario together!
                            </p>
                        </CardContent>
                    </PresentationCard>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4 mb-12">
                    <h3 className="text-2xl font-heading text-purple text-center mb-6">
                        What would you like to do?
                    </h3>

                    <ConversationOption
                        illustration="books"
                        colorTheme="purple"
                        onClick={onStartLesson}
                    >
                        I want to learn something new
                    </ConversationOption>

                    <ConversationOption
                        illustration="tools"
                        colorTheme="magenta"
                        onClick={onContinueLearning}
                    >
                        I want to build or create something
                    </ConversationOption>

                    <ConversationOption
                        illustration="heart"
                        colorTheme="coral"
                        onClick={onOpenJournal}
                    >
                        I want to reflect and journal
                    </ConversationOption>

                    <ConversationOption
                        illustration="question"
                        colorTheme="blue"
                        onClick={onOpenWisdom}
                    >
                        I have a question about life
                    </ConversationOption>
                </div>

                {/* Today's Encouragement */}
                <div className="bg-gradient-to-r from-purple/10 via-magenta/10 to-coral/10 rounded-[3rem] p-10 text-center border-2 border-purple/20">
                    <div className="text-4xl mb-4">🌻</div>
                    <p className="text-xl font-body text-charcoal italic mb-2">
                        "In my years of study, I've found that..."
                    </p>
                    <p className="text-2xl font-heading text-purple">
                        Every question is a seed waiting to bloom
                    </p>
                </div>
            </div>
        </div>
    );
}

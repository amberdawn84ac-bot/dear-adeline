'use client';

import { PresentationCard, CardTitle, CardContent, CardHighlight } from '@/components/PresentationCard';
import { ConversationBubble, ConversationOption, ConversationFlow } from '@/components/ConversationUI';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function VisualDemoPage() {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-soft via-cream to-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-charcoal hover:text-purple mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-5xl font-heading text-purple mb-4">
                        ✨ Visual Learning Experience ✨
                    </h1>
                    <p className="text-xl text-charcoal-light">
                        Whimsical, Interactive, Delightful
                    </p>
                </div>

                {/* Color Palette Showcase */}
                <section className="mb-16">
                    <h2 className="text-3xl font-heading text-purple mb-6">Jewel Tone Palette</h2>
                    <div className="grid grid-cols-5 gap-4">
                        {[
                            { name: 'Purple', color: 'bg-purple', hex: '#6B4B7E' },
                            { name: 'Magenta', color: 'bg-magenta', hex: '#C7396B' },
                            { name: 'Coral', color: 'bg-coral', hex: '#E89B6F' },
                            { name: 'Blue', color: 'bg-blue', hex: '#5B7B8F' },
                            { name: 'Gold', color: 'bg-gold', hex: '#D4A574' }
                        ].map(({ name, color, hex }) => (
                            <div key={name} className="text-center">
                                <div className={`${color} h-24 rounded-2xl shadow-lg mb-2`} />
                                <p className="font-bold text-charcoal">{name}</p>
                                <p className="text-sm text-charcoal-light">{hex}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Presentation Cards */}
                <section className="mb-16">
                    <h2 className="text-3xl font-heading text-purple mb-6">Presentation Cards</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <PresentationCard
                            illustration="wildflower"
                            illustrationPosition="top-right"
                            colorTheme="purple"
                            conversationPrompt="What do you think makes flowers so colorful?"
                        >
                            <CardTitle>The Magic of Flowers 🌸</CardTitle>
                            <CardContent>
                                <p className="mb-3">
                                    In my years of study, I've found that flowers are nature's artists, my dear!
                                </p>
                                <p>
                                    Each petal is painted with <CardHighlight>purpose</CardHighlight> -
                                    to attract bees, butterflies, and other helpful friends.
                                </p>
                            </CardContent>
                        </PresentationCard>

                        <PresentationCard
                            illustration="child"
                            illustrationPosition="bottom-left"
                            colorTheme="magenta"
                            conversationPrompt="What would you like to learn today?"
                        >
                            <CardTitle>Let's Explore Together! 💖</CardTitle>
                            <CardContent>
                                <p className="mb-3">
                                    Every great discovery starts with <CardHighlight color="magenta">curiosity</CardHighlight>.
                                </p>
                                <p>
                                    Tell me, dear one, what calls to your heart today?
                                </p>
                            </CardContent>
                        </PresentationCard>

                        <PresentationCard
                            illustration="animal"
                            illustrationPosition="top-left"
                            colorTheme="coral"
                            conversationPrompt="How do you think animals help plants grow?"
                        >
                            <CardTitle>Forest Friends 🐭</CardTitle>
                            <CardContent>
                                <p className="mb-3">
                                    The forest is a <CardHighlight color="coral">community</CardHighlight>,
                                    where every creature has a role.
                                </p>
                                <p>
                                    Mice scatter seeds, bees spread pollen, and earthworms enrich the soil!
                                </p>
                            </CardContent>
                        </PresentationCard>

                        <PresentationCard
                            illustration="mushroom"
                            illustrationPosition="bottom-right"
                            colorTheme="gold"
                            conversationPrompt="What do mushrooms teach us about patience?"
                        >
                            <CardTitle>The Wisdom of Mushrooms 🍄</CardTitle>
                            <CardContent>
                                <p className="mb-3">
                                    Mushrooms remind us that <CardHighlight color="gold">growth</CardHighlight> often
                                    happens in the dark, unseen.
                                </p>
                                <p>
                                    Just like learning - sometimes the most important work is invisible!
                                </p>
                            </CardContent>
                        </PresentationCard>
                    </div>
                </section>

                {/* Conversation Flow */}
                <section className="mb-16">
                    <h2 className="text-3xl font-heading text-purple mb-6">Interactive Conversations</h2>
                    <ConversationFlow>
                        <ConversationBubble speaker="adeline" colorTheme="purple">
                            <p className="mb-2">Good morning, my dear! ☀️</p>
                            <p>
                                I've been thinking about seeds this morning. Did you know that every mighty oak
                                starts as a tiny acorn? It reminds me of how learning works too.
                            </p>
                        </ConversationBubble>

                        <ConversationBubble speaker="student" colorTheme="coral">
                            <p>How does a seed know when to grow?</p>
                        </ConversationBubble>

                        <ConversationBubble speaker="adeline" colorTheme="purple">
                            <p className="mb-2">Ah, what a wonderful question! 🌱</p>
                            <p>
                                Seeds are patient, dear one. They wait for just the right conditions -
                                warmth, water, and light. It's like they're listening to the earth,
                                waiting for the perfect moment to begin their journey.
                            </p>
                        </ConversationBubble>

                        {!selectedOption && (
                            <div className="space-y-4 mt-8">
                                <p className="text-center text-lg font-medium text-purple mb-4">
                                    What would you like to explore?
                                </p>
                                <ConversationOption
                                    illustration="books"
                                    colorTheme="purple"
                                    onClick={() => setSelectedOption('learn')}
                                >
                                    I want to learn about plant growth
                                </ConversationOption>
                                <ConversationOption
                                    illustration="tools"
                                    colorTheme="magenta"
                                    onClick={() => setSelectedOption('build')}
                                >
                                    I want to plant my own seeds
                                </ConversationOption>
                                <ConversationOption
                                    illustration="question"
                                    colorTheme="coral"
                                    onClick={() => setSelectedOption('question')}
                                >
                                    I have more questions about seeds
                                </ConversationOption>
                            </div>
                        )}

                        {selectedOption && (
                            <ConversationBubble speaker="adeline" colorTheme="magenta">
                                <p className="mb-2">Wonderful choice! ✨</p>
                                <p>
                                    Let's embark on this learning adventure together. I'll prepare a special
                                    lesson just for you, my dear.
                                </p>
                            </ConversationBubble>
                        )}
                    </ConversationFlow>
                </section>

                {/* Component Showcase */}
                <section className="mb-16">
                    <h2 className="text-3xl font-heading text-purple mb-6">Built-in Illustrations</h2>
                    <div className="grid grid-cols-5 gap-8 bg-white rounded-3xl p-8 shadow-lg">
                        <div className="text-center">
                            <div className="mb-2">🌸</div>
                            <p className="text-sm font-medium">Wildflower</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-2">👧</div>
                            <p className="text-sm font-medium">Child</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-2">🐭</div>
                            <p className="text-sm font-medium">Animal</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-2">🍄</div>
                            <p className="text-sm font-medium">Mushroom</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-2">🌰</div>
                            <p className="text-sm font-medium">Acorn</p>
                        </div>
                    </div>
                </section>

                {/* Next Steps */}
                <section className="bg-gradient-to-r from-purple to-magenta rounded-3xl p-12 text-white text-center">
                    <h2 className="text-4xl font-heading mb-4">Ready to Transform Dear Adeline?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        This is just the beginning! We'll redesign every page with these delightful,
                        whimsical components to create a magical learning experience.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block px-8 py-4 bg-white text-purple rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform"
                    >
                        Back to Dashboard
                    </Link>
                </section>
            </div>
        </div>
    );
}

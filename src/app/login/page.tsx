'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import ConversationalLogin from '@/components/ConversationalLogin';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex" style={{ background: 'var(--gradient-hero)' }}>
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="blob blob-sage w-96 h-96 -top-20 -left-20 absolute"></div>
                <div className="blob blob-rose w-80 h-80 bottom-20 right-10 absolute"></div>

                <div className="relative z-10 flex flex-col justify-center px-12 max-w-xl mx-auto">
                    <Link href="/" className="flex items-center gap-3 mb-12">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                            Dear Adeline
                        </span>
                    </Link>

                    <h1 className="text-4xl font-bold mb-6">
                        Welcome to Your<br />
                        <span className="gradient-text">Learning Journey</span>
                    </h1>

                    <p className="text-xl text-[var(--charcoal-light)] mb-8">
                        An AI-powered companion that adapts to your interests and helps you
                        build a meaningful education portfolio.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Personalized learning paths',
                            'Skills tracked toward graduation',
                            'Beautiful portfolio built automatically',
                            'Fun games and activities',
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-[var(--sage)] flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-[var(--charcoal-light)]">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Conversational Interface */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
                <div className="w-full h-[600px] lg:h-[700px] max-w-lg lg:max-w-xl">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-6 text-center">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold">Dear Adeline</span>
                        </Link>
                    </div>

                    <ConversationalLogin />
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    Loader2,
    Shield
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [role, setRole] = useState<'student' | 'teacher'>('student');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const supabase = createClient();

        try {
            if (isLogin) {
                // Login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    throw error;
                }

                if (data.user) {
                    // Get profile to check role for redirection
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();

                    if (profile?.role === 'admin') {
                        router.push('/dashboard/admin');
                    } else if (profile?.role === 'teacher') {
                        router.push('/dashboard/teacher');
                    } else {
                        router.push('/dashboard');
                    }
                }
            } else {
                // Signup
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }

                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            role: role
                        }
                    },
                });

                if (error) throw error;

                setMessage('Check your email for the confirmation link!');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

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

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold">Dear Adeline</span>
                        </Link>
                    </div>

                    <div className="card p-8">
                        {/* Tabs */}
                        <div className="flex mb-8 bg-[var(--cream)] rounded-full p-1">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${isLogin
                                    ? 'bg-white shadow text-[var(--charcoal)]'
                                    : 'text-[var(--charcoal-light)]'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${!isLogin
                                    ? 'bg-white shadow text-[var(--charcoal)]'
                                    : 'text-[var(--charcoal-light)]'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold mb-2">
                            {isLogin ? 'Welcome back!' : 'Create your account'}
                        </h2>
                        <p className="text-[var(--charcoal-light)] mb-6">
                            {isLogin
                                ? 'Enter your credentials to access your dashboard'
                                : 'Start your personalized learning journey'}
                        </p>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
                                <p className="text-green-700 text-sm">{message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">I am a...</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setRole('student')}
                                            className={`py-2 px-4 rounded-xl text-sm font-medium border-2 transition-all ${role === 'student'
                                                ? 'border-[var(--sage)] bg-[var(--sage-light)] text-[var(--sage-dark)]'
                                                : 'border-[var(--cream-dark)] text-[var(--charcoal-light)] hover:border-[var(--sage-light)]'
                                                }`}
                                        >
                                            Student
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('teacher')}
                                            className={`py-2 px-4 rounded-xl text-sm font-medium border-2 transition-all ${role === 'teacher'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-[var(--cream-dark)] text-[var(--charcoal-light)] hover:border-[var(--blue-light, #dbeafe)]'
                                                }`}
                                        >
                                            Teacher
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input pl-12"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input pl-12 pr-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--charcoal-light)] hover:text-[var(--charcoal)]"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input pl-12"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {isLogin && (
                                <div className="text-right">
                                    <Link href="/forgot-password" className="text-sm text-[var(--sage-dark)] hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-[var(--cream-dark)] text-center space-y-4">
                            <p className="text-sm text-[var(--charcoal-light)]">
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-[var(--sage-dark)] font-medium hover:underline"
                                >
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>

                            {isLogin && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 py-4">
                                        <div className="h-[1px] flex-1 bg-[var(--cream-dark)]"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Staff Access</span>
                                        <div className="h-[1px] flex-1 bg-[var(--cream-dark)]"></div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEmail('amber@dearadeline.co');
                                            // Focus password field
                                        }}
                                        className="w-full py-3 rounded-xl border-2 border-purple-100 text-purple-600 font-bold text-sm hover:bg-purple-50 hover:border-purple-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Log In to Admin Office
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-sm text-[var(--charcoal-light)] mt-6">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="text-[var(--sage-dark)] hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-[var(--sage-dark)] hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

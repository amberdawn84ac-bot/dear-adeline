'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  Target,
  GraduationCap,
  Palette,
  Leaf,
  FlaskConical,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Users,
  Brain,
  Trophy,
  ChevronDown,
  Menu,
  X,
  Heart,
  BarChart3,
  Scale,
  Globe,
  Calculator,
  Gamepad2,
  Clock,
  Star
} from 'lucide-react';

const tracks = [
  {
    name: "God's Creation & Science",
    icon: FlaskConical,
    description: "Explore the wonder of nature, biology, and the design of the universe.",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    skills: ["Nature Observation", "Physics", "Created Order"]
  },
  {
    name: "Health/Naturopathy",
    icon: Heart,
    description: "Understanding body systems and the power of natural healing.",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    skills: ["Wellness", "Nutrition", "Herbal Studies"]
  },
  {
    name: "Food Systems",
    icon: Leaf,
    description: "From seed to table—gardening, agriculture, and sustainability.",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    skills: ["Agriculture", "Soil Health", "Sustainability"]
  },
  {
    name: "Government/Economics",
    icon: BarChart3,
    description: "Stewarding resources and understanding how societies function.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    skills: ["Stewardship", "Finance", "Civics"]
  },
  {
    name: "Justice",
    icon: Scale,
    description: "Standing for truth and understanding biblical justice.",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    skills: ["Ethics", "Biblical Justice", "Duty"]
  },
  {
    name: "Discipleship",
    icon: Sparkles,
    description: "Building character and following the Way in everyday life.",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    skills: ["Character", "Faith", "Service"]
  },
  {
    name: "History",
    icon: Globe,
    description: "The story of humanity through the lens of time and providence.",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    skills: ["Providence", "Geography", "Timelines"]
  },
  {
    name: "English/Lit",
    icon: BookOpen,
    description: "The power of word, storytelling, and deep reading.",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    skills: ["Storytelling", "Analysis", "Composition"]
  },
  {
    name: "Math",
    icon: Calculator,
    description: "The orderly logic and beautiful design of numbers.",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    skills: ["Logic", "Geometry", "Order"]
  }
];

export default function ExplorationPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Nav */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Dear Adeline</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#tracks" className="text-sm font-medium text-[var(--charcoal-light)]">The 9 Tracks</a>
            <a href="#how-it-works" className="text-sm font-medium text-[var(--charcoal-light)]">The Adeline Method</a>
            <Link href="/login" className="btn-secondary py-2 text-sm">Dashboard</Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-24 pb-12 sm:pt-32 sm:pb-20 px-4 relative overflow-hidden">
        <div className="blob blob-sage w-96 h-96 -top-20 -right-20 absolute opacity-20" />
        <div className="blob blob-rose w-80 h-80 top-1/2 -left-20 absolute opacity-20" />

        <div className="container relative z-10 text-center">
          <span className="text-script text-2xl text-[var(--terracotta)] mb-4 block animate-fade-in-up">
            Individualized & Interest-Led
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto">
            Experience the <span className="gradient-text">Adeline Method</span>
          </h1>
          <p className="text-xl text-[var(--charcoal-light)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Step beyond traditional curriculum. Explore a world where your child's curiosity
            drives their education, tracked meticulously towards graduation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="btn-primary px-8">
              Join the Experience
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#tracks" className="btn-secondary px-8">
              Explore the 9 Tracks
            </a>
          </div>
        </div>
      </header>

      {/* The 9 Tracks Showcase */}
      <section id="tracks" className="section bg-white rounded-t-[3rem] lg:rounded-t-[5rem] shadow-2xl relative z-20">
        <div className="container">
          <div className="text-center mb-16 px-4">
            <h2 className="text-4xl font-bold mb-4">Curriculum for a <span className="gradient-text">New Era</span></h2>
            <p className="text-[var(--charcoal-light)] max-w-2xl mx-auto">
              Modern tracks designed for real-world impact and biblical depth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track, i) => (
              <div key={i} className="card p-8 group hover:scale-[1.02] transition-transform duration-300 border border-transparent hover:border-[var(--sage-light)]">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <track.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{track.name}</h3>
                <p className="text-[var(--charcoal-light)] text-sm mb-6 leading-relaxed">
                  {track.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {track.skills.map((skill, si) => (
                    <span key={si} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[var(--cream)] text-[var(--charcoal-light)]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Adeline Demo Visualization */}
      <section id="how-it-works" className="section relative overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-script text-2xl text-[var(--terracotta)] mb-4 block">Personalized Learning</span>
              <h2 className="text-4xl font-bold mb-6">How Adeline <span className="gradient-text-warm">Adapts to You</span></h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-[var(--terracotta)]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Interest-Led Discovery</h4>
                    <p className="text-[var(--charcoal-light)] text-sm">Adeline starts every conversation by listening. Whatever your child loves, she turns into a lesson.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0">
                    <Brain className="w-6 h-6 text-[var(--sage)]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Individualized Pacing</h4>
                    <p className="text-[var(--charcoal-light)] text-sm">She identifies mastery instantly. If they're ready to level up, she leads the way.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0">
                    <Trophy className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Hebrew Word Studies</h4>
                    <p className="text-[var(--charcoal-light)] text-sm">Daily studies reveal the original pictographic and root meanings of Scripture.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-glass p-6 max-w-md mx-auto relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold">Adeline</span>
                </div>
                <div className="space-y-4">
                  <div className="chat-bubble ai text-xs">
                    <p>Shalom! Before we dive into gardening, let's look at the Hebrew word for Seed: <strong>Zera</strong>.</p>
                  </div>
                  <div className="chat-bubble user text-xs">
                    <p>What does it mean pictographically?</p>
                  </div>
                  <div className="chat-bubble ai text-xs">
                    <p>Great question! It represents "the continuation of life." 🪴 Ready to see how this fits into our Food Systems track?</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="text-[10px] font-bold bg-[var(--sage-light)] text-[var(--sage-dark)] px-2 py-1 rounded">Food Systems +0.25</span>
                    <span className="text-[10px] font-bold bg-[var(--gold-light)] text-[var(--terracotta)] px-2 py-1 rounded">Skill: Plant Biology</span>
                  </div>
                </div>
              </div>
              {/* Decorative floaters */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--gold-light)] rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--terracotta)] rounded-full blur-3xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section text-center">
        <div className="container">
          <div className="card p-6 sm:p-12 bg-gradient-to-br from-[var(--charcoal)] to-[#1a1a1a] text-white">
            <h2 className="text-4xl font-bold mb-6">Begin Your Student's <span className="gradient-text">Journey</span></h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto">
              Join the growing community of families redefining education with
              the power of individualized AI guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary">
                Get Started for Free
                <Sparkles className="w-5 h-5" />
              </Link>
            </div>
            <p className="mt-8 text-xs text-gray-500">
              Oklahoma Standard Aligned • GDPR Compliant • Values-First
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--cream-dark)] px-4">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--sage)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Dear Adeline</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-[var(--charcoal-light)]">
            <a href="https://dearadeline.co" className="hover:text-[var(--sage-dark)]">Visit Brand Home</a>
            <a href="#" className="hover:text-[var(--sage-dark)]">Privacy</a>
            <a href="#" className="hover:text-[var(--sage-dark)]">Terms</a>
          </div>
          <p className="text-xs text-[var(--charcoal-light)]">© 2024 Dear Adeline. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

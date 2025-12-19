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
  X
} from 'lucide-react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              Dear Adeline
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[var(--charcoal-light)] hover:text-[var(--sage-dark)] transition-colors">Features</a>
            <a href="#how-it-works" className="text-[var(--charcoal-light)] hover:text-[var(--sage-dark)] transition-colors">How It Works</a>
            <a href="#library" className="text-[var(--charcoal-light)] hover:text-[var(--sage-dark)] transition-colors">Library</a>
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">Log In</Link>
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
              Explore Curriculum
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-[var(--charcoal-light)] hover:text-[var(--sage-dark)]">Features</a>
              <a href="#how-it-works" className="text-[var(--charcoal-light)] hover:text-[var(--sage-dark)]">How It Works</a>
              <a href="#library" className="text-[var(--charcoal-light)] hover:text-[var(--sage-dark)]">Library</a>
              <Link href="/login" className="btn-secondary text-center">Log In</Link>
              <Link href="/dashboard" className="btn-primary text-center">
                Explore Curriculum
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20" style={{ background: 'var(--gradient-hero)' }}>
        {/* Decorative blobs */}
        <div className="blob blob-sage w-96 h-96 -top-20 -right-20 absolute"></div>
        <div className="blob blob-rose w-80 h-80 bottom-20 -left-20 absolute"></div>
        <div className="blob blob-gold w-64 h-64 top-1/2 right-1/4 absolute"></div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="text-script text-2xl text-[var(--terracotta)] mb-4 block animate-fade-in-up">
                Where Learning Comes Alive
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Education as{' '}
                <span className="gradient-text">Unique</span>{' '}
                as Your Child
              </h1>
              <p className="text-xl text-[var(--charcoal-light)] mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                An AI-powered learning companion that adapts to your student's interests,
                tracks skills toward graduation, and transforms curiosity into achievement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link href="/dashboard" className="btn-primary text-lg">
                  <Sparkles className="w-5 h-5" />
                  Explore Curriculum
                </Link>
                <a href="#how-it-works" className="btn-secondary text-lg">
                  See How It Works
                  <ChevronDown className="w-5 h-5" />
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-12 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-[var(--sage-light)] flex items-center justify-center text-sm font-medium text-[var(--sage-dark)]"
                    >
                      {['E', 'M', 'D', 'K'][i - 1]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[var(--charcoal-light)]">
                  Trusted by homeschool families<br />across Oklahoma
                </p>
              </div>
            </div>

            {/* Hero Illustration - Chat Preview */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="card-glass p-6 max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--cream-dark)]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Adeline AI</p>
                    <p className="text-sm text-[var(--charcoal-light)]">Your Learning Companion</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="chat-bubble ai">
                    <p>Hi Della! What are you excited to learn about today? 🌟</p>
                  </div>
                  <div className="chat-bubble user">
                    <p>I want to grow my crochet business!</p>
                  </div>
                  <div className="chat-bubble ai">
                    <p>That's amazing! 🧶 Do you have a website to sell your products yet?</p>
                  </div>
                  <div className="chat-bubble user">
                    <p>No, not yet...</p>
                  </div>
                  <div className="chat-bubble ai">
                    <p>Perfect! Let's build one together! You'll learn web design, marketing, AND run your business. Here are the skills you'll earn:</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="skill-badge">Web Design</span>
                      <span className="skill-badge">Marketing</span>
                      <span className="skill-badge">Entrepreneurship</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--cream-dark)]">
                  <div className="flex items-center gap-2 text-sm text-[var(--sage-dark)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Skills automatically tracked toward graduation</span>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 animate-float">
                <div className="card p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[var(--gold)]" />
                    <span className="text-sm font-medium">+3 Skills Earned!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-[var(--sage)]" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-script text-xl text-[var(--terracotta)] mb-2 block">Why Dear Adeline?</span>
            <h2 className="text-4xl font-bold mb-4">Learning That <span className="gradient-text">Grows With You</span></h2>
            <p className="text-lg text-[var(--charcoal-light)] max-w-2xl mx-auto">
              Every student is unique. Our AI understands that, adapting to interests,
              identifying strengths, and gently filling learning gaps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card group">
              <div className="feature-icon">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Student-Led Learning</h3>
              <p className="text-[var(--charcoal-light)]">
                Your student tells the AI what they're interested in.
                Curiosity becomes curriculum, making education meaningful and engaging.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card group">
              <div className="feature-icon" style={{ background: 'var(--gradient-warm)' }}>
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Skills & Credits Tracking</h3>
              <p className="text-[var(--charcoal-light)]">
                Everything learned earns skills. Watch progress build toward
                graduation requirements in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card group">
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, var(--gold) 0%, var(--terracotta) 100%)' }}>
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Graduation Tracker</h3>
              <p className="text-[var(--charcoal-light)]">
                State standards (Oklahoma and beyond) mapped clearly.
                Know exactly where you stand on the path to graduation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card group">
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, var(--dusty-rose) 0%, var(--terracotta) 100%)' }}>
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Portfolio Builder</h3>
              <p className="text-[var(--charcoal-light)]">
                Every project, every lesson, every achievement becomes
                part of a beautiful, shareable portfolio.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card group">
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)' }}>
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gap Detection</h3>
              <p className="text-[var(--charcoal-light)]">
                AI identifies learning gaps and suggests activities
                to strengthen understanding—no struggling in silence.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card group">
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)' }}>
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gamification & Fun</h3>
              <p className="text-[var(--charcoal-light)]">
                "Let's play a spelling game!" Interactive learning keeps
                students engaged and makes education feel like play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-script text-xl text-[var(--terracotta)] mb-2 block">Simple & Magical</span>
            <h2 className="text-4xl font-bold mb-4">How <span className="gradient-text">Dear Adeline</span> Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Share Your Interest', desc: 'Student tells the AI what they want to learn or work on', icon: MessageCircle },
              { num: '02', title: 'AI Asks Questions', desc: 'Thoughtful probing helps create the perfect lesson plan', icon: Brain },
              { num: '03', title: 'Learn & Create', desc: 'Engaging lessons that match your goals and state standards', icon: Sparkles },
              { num: '04', title: 'Earn & Track', desc: 'Skills and credits automatically map to graduation requirements', icon: Target },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="card text-center h-full">
                  <span className="text-6xl font-bold text-[var(--cream-dark)]">{step.num}</span>
                  <div className="w-14 h-14 mx-auto my-4 rounded-full bg-[var(--sage-light)] flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-[var(--sage-dark)]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--charcoal-light)]">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-[var(--sage)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Library Section */}
      <section id="library" className="section bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-script text-xl text-[var(--terracotta)] mb-2 block">Hands-On Learning</span>
            <h2 className="text-4xl font-bold mb-4">Project <span className="gradient-text">Library</span></h2>
            <p className="text-lg text-[var(--charcoal-light)] max-w-2xl mx-auto">
              A curated collection of art projects, farm activities, and science experiments.
              Each one earns skills toward graduation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Art */}
            <div className="card-glass border-2 border-[var(--dusty-rose-light)] group hover:border-[var(--dusty-rose)] transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--dusty-rose)] to-[var(--terracotta)] flex items-center justify-center mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Art Projects</h3>
              <p className="text-[var(--charcoal-light)] mb-4">
                Painting, sculpture, digital art, and more. Express creativity while earning fine arts credits.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="skill-badge">Fine Arts</span>
                <span className="skill-badge">Creativity</span>
                <span className="skill-badge">Design</span>
              </div>
            </div>

            {/* Farm */}
            <div className="card-glass border-2 border-[var(--sage-light)] group hover:border-[var(--sage)] transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Farm Projects</h3>
              <p className="text-[var(--charcoal-light)] mb-4">
                Gardening, animal care, sustainability. Real-world skills that count toward graduation.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="skill-badge">Life Sciences</span>
                <span className="skill-badge">Agriculture</span>
                <span className="skill-badge">Ecology</span>
              </div>
            </div>

            {/* Science */}
            <div className="card-glass border-2 border-[var(--gold-light)] group hover:border-[var(--gold)] transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--terracotta)] flex items-center justify-center mb-4">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Science Experiments</h3>
              <p className="text-[var(--charcoal-light)] mb-4">
                Chemistry, physics, biology experiments. Hands-on discovery that builds real understanding.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="skill-badge">Lab Skills</span>
                <span className="skill-badge">Scientific Method</span>
                <span className="skill-badge">Research</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers & Parents Section */}
      <section className="section" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-script text-xl text-[var(--terracotta)] mb-2 block">For Educators</span>
              <h2 className="text-4xl font-bold mb-6">Tools for <span className="gradient-text-warm">Teachers & Parents</span></h2>
              <div className="space-y-4">
                {[
                  'Add and manage your students easily',
                  'View progress, portfolios, and graduation status',
                  'Assign library projects directly to students',
                  'See only your students—privacy first',
                  'Get insights on learning gaps and suggestions',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[var(--sage)] flex-shrink-0 mt-0.5" />
                    <p className="text-lg">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/login" className="btn-primary">
                  <Users className="w-5 h-5" />
                  Teacher Login
                </Link>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-2xl font-semibold mb-6">Graduation Progress</h3>
              <div className="space-y-6">
                {[
                  { subject: 'English Language Arts', progress: 75, credits: '3/4' },
                  { subject: 'Mathematics', progress: 60, credits: '2.5/4' },
                  { subject: 'Science', progress: 50, credits: '1.5/3' },
                  { subject: 'Social Studies', progress: 40, credits: '1/3' },
                  { subject: 'Fine Arts', progress: 80, credits: '0.8/1' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.subject}</span>
                      <span className="text-sm text-[var(--charcoal-light)]">{item.credits} credits</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--cream-dark)] flex items-center justify-between">
                <span className="font-semibold">Overall Progress</span>
                <span className="text-2xl font-bold gradient-text">61%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-[var(--sage-dark)] to-[var(--sage)] text-white relative overflow-hidden">
        <div className="blob w-96 h-96 -top-20 -right-20 absolute opacity-10 bg-white"></div>
        <div className="blob w-80 h-80 bottom-20 -left-20 absolute opacity-10 bg-white"></div>

        <div className="container text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join families across Oklahoma who are discovering a more personalized,
            engaging, and meaningful way to learn.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-[var(--sage-dark)] font-semibold text-lg px-8 py-4 rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Explore Curriculum
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--charcoal)] text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold">Dear Adeline</span>
              </div>
              <p className="text-gray-400 text-sm">
                Where learning is as unique as your child. AI-powered, student-led, parent-approved.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#library" className="hover:text-white transition-colors">Project Library</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Student Login</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Teacher Login</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Dear Adeline. Made with 💚 in Oklahoma.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

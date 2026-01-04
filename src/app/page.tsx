import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Sparkles,
  BookOpen,
  Target,
  GraduationCap,
  Palette,
  Leaf,
  FlaskConical,
  MessageCircle,
  ArrowRight,
  Brain,
  Scale,
  Globe,
  Calculator,
  Plus
} from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  }

  const getDashboardLink = (role?: string) => {
    if (role === 'admin') return "/dashboard/admin";
    if (role === 'teacher') return "/dashboard/teacher";
    return "/dashboard";
  };

  const ctaLink = user ? getDashboardLink(profile?.role) : "/login";
  const ctaText = user ? "Continue Learning" : "Join the Academy";
  const secondaryCtaLink = user ? "/portfolio" : "/login";
  const loginLink = user ? getDashboardLink(profile?.role) : "/login";
  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--burgundy)] font-body selection:bg-[var(--ochre)]/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl z-50 border-b border-[var(--cream-dark)]">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Dear Adeline Home">
            <div className="w-12 h-12 bg-[var(--forest)] rounded-xl flex items-center justify-center text-white shadow-lg transform -rotate-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold serif text-[var(--forest)] tracking-tight">Dear Adeline</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link href="#experience" className="text-xs font-bold uppercase tracking-widest text-[var(--forest)]/60 hover:text-[var(--forest)] transition-colors">Experience</Link>
            <Link href="#philosophy" className="text-xs font-bold uppercase tracking-widest text-[var(--forest)]/60 hover:text-[var(--forest)] transition-colors">Philosophy</Link>
            {user && (
              <Link href="/opportunities" className="text-xs font-bold uppercase tracking-widest text-[var(--forest)]/60 hover:text-[var(--forest)] transition-colors">Opportunities</Link>
            )}
            {profile?.role === 'admin' ? (
              <Link href="/dashboard/admin" className="px-6 py-2.5 rounded-full border-2 border-purple-500 text-purple-500 text-xs font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">Admin Hub</Link>
            ) : (
              <Link href={loginLink} className="px-6 py-2.5 rounded-full border-2 border-[var(--forest)] text-[var(--forest)] text-xs font-black uppercase tracking-widest hover:bg-[var(--forest)] hover:text-white transition-all">
                {user ? "Portal" : "Log In"}
              </Link>
            )}
            <Link href={ctaLink} className="px-8 py-4 rounded-full bg-[var(--burgundy)] text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
              {user ? (profile?.role === 'admin' ? "Admin Hub" : "Dashboard") : "Launch App"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6">
              <p className="text-[var(--ochre)] font-script text-3xl mb-0 leading-none">Where Learning Comes Alive</p>
              <h1 className="text-8xl md:text-9xl font-normal serif text-[var(--forest)] leading-[0.85] tracking-tighter">
                Education as <br />
                <span className="text-[var(--ochre)] italic">Unique</span> <br />
                as Your Child
              </h1>
            </div>

            <p className="text-xl text-[var(--forest)]/80 font-medium max-w-lg leading-relaxed">
              An AI-powered learning companion that adapts to your student's interests, tracks skills toward graduation, and transforms curiosity into achievement.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <Link href={ctaLink} className="px-12 py-6 rounded-full bg-[var(--burgundy)] text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:brightness-125 active:scale-95 transition-all flex items-center gap-4">
                {ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#philosophy" className="px-12 py-6 rounded-full border-2 border-[var(--forest)] text-[var(--forest)] font-black uppercase tracking-[0.2em] text-xs flex items-center gap-2 hover:bg-[var(--forest)]/5 transition-all">
                The Method
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-8 opacity-60">
              <div className="flex -space-x-3">
                {['E', 'M', 'D', 'K'].map((initial, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-[var(--forest-light)] border-2 border-[var(--cream)] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--forest)]">
                Trusted by homeschool families <br />
                across Oklahoma
              </p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000">
            <div className="relative z-10 bg-white p-2 rounded-[2rem] border-2 border-[var(--forest)] shadow-2xl skew-y-1">
              <div className="bg-[var(--cream)] rounded-[1.8rem] overflow-hidden">
                <div className="p-6 bg-[var(--forest)] text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span role="img" aria-label="AI Mentor">🧠</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">AI Mentor</p>
                      <p className="font-bold serif">Adeline v2.4</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
                <div className="p-8 space-y-6 min-h-[400px]">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-[var(--forest)]/10 text-sm text-[var(--forest)] max-w-[85%] shadow-sm">
                        Hi Della! What are you excited to learn about today? 🌟
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[var(--forest)]/80 p-5 rounded-2xl rounded-tr-none text-white text-sm max-w-[85%] shadow-lg">
                        I want to grow my crochet business!
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-[var(--forest)]/10 text-sm text-[var(--forest)] max-w-[85%] shadow-sm">
                        That's amazing! 🧶 Do you have a website to sell your products yet?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[var(--forest)]/80 p-5 rounded-2xl rounded-tr-none text-white text-sm max-w-[85%] shadow-lg">
                        No, not yet...
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white p-6 rounded-2xl rounded-tl-none border-2 border-[var(--ochre)] text-sm space-y-4 shadow-xl">
                        <p className="font-bold text-[var(--ochre)]">Perfect! Let's build one together!</p>
                        <p className="text-xs opacity-80 italic">You'll learn web design, marketing, AND run your business. Here are the skills you'll earn:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-0.5 bg-[var(--forest)]/10 text-[var(--forest)] font-bold rounded-full text-[10px] uppercase">Web Design</span>
                          <span className="px-3 py-0.5 bg-[var(--forest)]/10 text-[var(--forest)] font-bold rounded-full text-[10px] uppercase">Marketing</span>
                          <span className="px-3 py-0.5 bg-[var(--forest)]/10 text-[var(--forest)] font-bold rounded-full text-[10px] uppercase">Entrepreneurship</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/50 border-t border-[var(--forest)]/10 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <p className="text-[10px] font-bold text-[var(--forest)]/40 uppercase tracking-widest">Skills automatically tracked toward graduation</p>
                </div>
              </div>
            </div>
            {/* Decorative Blobs */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[var(--ochre)]/10 rounded-full blur-[80px] -z-0"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[var(--forest)]/10 rounded-full blur-[100px] -z-0"></div>
          </div>
        </div>
      </section>

      {/* Why Dear Adeline / Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <p className="text-[var(--ochre)] font-black uppercase tracking-[0.4em] text-xs italic">Why Dear Adeline?</p>
            <h2 className="text-7xl font-normal serif text-[var(--forest)] leading-none">Learning That <br /> <span className="text-[var(--ochre)]">Grows With You</span></h2>
            <p className="text-xl text-[var(--forest)]/60 max-w-2xl mx-auto font-medium">
              Every student is unique. Our AI understands that, adapting to interests, identifying strengths, and gently filling learning gaps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Student-Led Learning', icon: MessageCircle, desc: "Your student tells the AI what they're interested in. Curiosity becomes curriculum, making education meaningful and engaging." },
              { title: 'Skills & Credits Tracking', icon: Target, desc: "Everything learned earns skills. Watch progress build toward graduation requirements in real-time." },
              { title: 'Graduation Tracker', icon: GraduationCap, desc: "State standards (Oklahoma and beyond) mapped clearly. Know exactly where you stand on the path to graduation." },
              { title: 'Portfolio Builder', icon: BookOpen, desc: "Every project, every lesson, every achievement becomes part of a beautiful, shareable portfolio." },
              { title: 'Gap Detection', icon: Brain, desc: "AI identifies learning gaps and suggests activities to strengthen understanding—no struggling in silence." },
              { title: 'Gamification & Fun', icon: Sparkles, desc: "'Let's play a spelling game!' Interactive learning keeps students motivated and makes education feel like play." },
            ].map((feature, i) => (
              <div key={i} className="card group">
                <div className="w-16 h-16 bg-[var(--cream-dark)]/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[var(--ochre)]/10 transition-colors">
                  <feature.icon className="w-8 h-8 text-[var(--forest)] group-hover:text-[var(--ochre)] transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-4 serif text-[var(--forest)]">{feature.title}</h3>
                <p className="text-[var(--forest)]/60 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tracks Section (Project Library Style) */}
      <section id="experience" className="py-32 bg-[var(--forest)] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-24">
            <p className="text-[var(--ochre)] font-black uppercase tracking-[0.4em] text-xs italic">Hands-On Learning</p>
            <h2 className="text-7xl font-normal serif leading-none">Project Library</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium">
              A curated collection of art projects, farm activities, and science experiments. Each one earns skills toward graduation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Art Projects', icon: Palette, desc: 'Painting, sculpture, digital art, and more. Express creativity while earning fine arts credits.', skills: ['Fine Arts', 'Creativity', 'Design'], color: 'bg-rose-500/20' },
              { title: 'Farm Projects', icon: Leaf, desc: 'Gardening, animal care, sustainability. Real-world skills that count toward graduation.', skills: ['Life Sciences', 'Agriculture', 'Ecology'], color: 'bg-emerald-500/20' },
              { title: 'Science Experiments', icon: FlaskConical, desc: 'Chemistry, physics, biology experiments. Hands-on discovery that builds real understanding.', skills: ['Lab Skills', 'Science', 'Research'], color: 'bg-blue-500/20' },
            ].map((track, i) => (
              <Link key={i} href="/dashboard" className="group p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white transition-all duration-500 hover:scale-[1.02] cursor-pointer block text-left">
                <div className={`w-16 h-16 ${track.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <track.icon className="w-8 h-8 text-white group-hover:text-[var(--forest)] transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-4 serif group-hover:text-[var(--forest)]">{track.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed group-hover:text-[var(--forest)]/70 mb-8">{track.desc}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {track.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white/10 group-hover:bg-[var(--forest)]/10 text-[10px] uppercase font-bold rounded-full group-hover:text-[var(--forest)]">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[var(--ochre)] font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Track <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-40 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-20">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-7xl md:text-8xl font-normal serif text-[var(--forest)] leading-none italic">
              Education should look <span className="text-[var(--ochre)]">nothing like</span> a factory.
            </h2>
            <p className="text-xl text-[var(--forest)]/60 font-medium leading-relaxed">
              We've replaced the assembly line with a laboratory. Dear Adeline adapts to each student's pulse—discovering their strengths and gently revealing their gaps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 w-full">
            {[
              { title: 'Hook', desc: 'Narrative-driven discovery', icon: '✨' },
              { title: 'Research', desc: 'Deep-dive investigation', icon: '🔍' },
              { title: 'Build', desc: 'Tangible physical creation', icon: '🛠️' },
              { title: 'Share', desc: 'Teaching for mastery', icon: '📢' },
            ].map((step, i) => (
              <div key={i} className="p-8 bg-white border-2 border-[var(--cream-dark)] rounded-[3rem] space-y-4 hover:border-[var(--ochre)] transition-all group">
                <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{step.icon}</div>
                <h4 className="font-bold serif text-xl">{step.title}</h4>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 mb-32">
        <div className="max-w-6xl mx-auto bg-[var(--ochre)] rounded-[4rem] p-24 text-white text-center space-y-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[var(--burgundy)] opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
          <h2 className="text-7xl md:text-8xl font-normal serif leading-none tracking-tighter">
            Reclaim <br />
            Their <span className="italic">Wonder</span>
          </h2>
          <p className="text-xl text-white/80 max-w-xl mx-auto font-medium">
            Join a community of families proving that education is an adventure, and mastery is its own reward.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href={ctaLink} className="px-16 py-7 rounded-full bg-white text-[var(--burgundy)] font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-105 transition-all">
              {user ? "Back to Lesson" : "Get Started"}
            </Link>
            <Link href={secondaryCtaLink} className="px-16 py-7 rounded-full border-2 border-white text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-[var(--ochre)] transition-all">
              {user ? "View Portfolio" : "View Demo"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-[var(--cream-dark)] bg-white/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 justify-between items-center gap-10 opacity-60">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--forest)] rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold serif text-[var(--forest)]">Dear Adeline Academy</span>
          </div>
          <div className="text-right space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--burgundy)]">Oklahoma Homeschooling Reimagined</p>
            <p className="text-xs font-medium text-[var(--forest)]/60">© 2025 Dear Adeline Co. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

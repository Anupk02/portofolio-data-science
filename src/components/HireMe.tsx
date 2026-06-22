import { useState, useEffect } from 'react';
import { Sparkles, Compass, Rocket, GraduationCap, CheckCircle2 } from 'lucide-react';

export function FloatHireMeButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle visibility based on scrolled offset
      setVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const section = document.querySelector('#hire-me');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      id="floating-hire-me"
      onClick={handleClick}
      className="fixed bottom-6 right-20 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 border border-white/10 text-emerald-400 font-sans text-xs font-bold glow-ring-pulsing hover:scale-105 active:scale-95 duration-200 shadow-2xl backdrop-blur-md cursor-pointer select-none"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>Hire Me</span>
    </button>
  );
}

export default function HireMe() {
  const differentiators = [
    {
      title: 'IEEE Published ML Researcher',
      desc: 'Validated deep analytical methodology with published peer-reviewed computer vision and NLP research in IEEE OTCON 2024.',
      icon: <GraduationCap className="w-5 h-5 text-indigo-500" />
    },
    {
      title: 'Builds Multi-Agent Architectures',
      desc: 'Expertise in modern agentic tools like CrewAI, LangChain, and LangGraph orchestrating highly cooperative localized pipelines.',
      icon: <Rocket className="w-5 h-5 text-blue-500" />
    },
    {
      title: 'Data-Centric to Frontend UX',
      desc: 'Full spectrum developer connecting advanced scikit models, SQLite repositories, and FastAPI endpoints to interactive React dashboards.',
      icon: <Compass className="w-5 h-5 text-teal-400" />
    }
  ];

  const handleCTA = () => {
    const section = document.querySelector('#contact');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hire-me" className="py-24 border-t border-slate-100/5 dark:border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto p-8 sm:p-12 rounded-3xl bg-slate-100/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-white/[0.03] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle accent circles */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-blue-500/5 blur-3xl" />

          {/* Availability Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-6 select-none relative z-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-550"></span>
            </span>
            <span>Open to Full-Time Roles & Contracting</span>
          </div>

          <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-50 relative z-10">
            Why Hire Me for Your Team?
          </h2>
          <p className="mt-4 max-w-2xl text-slate-500 dark:text-slate-400 font-sans text-sm sm:text-base leading-relaxed relative z-10">
            I am a quick shipper who builds deep neural systems alongside highly intuitive client interfaces. Ready to contribute immediately is my stack, backed by robust academic standards.
          </p>

          {/* Differentiators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 relative z-10">
            {differentiators.map((diff) => (
              <div
                key={diff.title}
                className="p-6 rounded-2xl bg-white/70 dark:bg-white/[0.01] border border-slate-200/60 dark:border-white/[0.03] hover:border-blue-500/10 hover:shadow-lg text-left transition-all flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.02] flex items-center justify-center border border-slate-200/40 dark:border-white/[0.04] shadow-sm shrink-0">
                  {diff.icon}
                </div>
                <h3 className="font-sans font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 tracking-tight">
                  {diff.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
                  {diff.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Trigger */}
          <div className="mt-12 relative z-10">
            <button
              id="hire-me-cta-talk"
              onClick={handleCTA}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-sans text-sm font-bold tracking-wide shadow-lg shadow-emerald-550/15 active:scale-98 transition-all duration-200 cursor-pointer"
            >
              Let's Talk Integration
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

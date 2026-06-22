import { useState, useEffect } from 'react';
import { ArrowRight, FileText, Send, Sparkles, Brain, Cpu, Bot, Terminal } from 'lucide-react';
import { PERSONAL_INFO } from '../data';
import { sound } from '../utils';

interface HeroProps {
  onNavigate: (hash: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [titleIdx, setTitleIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Floating technology badges coordinates
  const techBadges = [
    { name: 'Python', color: 'from-blue-500 to-yellow-500', top: '15%', left: '10%', speed: 0.03 },
    { name: 'LangChain', color: 'from-emerald-500 to-teal-500', top: '22%', right: '12%', speed: -0.04 },
    { name: 'FastAPI', color: 'from-teal-400 to-sky-400', top: '65%', left: '8%', speed: 0.05 },
    { name: 'Docker', color: 'from-blue-400 to-cyan-500', top: '60%', right: '10%', speed: -0.035 },
    { name: 'React', color: 'from-cyan-400 to-blue-500', bottom: '15%', left: '30%', speed: 0.02 },
    { name: 'LangGraph', color: 'from-purple-500 to-indigo-500', top: '45%', left: '78%', speed: 0.045 },
  ];

  // Typewriter effect logic
  useEffect(() => {
    let timer: number;
    const fullText = PERSONAL_INFO.titles[titleIdx];
    const typingSpeed = isDeleting ? 30 : 70;

    if (!isDeleting && displayText === fullText) {
      // Pause at full text
      timer = window.setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setTitleIdx((prev) => (prev + 1) % PERSONAL_INFO.titles.length);
    } else {
      timer = window.setTimeout(() => {
        setDisplayText(
          isDeleting
            ? fullText.substring(0, displayText.length - 1)
            : fullText.substring(0, displayText.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, titleIdx]);

  // Parallax mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 25,
        y: (e.clientY - window.innerHeight / 2) / 25,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Visual glowing backgrounds matching electric blue → violet → teal accent gradient */}
      <div className="absolute top-[20%] left-[10%] w-[25rem] h-[25rem] rounded-full bg-blue-500/10 blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[25%] right-[5%] w-[30rem] h-[30rem] rounded-full bg-indigo-500/10 blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[35%] w-[20rem] h-[20rem] rounded-full bg-teal-500/5 blur-[120px] -z-10 pointer-events-none" />

      {/* Parallax Floating Tech Badges */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block select-none">
        {techBadges.map((badge) => (
          <div
            key={badge.name}
            style={{
              top: badge.top,
              left: badge.left,
              right: badge.right,
              bottom: badge.bottom,
              transform: `translate(${mousePos.x * badge.speed * 20}px, ${
                mousePos.y * badge.speed * 20
              }px)`,
              transition: 'transform 0.1s ease-out',
            }}
            className="absolute z-10"
          >
            <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/60 dark:bg-white/[0.03] border border-slate-200/20 dark:border-white/[0.06] shadow-xl backdrop-blur-md flex items-center gap-1.5 transform hover:scale-105 duration-300">
              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${badge.color}`} />
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-350">
                {badge.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-15 text-center">
        {/* Dynamic, premium circular neural avatar node */}
        <div className="flex justify-center mb-8">
          <div 
            onMouseEnter={() => sound.playHover()}
            className="relative group select-none"
          >
            {/* outer cyber orbit rings */}
            <div className="absolute -inset-4 rounded-full border border-dashed border-cyan-500/30 animate-spin" style={{ animationDuration: '24s' }} />
            <div className="absolute -inset-6 rounded-full border border-cyan-400/10 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
            
            {/* Ambient colorful energy shadows */}
            <div className="absolute -inset-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-teal-400 opacity-60 blur-xl group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 animate-pulse" />

            {/* Glowing neon alignment ticks */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-1 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] z-20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] z-20" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 h-1 w-3 bg-fuchsia-400 rounded-full shadow-[0_0_8px_#e879f9] z-20" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 h-1 w-3 bg-fuchsia-400 rounded-full shadow-[0_0_8px_#e879f9] z-20" />

            {/* Inner frame */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-white/25 dark:border-white/10 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-slate-900/60 flex items-center justify-center p-1.5 backdrop-blur-md">
              {/* Spinning data tracker sweep */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_40%,rgba(6,182,212,0.15)_80%,rgba(6,182,212,0.4)_100%)] animate-spin" style={{ animationDuration: '4s' }} />

              {/* Laser Scanning Sweep Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] z-20 animate-[bounce_3.5s_infinite]" />

              <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950/80 border border-white/10 flex items-center justify-center">
                <svg className="w-full h-full object-cover rounded-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Light gray-blue professional background */}
                  <rect width="200" height="200" fill="#F1F5F9" />
                  
                  {/* Character Hair back */}
                  <path d="M60 85C60 45 140 45 140 85" fill="#1C1917" />
                  
                  {/* Neck and skin shadow */}
                  <path d="M85 110V135C85 140 115 140 115 135V110" fill="#FDE047" opacity="0.6" />
                  <path d="M85 110V132H115V110H85Z" fill="#FDE047" opacity="0.8" />
                  <path d="M84 105C84 105 100 135 116 105" fill="#F59E0B" opacity="0.25" />
                  
                  {/* Ears */}
                  <circle cx="62" cy="100" r="11" fill="#FEF08A" />
                  <circle cx="138" cy="100" r="11" fill="#FEF08A" />
                  
                  {/* Face geometry */}
                  <path d="M65 85C65 85 64 125 100 135C136 125 135 85 135 85H65Z" fill="#FEF08A" />
                  
                  {/* Hair styling */}
                  <path d="M60 85C60 85 70 50 100 52C130 54 140 85 140 85C140 85 130 70 115 72C100 74 95 65 80 67C65 69 60 85 60 85Z" fill="#1C1917" />
                  <path d="M80 67C75 72 70 85 70 85C70 85 75 75 85 72C95 69 100 74 105 72" stroke="#292524" strokeWidth="2" strokeLinecap="round" />

                  {/* Dark eyebrows */}
                  <path d="M75 90C80 88 88 89 90 92" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M125 90C120 88 112 89 110 92" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Dark professional eyes */}
                  <ellipse cx="82" cy="97" rx="5" ry="3.5" fill="#1C1917" />
                  <ellipse cx="118" cy="97" rx="5" ry="3.5" fill="#1C1917" />
                  <circle cx="83.5" cy="95.5" r="1.5" fill="#FFFFFF" />
                  <circle cx="119.5" cy="95.5" r="1.5" fill="#FFFFFF" />

                  {/* Nose anatomy */}
                  <path d="M97 98C97 98 100 112 103 112" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />

                  {/* Confident gentle smile */}
                  <path d="M85 118C92 122 108 122 115 118" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />

                  {/* Formal Dress Collar and necktie */}
                  <path d="M70 140L100 155L130 140V160H70V140Z" fill="#FFFFFF" />
                  <path d="M70 140L90 152L100 132L85 132" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
                  <path d="M130 140L110 152L100 132L115 132" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />

                  {/* Striped Blue tie matching his dress photo */}
                  <path d="M95 145L100 135L105 145L108 185L100 195L92 185L95 145Z" fill="#2563EB" />
                  <path d="M96 150L103 143" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M95 160L106 149" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M94 170L107 157" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M93 180L107 166" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M94 188L105 177" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Black formal business suit */}
                  <path d="M70 140L55 155L45 200H85L90 155L70 140Z" fill="#0F172A" />
                  <path d="M130 140L145 155L155 200H115L110 155L130 140Z" fill="#0F172A" />
                  <path d="M70 140L88 158L84 200H65L55 155L70 140Z" fill="#1E293B" />
                  <path d="M130 140L112 158L116 200H135L145 155L130 140Z" fill="#1E293B" />
                </svg>
              </div>
            </div>

            {/* Status indicators */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-slate-950/90 border border-cyan-500/30 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] z-20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[8px] font-bold text-white uppercase tracking-wider">
                SYS_NEURAL_VECTOR
              </span>
            </div>
          </div>
        </div>

        {/* Entrance greeting block */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-500 bg-blue-500/5 border border-blue-500/15 mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Available for Roles & Projects</span>
        </div>

        {/* Master Developer Title Grid */}
        <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-800 dark:text-slate-50 transition-colors">
          Hello, I'm <span className="animate-glow-text">{PERSONAL_INFO.name}</span>
        </h1>

        {/* Sub-Typewriter */}
        <div className="mt-4 min-h-[3.5rem] flex items-center justify-center">
          <span className="font-mono text-xl sm:text-3.5xl font-bold bg-gradient-to-r from-blue-500 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
            {displayText}
            <span className="inline-block w-1 h-6 bg-indigo-500 ml-1.5 animate-pulse" />
          </span>
        </div>

        {/* Dense Tagline Bio */}
        <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 font-sans leading-relaxed tracking-wide transition-colors">
          B.Tech Computer Science graduate specializing in AI Agent platforms, NLP architecture, and custom Machine Learning systems. Bridging complex RAG pipelines and multi-agent system workflows with beautiful, highly responsive product interfaces.
        </p>

        {/* Action button container */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Projects */}
          <button
            id="hero-cta-projects"
            onClick={() => handleScrollTo('#projects')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-sans text-sm font-semibold tracking-wide shadow-lg shadow-blue-500/20 active:scale-98 hover:shadow-indigo-500/25 duration-200 cursor-pointer"
          >
            <span>View Case Studies</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Download Cv */}
          <a
            id="hero-cta-resume"
            href={PERSONAL_INFO.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-250 border border-slate-200 dark:border-white/[0.08] font-sans text-sm font-semibold hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <FileText className="w-4.5 h-4.5 text-blue-500" />
            <span>Download CV</span>
          </a>

          {/* Hire Me / Talk */}
          <button
            id="hero-cta-contact"
            onClick={() => handleScrollTo('#contact')}
            className="flex items-center gap-1.5 px-6 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-300 font-sans text-sm font-medium border border-transparent hover:border-slate-200/50 dark:hover:border-white/[0.05] active:scale-98 duration-200 cursor-pointer"
          >
            <Send className="w-4 h-4 text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400">Let's Connect</span>
          </button>
        </div>

        {/* Tiny scroll-down indicator */}
        <div className="mt-20 flex justify-center">
          <button
            id="hero-scroll-btn"
            onClick={() => handleScrollTo('#about')}
            className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600 cursor-pointer"
          >
            <span className="font-mono text-[9px] tracking-widest uppercase">Scroll to Discover</span>
            <div className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-800 flex items-start justify-center p-1.5">
              <div className="w-1 h-2 h-1.5 rounded-full bg-blue-500 animate-bounce" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

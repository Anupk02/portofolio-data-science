import { useState, useEffect } from 'react';
import { Menu, X, FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PERSONAL_INFO } from '../data';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentPath: string; // Hash path like "#/" or "#/project/devops-ai-platform"
  onNavigate: (hash: string) => void;
  profilePhoto?: string | null;
}

export default function Navbar({ theme, toggleTheme, currentPath, onNavigate, profilePhoto }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isProjectPage = currentPath.startsWith('#/project/');

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScroll > 0) {
          setScrollProgress((window.scrollY / totalScroll) * 100);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Sync scroll lock for mobile menu drawer
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Certifications', href: '#certifications' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    onNavigate(href);
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#0a0e17]/95 backdrop-blur-2xl py-2.5 shadow-[0_8px_30px_rgba(6,182,212,0.1)] border-b border-slate-200/50 dark:border-cyan-500/15'
          : 'bg-transparent py-4.5 border-b border-transparent'
      }`}
    >
      {/* Scroll indicator bar */}
      <div 
        className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-cyan-500 via-violet-500 to-teal-400 transition-all duration-75 shadow-[0_0_8px_rgba(6,182,212,0.6)] z-50 animate-glow-border"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            {isProjectPage ? (
              <button
                id="nav-back-button"
                onClick={() => onNavigate('#/')}
                className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 group transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                <span>PORTFOLIO BACK</span>
              </button>
            ) : (
              <a
                id="nav-logo"
                href="#/"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 group cursor-pointer select-none"
              >
                {/* Modern Responsive Tech Brand Logo */}
                <div className="relative flex items-center justify-center bg-slate-950/95 border border-slate-800 dark:border-cyan-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl gap-2 sm:gap-2.5 overflow-hidden shadow-[0_4px_15px_rgba(6,182,212,0.12)] group-hover:shadow-[0_6px_22px_rgba(139,92,246,0.25)] transition-all duration-300 transform group-hover:-translate-y-[1px]">
                  {/* Glowing background gradient shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-violet-500/10 opacity-70 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Embedded emblem badge */}
                  <div className="relative w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white text-[8px] sm:text-[9.5px] font-black group-hover:rotate-6 transition-transform duration-300 shadow-[0_0_10px_rgba(6,182,212,0.35)]">
                    ⚓
                  </div>

                  {/* Core branding and tag */}
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-[11px] sm:text-xs font-black tracking-wider text-slate-900 dark:text-white flex items-center gap-0.5 leading-none">
                      <span className="text-cyan-400 select-none">&lt;</span>
                      <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-700 dark:from-cyan-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent group-hover:opacity-85 transition-all uppercase">ANUP.AI</span>
                      <span className="text-violet-400 select-none">/&gt;</span>
                    </span>
                    <span className="hidden sm:block font-sans text-[6.5px] font-black text-slate-500 dark:text-cyan-400/60 uppercase tracking-widest mt-0.5 whitespace-nowrap transition-colors duration-300 group-hover:text-cyan-300">
                      NEURAL INTELLIGENCE LABS
                    </span>
                  </div>

                  {/* Pulsing LED active runtime indicator */}
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 self-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-gradient-to-tr from-cyan-400 to-teal-400"></span>
                  </span>
                </div>
              </a>
            )}
          </div>
  
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {!isProjectPage && (
              <div className="flex items-center gap-7">
                {navLinks.map((link) => (
                  <button
                    key={`${link.name}-desktop`}
                    id={`nav-link-${link.name.toLowerCase()}`}
                    onClick={() => handleLinkClick(link.href)}
                    className="font-sans text-[11px] font-bold text-slate-800 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 uppercase tracking-widest transition-all relative py-1.5 group cursor-pointer"
                  >
                    <span>{link.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-violet-500 group-hover:w-full transition-all duration-300 rounded-full" />
                  </button>
                ))}
              </div>
            )}
  
            {/* CTA + Actions */}
            <div className="flex items-center gap-5">
              {/* Hire Me - Anchor to Section */}
              <button
                id="nav-hire-me"
                onClick={() => handleLinkClick('#hire-me')}
                className="relative inline-flex items-center gap-2 px-4.5 py-2 rounded-full font-mono text-[10px] uppercase font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/25 dark:border-cyan-500/35 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 active:scale-95 transition-all duration-150 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.05)]"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Hire Me</span>
              </button>
  
              {/* Resume download */}
              <a
                id="nav-resume"
                href={PERSONAL_INFO.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4.5 py-2 rounded-full font-mono text-[10px] uppercase font-bold text-slate-800 dark:text-slate-100 hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-gradient-to-r hover:from-cyan-500 hover:to-violet-500 dark:hover:from-cyan-500 dark:hover:to-violet-500 border border-slate-300 dark:border-white/[0.08] hover:border-transparent dark:hover:border-transparent active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(139,92,246,0.25)]"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume</span>
              </a>
  
              {/* Theme Toggle Switcher */}
              <ThemeToggle
                id="nav-theme-toggle"
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </div>
          </div>
 
          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center gap-2.5">
            {/* Theme Toggle Switcher */}
            <ThemeToggle
              id="mobile-theme-toggle"
              theme={theme}
              toggleTheme={toggleTheme}
            />
 
            {/* Mobile menu trigger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5 text-cyan-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
 
      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute top-18 inset-x-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-2xl p-4 border border-slate-200/50 dark:border-cyan-500/20 shadow-2xl flex flex-col gap-4 md:hidden z-50 overflow-hidden"
          >
            {!isProjectPage && (
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <button
                    key={`${link.name}-mobile`}
                    id={`mobile-nav-link-${link.name.toLowerCase()}`}
                    onClick={() => handleLinkClick(link.href)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl font-sans text-[13px] font-bold text-slate-800 dark:text-slate-200 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            )}
   
            <div className="h-[1px] bg-slate-200/50 dark:bg-cyan-500/15" />
   
            <div className="flex items-center justify-between gap-3 font-semibold">
              <button
                id="mobile-hire-me"
                onClick={() => handleLinkClick('#hire-me')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hire Me</span>
              </button>
   
              <a
                id="mobile-resume"
                href={PERSONAL_INFO.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] cursor-pointer min-h-[44px]"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

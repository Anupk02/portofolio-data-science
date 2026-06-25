import { useState, useEffect, lazy, Suspense } from 'react';
import CanvasBackground from './components/CanvasBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import NauticalLogPoseMap from './components/NauticalLogPoseMap';
import Timeline from './components/Timeline';
import Achievements from './components/Achievements';
import HireMe, { FloatHireMeButton } from './components/HireMe';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import CommandCenter from './components/CommandCenter';
import NauticalCommandDeck from './components/NauticalCommandDeck';
import NeuralSandbox from './components/NeuralSandbox';
import TerminalPreloader from './components/TerminalPreloader';
import CommandPalette from './components/CommandPalette';
import CustomCursor from './components/CustomCursor';

const ProjectDetail = lazy(() => import('./components/ProjectDetail'));

export default function App() {
  const [isPreloading, setIsPreloading] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('portfolio_preloaded') !== 'true';
    }
    return true;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark'; // Dark-mode-first
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  // Track Hash routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update theme classes on document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  const isProjectPage = currentPath.startsWith('#/project/');
  const currentProjectSlug = isProjectPage ? currentPath.replace('#/project/', '') : '';

  // Universal React-aware Anchor scroll handler for initial load or hash changes
  useEffect(() => {
    if (!isProjectPage) {
      const hash = window.location.hash;
      if (hash && hash !== '#/' && hash !== '#') {
        const targetId = hash.replace('#/', '').replace('#', '');
        const timer = setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
        return () => clearTimeout(timer);
      } else if (hash === '#/' || !hash) {
        const timer = setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [currentPath, isProjectPage]);

  if (isPreloading) {
    return (
      <TerminalPreloader
        onComplete={() => {
          setIsPreloading(false);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('portfolio_preloaded', 'true');
          }
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans antialiased text-slate-800 dark:text-slate-100 selection:bg-blue-500/30">
      {/* Dynamic Animated background constellations */}
      <CanvasBackground theme={theme} />

      {/* Styled top navigation bar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        currentPath={currentPath}
        onNavigate={navigateTo}
      />

      {/* Layout views based on current path */}
      {isProjectPage ? (
        <main className="relative z-10">
          <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 font-sans">
              <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
              <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest animate-pulse">// Compiling sequence data...</p>
            </div>
          }>
            <ProjectDetail slug={currentProjectSlug} onNavigate={navigateTo} />
          </Suspense>
        </main>
      ) : (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Hero onNavigate={navigateTo} />
          <About />
          <Skills />
          <NeuralSandbox />
          <Projects onNavigate={navigateTo} />
          <NauticalLogPoseMap />
          <Timeline />
          <Achievements />
          <HireMe />
          <Contact />
        </main>
      )}

      {/* Shared footer */}
      <Footer />

      {/* Sticky floating Action Callout button on main pages only */}
      {!isProjectPage && <FloatHireMeButton />}

      {/* Persistent first-person digital double AI Chatbot */}
      <Chatbot />

      {/* Cyberpunk Interactive CLI Terminal Console command deck */}
      <CommandCenter />

      {/* Atmospheric loop synth mixer, mystery chests and recruiter ATS matching console */}
      <NauticalCommandDeck />

      {/* Searchable Command Palette */}
      <CommandPalette onNavigate={navigateTo} />

      {/* Custom follower halo cursor */}
      <CustomCursor />
    </div>
  );
}

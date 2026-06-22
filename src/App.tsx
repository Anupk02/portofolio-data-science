import { useState, useEffect } from 'react';
import CanvasBackground from './components/CanvasBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Timeline from './components/Timeline';
import Achievements from './components/Achievements';
import HireMe, { FloatHireMeButton } from './components/HireMe';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectDetail from './components/ProjectDetail';
import Chatbot from './components/Chatbot';

export default function App() {
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
      setCurrentPath(window.location.hash || '#/ ');
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
          <ProjectDetail slug={currentProjectSlug} onNavigate={navigateTo} />
        </main>
      ) : (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Hero onNavigate={navigateTo} />
          <About />
          <Skills />
          <Projects onNavigate={navigateTo} />
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
    </div>
  );
}

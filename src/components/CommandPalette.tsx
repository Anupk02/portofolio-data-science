import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Compass, Sparkles, Terminal, X, CornerDownLeft, Command, HelpCircle } from 'lucide-react';
import { sound } from '../utils';

interface CommandPaletteProps {
  onNavigate: (hash: string) => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  action: () => void;
  icon: any;
}

export default function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [showEasterEggToast, setShowEasterEggToast] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            sound.playClick();
            setSearchQuery('');
            setSelectedIndex(0);
          } else {
            sound.playGlitch();
          }
          return !prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set focus to details on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Navigate options list
  const registryItems: PaletteItem[] = [
    {
      id: 'nav-home',
      title: 'Jump to Home / Hero',
      subtitle: 'Scroll back to the top of the portfolio landing page',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-about',
      title: 'Jump to About Me',
      subtitle: 'Interactive "Stack Defender" RAG training game and personal bio',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#about');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-skills',
      title: 'Jump to Technical Skills',
      subtitle: 'Expertise map, vector database traversal, and core tech stacks',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#skills');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-sandbox',
      title: 'Jump to Live Neural Sandbox & Tokenizer',
      subtitle: 'Real-time AI tokenizer, forward propagation, and interactive prediction simulation',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#extreme-neural-network-interactive');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-projects',
      title: 'Jump to Projects & Case Studies',
      subtitle: 'Browse featured high-performance engineering systems',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#projects');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-map',
      title: 'Jump to Log Pose Map Segment',
      subtitle: 'Sailing simulator following the Grand Line of project deployments',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#nautical-nav-sector');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-certifications',
      title: 'Jump to Timeline & Certifications',
      subtitle: 'Professional certifications, courses, and educational background',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#certifications');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-achievements',
      title: 'Jump to Achievements & Publications',
      subtitle: 'IEEE published paper details and key technical accolades',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#achievements');
        setIsOpen(false);
      }
    },
    {
      id: 'nav-contact',
      title: "Jump to Let's Connect",
      subtitle: 'Direct email channel and fully functioning contact dispatch portal',
      category: 'Sections',
      icon: Compass,
      action: () => {
        onNavigate('#contact');
        setIsOpen(false);
      }
    },
    // Case Studies
    {
      id: 'case-devops',
      title: 'Case Study: Autonomous DevOps AI Platform',
      subtitle: 'Deep dive into collaborative multi-agent code analysis & CI/CD repairs',
      category: 'Case Studies',
      icon: Terminal,
      action: () => {
        onNavigate('#/project/devops-ai-platform');
        setIsOpen(false);
      }
    },
    {
      id: 'case-patent',
      title: 'Case Study: AI Research & Patent Intelligence',
      subtitle: 'Semantic indexing, similarity profiling, and prior art exploration',
      category: 'Case Studies',
      icon: Terminal,
      action: () => {
        onNavigate('#/project/ai-research-patent-intel');
        setIsOpen(false);
      }
    },
    {
      id: 'case-plag',
      title: 'Case Study: Dual-Mode Plagiarism Detection',
      subtitle: 'Deep investigation of coupled NLP string matching & Computer Vision layouts',
      category: 'Case Studies',
      icon: Terminal,
      action: () => {
        onNavigate('#/project/plagiarism-detection');
        setIsOpen(false);
      }
    }
  ];

  // Specific easter egg handling
  const checkEasterEgg = (query: string) => {
    if (query.trim().toLowerCase() === 'sudo hire anup') {
      triggerEasterEgg();
      setSearchQuery('');
    }
  };

  const triggerEasterEgg = () => {
    sound.playSuccess();
    setIsConfettiActive(true);
    setShowEasterEggToast(true);
    setIsOpen(false);
    
    // Automatically close toast after 10s
    setTimeout(() => {
      setShowEasterEggToast(false);
    }, 10000);
  };

  // Setup custom particle confetti inside Canvas element
  useEffect(() => {
    if (!isConfettiActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface ConfettiParticle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }

    const colors = ['#06b6d4', '#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];
    const particles: ConfettiParticle[] = [];

    // Spawn initial bunch of 150 particles
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height * 0.85, // explode upward from bottom centerish
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 18,
        speedY: -Math.random() * 20 - 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    let animationFrameId: number;
    const gravity = 0.42;
    const friction = 0.98;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      particles.forEach((p) => {
        p.speedX *= friction;
        p.speedY += gravity;
        p.speedY *= friction;
        
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        if (p.y < canvas.height && p.x > 0 && p.x < canvas.width) {
          alive = true;
        }
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        setIsConfettiActive(false);
      }
    };

    render();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isConfettiActive]);

  // Handle Search Queries
  const filteredItems = registryItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard navigation inside open palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      sound.playHover();
      setSelectedIndex((prev) => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      sound.playHover();
      setSelectedIndex((prev) => (filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim().toLowerCase() === 'sudo hire anup') {
        triggerEasterEgg();
        setSearchQuery('');
        return;
      }
      if (filteredItems[selectedIndex]) {
        sound.playSuccess();
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      sound.playGlitch();
    }
  };

  return (
    <>
      {/* Floating global shortcut indicator at top right on desk or accessed via mouse */}
      <div className="fixed top-24 right-6 z-40 hidden lg:block">
        <button
          onClick={() => {
            sound.playClick();
            setIsOpen(true);
            setSearchQuery('');
            setSelectedIndex(0);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/[0.06] hover:border-cyan-500/30 text-slate-400 hover:text-slate-200 transition-all font-mono text-[10px] shadow-lg cursor-pointer select-none group"
        >
          <Command className="w-3 h-3 group-hover:scale-105" />
          <span>CMD Palette</span>
          <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded border border-white/[0.04]">⌘K</span>
        </button>
      </div>

      {/* Confetti Explosion Canvas */}
      {isConfettiActive && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-[1100]"
        />
      )}

      {/* Interactive Easter Egg Toast */}
      <AnimatePresence>
        {showEasterEggToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[1000] w-full max-w-md bg-[#050814] border-2 border-emerald-500 rounded-2xl p-5 shadow-[0_0_25px_rgba(16,185,129,0.3)] select-none text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Terminal className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-sans font-bold text-sm text-white">ACCESS GRANTED: sudo hire anup</h4>
                <p className="font-sans text-xs text-slate-450 mt-1 leading-relaxed">
                  Anupkumar Koturwar successfully scheduled for evaluation! Initiating priority recruitment sequence.
                </p>
                <div className="mt-3.5 flex items-center gap-3">
                  <button
                    onClick={() => {
                      onNavigate('#contact');
                      setShowEasterEggToast(false);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Let's talk →</span>
                  </button>
                  <button
                    onClick={() => setShowEasterEggToast(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-sans text-[11px] font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 pt-[10vh] select-none">
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                sound.playGlitch();
                setIsOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
            />

            {/* Main searchable palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-slate-950 border border-white/[0.08] dark:border-cyan-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Dynamic Search header */}
              <div className="p-4 border-b border-white/[0.08] flex items-center gap-3 shrink-0">
                <Search className="w-4 h-4 text-slate-400 select-none shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder='Search sections, cases, or type commands... (e.g. "sudo hire anup")'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                    checkEasterEgg(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-100 font-sans text-sm placeholder:text-slate-500 select-text"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer select-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List results */}
              <div
                ref={containerRef}
                className="max-h-[340px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10"
              >
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          sound.playSuccess();
                          item.action();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/10 border border-blue-500/30 text-white shadow-inner'
                            : 'bg-transparent border border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isSelected ? 'bg-blue-600/20 text-blue-400' : 'bg-white/[0.03] text-slate-500'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex flex-col text-left">
                            <span className="font-sans text-xs font-bold text-slate-200 truncate group-hover:text-white">
                              {item.title}
                            </span>
                            <span className="font-sans text-[10px] text-slate-500 truncate mt-0.5 whitespace-nowrap">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 select-none shrink-0">
                          <span className="font-mono text-[8px] uppercase px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05] text-slate-500 font-bold">
                            {item.category}
                          </span>
                          {isSelected && (
                            <CornerDownLeft className="w-3.5 h-3.5 text-blue-400 opacity-80" />
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-10 text-center select-none flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="w-8 h-8 text-slate-600" />
                    <span className="font-sans text-xs text-slate-400">No parameters match search query.</span>
                    <span className="font-sans text-[10px] text-slate-600">Try typing "sudo hire anup" for a hidden feature</span>
                  </div>
                )}
              </div>

              {/* Utility instructions footer bar */}
              <div className="bg-slate-900 border-t border-white/[0.06] p-3 flex items-center justify-between select-none font-sans text-[10px] text-slate-500 shrink-0">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="bg-slate-850 px-1 py-0.5 rounded border border-white/[0.04]">↑↓</span> Navigation
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="bg-slate-850 px-1 py-0.5 rounded border border-white/[0.04]">Enter</span> Execute
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="bg-slate-850 px-1 py-0.5 rounded border border-white/[0.04]">Esc</span> Close
                  </span>
                </div>
                <div className="max-sm:hidden">
                  ANUP.AI PORTFOLIO SHELL
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

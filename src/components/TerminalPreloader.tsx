import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import { sound } from '../utils';

interface TerminalPreloaderProps {
  onComplete: () => void;
}

interface PreloadLine {
  text: string;
  type: 'cmd' | 'info' | 'success' | 'warn';
  delay: number;
}

export default function TerminalPreloader({ onComplete }: TerminalPreloaderProps) {
  const [visibleLines, setVisibleLines] = useState<PreloadLine[]>([]);
  const [cursorBlink, setCursorBlink] = useState(true);

  const lines: PreloadLine[] = [
    { text: 'anup@portfolio-shell:~$ boot --interactive-mode', type: 'cmd', delay: 200 },
    { text: '📡 Establishing secure socket tunnels on port 3000...', type: 'info', delay: 600 },
    { text: '✅ WebSocket connected. Handshake verified. [100% SECURE]', type: 'success', delay: 1000 },
    { text: '📦 Loading personal dossier kernel memory modules...', type: 'info', delay: 1400 },
    { text: '⚙️ Initializing local RAG embeddings (ChromaDB + SentenceTransformers)...', type: 'info', delay: 1800 },
    { text: '🤖 Deploying collaborative CrewAI research agents...', type: 'info', delay: 2200 },
    { text: '✅ Memory buffer cache loaded successfully.', type: 'success', delay: 2500 },
    { text: 'anup@portfolio-shell:~$ ready.', type: 'cmd', delay: 2800 },
  ];

  // Cursor Blinking Effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorBlink((v) => !v);
    }, 450);
    return () => clearInterval(cursorInterval);
  }, []);

  // Main chronological sequence runner
  useEffect(() => {
    sound.playGlitch(); // Initial boot play sound

    const timers = lines.map((item) => {
      return setTimeout(() => {
        setVisibleLines((prev) => [...prev, item]);
        
        // Play appropriate typewriter sound effects on load events
        if (item.type === 'success') {
          sound.playSuccess();
        } else if (item.type === 'cmd') {
          sound.playClick();
        } else {
          sound.playTelemetry();
        }
      }, item.delay);
    });

    // Final trigger loader complete
    const finishTimer = setTimeout(() => {
      sound.playSuccess();
      onComplete();
    }, 3300);

    return () => {
      timers.forEach((t) => clearTimeout(t));
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030611] flex flex-col items-center justify-center p-4 select-none font-mono text-xs sm:text-sm">
      {/* Central decorative frame resembling a raw cyber BIOS or console overlay */}
      <div className="w-full max-w-xl bg-[#050814] border border-cyan-500/25 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col h-[360px] relative">
        
        {/* Terminal Header Chrome bar */}
        <div className="bg-slate-900 border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            <span className="ml-2 font-mono text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-cyan-400" /> System Boot Sequence
            </span>
          </div>
          <span className="text-[8px] bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded text-cyan-400 font-bold tracking-widest">
            OS v1.4.2
          </span>
        </div>

        {/* Dynamic running print logs buffer */}
        <div className="flex-1 p-5 overflow-y-auto space-y-2 select-text selection:bg-cyan-500/30 scrollbar-thin scrollbar-thumb-white/5 flex flex-col justify-start">
          <div className="space-y-2 flex-1">
            {visibleLines.map((line, idx) => {
              let textStyle = 'text-slate-350';
              if (line.type === 'cmd') textStyle = 'text-cyan-400 font-bold';
              else if (line.type === 'success') textStyle = 'text-emerald-400 font-semibold';
              else if (line.type === 'warn') textStyle = 'text-yellow-400/90';

              return (
                <div key={idx} className={`leading-relaxed flex items-start gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150 ${textStyle}`}>
                  {line.type === 'cmd' ? (
                    <span>{line.text}</span>
                  ) : (
                    <>
                      <span className="text-slate-500 font-black">❯</span>
                      <span>{line.text}</span>
                    </>
                  )}
                </div>
              );
            })}
            
            {/* Blinking CLI Cursor block */}
            <div className="flex items-center gap-1.5 text-cyan-500/80 font-bold h-4">
              <span>anup@portfolio-shell:~$</span>
              <span className={`w-2 h-4 bg-cyan-500 duration-0 ${cursorBlink ? 'opacity-100' : 'opacity-0'}`} />
            </div>
          </div>
        </div>

        {/* Footer info inside preloader */}
        <div className="p-3 border-t border-white/[0.04] bg-slate-900/50 flex justify-between items-center text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 animate-pulse text-cyan-550" />
            <span>Core thread parsing</span>
          </div>
          <button
            onClick={() => {
              sound.playSuccess();
              onComplete();
            }}
            className="px-2.5 py-1 rounded bg-white/5 border border-white/[0.06] hover:bg-cyan-550/15 hover:border-cyan-500/30 hover:text-cyan-400 transition-all font-mono font-bold cursor-pointer"
          >
            Skip Loading ≫
          </button>
        </div>
      </div>
    </div>
  );
}

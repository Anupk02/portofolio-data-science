import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, X, CornerDownLeft, Play, RefreshCw, Layers, ShieldCheck, Cpu } from 'lucide-react';
import { sound } from '../utils';

interface CommandHistory {
  type: 'input' | 'output' | 'error' | 'success' | 'telemetry';
  text: string;
}

export default function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([
    { type: 'telemetry', text: 'ANUP_PORTFOLIO_OS [v1.4.2] READY.' },
    { type: 'telemetry', text: 'SECURE CREDENTIALS SYNCHRONIZED. NETWORKS ONLINE.' },
    { type: 'output', text: 'Type "help" to list available professional subroutines.' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll input to view
  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [history, isOpen]);

  // Handle Hotkey (Ctrl + \ or Ctrl + Option + T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === '\\') || (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't')) {
        e.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTerminal = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        sound.playGlitch();
      } else {
        sound.playClick();
      }
      return next;
    });
  };

  const executeCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    sound.playClick();
    const newHistory = [...history, { type: 'input' as const, text: `anup-core:~$ ${trimmed}` }];
    setHistory(newHistory);
    setCommand('');
    setIsProcessing(true);

    const parts = trimmed.split(' ');
    const baseCmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    // Simulate processing delay for local commands
    setTimeout(async () => {
      let response: CommandHistory[] = [];

      switch (baseCmd) {
        case 'help':
          response = [
            { type: 'success', text: 'AVAILABLE SCI-FI COMMANDS & PIPELINES:' },
            { type: 'output', text: '  whoami       - Reveal full dossier on Anupkumar Koturwar' },
            { type: 'output', text: '  skills       - Compile core micro-kernels and expertise metrics' },
            { type: 'output', text: '  neuros       - Trigger live neural-weight optimization audit' },
            { type: 'output', text: '  agent        - Deploy local autonomous CrewAI RAG swarm simulation' },
            { type: 'output', text: '  chat <query> - Converse live with Anup\'s backend server Gemini model!' },
            { type: 'output', text: '  matrix       - Fetch active Python linear algebra feature weights' },
            { type: 'output', text: '  clear        - Flush terminal buffer logs' },
            { type: 'output', text: '  exit         - Close terminal command deck shell' },
          ];
          sound.playTelemetry();
          break;

        case 'whoami':
          response = [
            { type: 'success', text: 'DOSSIER ID: ANUPKUMAR_KOTURWAR // DATA_SCIENTIST' },
            { type: 'output', text: '-------------------------------------------------------' },
            { type: 'output', text: 'ROLE: Lead Full-Stack AI Engineer & Agent Developer' },
            { type: 'output', text: 'EXPERTISE: Data Science, Python, Deep Learning, Agentic Workflows' },
            { type: 'output', text: 'ACCOLADES: Published Researcher in IEEE Xplore Digital Library.' },
            { type: 'output', text: 'FOCUS: CrewAI, LangGraph, LLM fine-tuning, automated DevOps AI swarms.' },
            { type: 'output', text: 'STATUS: Actively reviewing premium opportunities.' },
            { type: 'output', text: '-------------------------------------------------------' },
          ];
          sound.playTelemetry();
          break;

        case 'skills':
          response = [
            { type: 'success', text: 'MICRO-KERNEL ENGINE SYNAPSES COMPILING...' },
            { type: 'output', text: '  [  P Y T H O N  ]  ████████████████████████████  [ 100% ]' },
            { type: 'output', text: '  [   A G E N T   ]  ██████████████████████████    [  94% ]' },
            { type: 'output', text: '  [  M L /  D L   ]  ████████████████████████      [  90% ]' },
            { type: 'output', text: '  [  C L O U D   ]  ██████████████████████        [  88% ]' },
            { type: 'output', text: '  [  F U L L S T K ]  ████████████████████        [  85% ]' },
          ];
          sound.playTelemetry();
          break;

        case 'neuros':
          response = [
            { type: 'telemetry', text: '>> INITIALIZING MATRIX FEEDBACK HOOK...' },
            { type: 'telemetry', text: '>> RECALCULATING GRADIENTS FOR EMBEDS...' },
            { type: 'success', text: '>> NEW EIGENVALUE OPTIMALLY COMPILED WITH ACCURACY OF 99.42%' },
            { type: 'output', text: 'Optimal weights locked inside core preprocessor sequence memory registries.' },
          ];
          sound.playSuccess();
          break;

        case 'matrix':
          response = [
            { type: 'success', text: 'ACTIVE SHAPE: (3, 3) DENSE COVARIANCE WEIGHTS:' },
            { type: 'output', text: '   [ +0.87,  -0.12,  +0.54 ]' },
            { type: 'output', text: '   [ -0.05,  +1.08,  -0.33 ]' },
            { type: 'output', text: '   [ +0.41,  -0.29,  +0.92 ]' },
            { type: 'output', text: 'EIGENVALUE SIGNATURE: SECURE_ALPHA_ROOT_COMPLIANT' },
          ];
          sound.playTelemetry();
          break;

        case 'agent':
          response = [
            { type: 'telemetry', text: '[CrewAI] Summoning Researcher Agent...' },
            { type: 'telemetry', text: '[Researcher] Searching Web / IEEE Xplore database for "Anupkumar K."...' },
            { type: 'success', text: '[Researcher] Found paper: "Stock Market Volatility Prediction using..."' },
            { type: 'telemetry', text: '[CrewAI] Handing off insights to Strategy Planner Agent...' },
            { type: 'success', text: '[Planner] Consolidated strategic hire pipeline. Dispatching recommendations.' },
            { type: 'output', text: 'CrewAI Multi-Agent Swarm execution concluded cleanly with zero warnings.' },
          ];
          sound.playSuccess();
          break;

        case 'chat':
          if (!args) {
            response = [{ type: 'error', text: 'Syntax error: Please specify a message. E.g. "chat Who built this?"' }];
            setHistory((prev) => [...prev, ...response]);
            setIsProcessing(false);
            return;
          }

          // Call actual server-side chat route!
          try {
            const apiRes = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [{ role: 'user', text: args }]
              })
            });
            const data = await apiRes.json();
            if (data.success) {
              response = [
                { type: 'telemetry', text: '[Gemini Core API Response Incoming...]' },
                { type: 'success', text: data.text }
              ];
            } else {
              response = [{ type: 'error', text: `Gemini API error: ${data.error || 'Unknown error'}` }];
            }
          } catch (err: any) {
            response = [{ type: 'error', text: `Gateway Connection Refused: ${err?.message || 'Server down'}` }];
          }
          break;

        case 'clear':
          setHistory([]);
          setIsProcessing(false);
          return;

        case 'exit':
          setIsOpen(false);
          setIsProcessing(false);
          return;

        default:
          response = [
            { type: 'error', text: `Command not found: "${baseCmd}".` },
            { type: 'output', text: 'Type "help" to list valid system commands.' }
          ];
          sound.playGlitch();
          break;
      }

      setHistory((prev) => [...prev, ...response]);
      setIsProcessing(false);
    }, 450);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeCommand(command);
  };

  return (
    <>
      {/* Floating command launcher ball on bottom right */}
      <div className="fixed bottom-[124px] md:bottom-[140px] right-4 md:right-6 z-40 pointer-events-auto">
        <button
          onClick={toggleTerminal}
          onMouseEnter={() => sound.playHover()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/95 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 font-mono text-[11px] font-bold shadow-lg shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group backdrop-blur-md"
          title="Press Ctrl + \ to open developer console"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <Terminal className="w-3.5 h-3.5 group-hover:rotate-6 transition-transform" />
          <span className="tracking-wide">CLI</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-transparent pointer-events-none z-[100] flex items-center justify-center p-3 select-none">
            {/* Click-away backdrop only handles outer screen layout */}
            <div className="absolute inset-0 bg-black/45 backdrop-blur-md pointer-events-auto" onClick={toggleTerminal} />

            {/* Main Terminal Window Frame */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative w-full max-w-2xl h-[470px] bg-slate-950 border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto font-mono text-xs text-emerald-400"
            >
              {/* Header bar styled like terminal chrome */}
              <div className="bg-slate-900 border-b border-emerald-500/20 px-4 py-3.5 flex items-center justify-between select-none shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 cursor-pointer" onClick={toggleTerminal} />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold tracking-wider text-emerald-300">ANUP_NEURAL_COMMAND_SATELLITE_LINK v1.4.2</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[9px] bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold max-sm:hidden">
                    SOCKET: CRYPTO_LIVE
                  </span>
                  <button
                    onClick={toggleTerminal}
                    className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Console logs area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-2 select-text selection:bg-emerald-500/30 scrollbar-thin scrollbar-thumb-emerald-950/50">
                <div className="space-y-1.5">
                  {history.map((line, idx) => {
                    let textClass = 'text-emerald-400';
                    if (line.type === 'input') textClass = 'text-white font-bold';
                    else if (line.type === 'error') textClass = 'text-red-400';
                    else if (line.type === 'success') textClass = 'text-cyan-400 font-extrabold';
                    else if (line.type === 'telemetry') textClass = 'text-yellow-400/90 italic';

                    return (
                      <div key={idx} className={`whitespace-pre-wrap leading-relaxed ${textClass}`}>
                        {line.text}
                      </div>
                    );
                  })}

                  {isProcessing && (
                    <div className="flex items-center gap-2 text-emerald-500 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Matrix core executing calculations...</span>
                    </div>
                  )}

                  <div ref={terminalEndRef} />
                </div>
              </div>

              {/* Command text input panel */}
              <form
                onSubmit={handleFormSubmit}
                className="bg-slate-900 border-t border-emerald-500/20 px-4 py-3 flex items-center gap-2.5 shrink-0"
              >
                <div className="text-emerald-400 font-bold shrink-0 select-none">anup-core:~$</div>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  disabled={isProcessing}
                  placeholder='Type a command or try "chat tell me your skills"...'
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white font-mono placeholder:text-emerald-900 caret-emerald-400 py-1"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !command.trim()}
                  className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-white transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

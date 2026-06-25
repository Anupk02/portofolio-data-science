import { useState, useEffect } from 'react';
import { ArrowLeft, Github, Folder, FolderOpen, File, ChevronRight, ChevronDown, Play, HelpCircle, Server, Database, Globe, Layers, ArrowRight, Cpu, CheckCircle2, Sparkles, Terminal, RefreshCw } from 'lucide-react';
import { PROJECTS } from '../data';
import { FileNode, DiagramNode } from '../types';
import { sound } from '../utils';

interface ProjectDetailProps {
  slug: string;
  onNavigate: (hash: string) => void;
}

// Collapsible Git File Tree Node Component
function GitNode({ node, depth = 0 }: { key?: string; node: FileNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2); // Keep shallow folders open initially
  const isFolder = node.type === 'folder';

  const toggleOpen = () => {
    if (isFolder) setIsOpen((prev) => !prev);
  };

  return (
    <div className="select-none font-mono text-xs">
      <button
        onClick={toggleOpen}
        className={`flex items-center gap-1.5 py-2.5 md:py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-white/[0.04] w-full text-left transition-colors cursor-pointer min-h-[38px] md:min-h-0 ${
          isFolder ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-400'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            {isOpen ? <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" /> : <Folder className="w-4 h-4 text-blue-500 shrink-0" />}
          </>
        ) : (
          <>
            <div className="w-3.5" /> {/* Align leaf with chevron offset */}
            <File className="w-4 h-4 text-slate-400 shrink-0" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isFolder && isOpen && node.children && (
        <div className="animate-in slide-in-from-top-1 fade-in duration-100">
          {node.children.map((child, idx) => (
            <GitNode key={`${child.name}-${idx}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Sequential SVG pipeline drawing panel
interface PipelineProps {
  nodes: DiagramNode[];
  activeStepOverride?: number | null;
  activeSubnodeHighlight?: string | null;
}

function InteractiveArchitecturePipeline({ 
  nodes, 
  activeStepOverride, 
  activeSubnodeHighlight 
}: PipelineProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Auto increment active step for highlighting data flow
  useEffect(() => {
    if (activeStepOverride !== undefined && activeStepOverride !== null) {
      setActiveStep(activeStepOverride);
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % nodes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [nodes.length, animationKey, activeStepOverride]);

  const handleRestart = () => {
    if (activeStepOverride !== undefined && activeStepOverride !== null) return;
    setActiveStep(0);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 rounded-3xl bg-slate-900 border border-white/[0.06] shadow-xl relative overflow-hidden">
      {/* Styles block to drive sequentially drawing stroke-dashoffset lines smoothly */}
      <style>{`
        @keyframes draw-arrow-line {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fade-node-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .pipeline-arrow {
          stroke-dasharray: 4;
          animation: draw-arrow-line 1.5s linear infinite;
        }
        .node-reveal-item {
          opacity: 0;
          animation: fade-node-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* SVG Container Card Head */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            Agent Sequence Data Flow Pipeline
          </span>
        </div>
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-[10px] tracking-wide active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-3 h-3 text-blue-400 transform rotate-180" />
          <span>Restart Flow</span>
        </button>
      </div>

      {/* Responsive layout list of nodes with styled connecting path indicators */}
      <div className="flex flex-col gap-4 py-2 relative z-10">
        {nodes.map((node, index) => {
          const isActive = index === activeStep;

          return (
            <div key={node.id} className="relative flex flex-col items-center">
              {/* Sequential Item Node */}
              <div
                style={{ animationDelay: `${index * 0.25}s` }}
                className={`node-reveal-item w-full p-4 rounded-xl border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none ${
                  isActive
                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.01]'
                    : 'bg-slate-950/40 border-white/[0.05] hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Styled Badge icon matching roles */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isActive ? 'bg-blue-500/10 border-blue-400/30 text-blue-400' : 'bg-white/[0.02] border-white/[0.04] text-slate-450'
                  }`}>
                    {node.type === 'source' && <Globe className="w-4 h-4" />}
                    {node.type === 'process' && <Server className="w-4 h-4" />}
                    {node.type === 'database' && <Database className="w-4 h-4" />}
                    {node.type === 'parallel_group' && <Cpu className="w-4 h-4 animate-spin-slow" />}
                    {node.type === 'output' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-bold text-slate-100">
                      {node.label}
                    </span>
                    <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">
                      Type: {node.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Subnodes list for complex groups */}
                {node.subnodes && (
                  <div className="flex flex-wrap gap-1.5 md:max-w-md w-full md:w-auto">
                    {node.subnodes.map((sub, sidx) => {
                      const isSubnodeActive = activeSubnodeHighlight === sub;
                      return (
                        <span
                          key={sub}
                          className={`px-2 py-0.5 rounded-md border text-[9px] font-mono transition-all duration-300 tracking-wide ${
                            isSubnodeActive
                              ? 'bg-blue-500/20 border-blue-400 text-blue-350 font-bold scale-[1.05] shadow-[0_0_8px_rgba(59,130,246,0.25)]'
                              : 'bg-white/[0.03] border-white/[0.05] text-slate-400 font-medium'
                          }`}
                        >
                          {sub}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Connecting Flow lines representing flow states */}
              {index < nodes.length - 1 && (
                <div className="py-2.5 flex flex-col items-center select-none pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-700">
                    <path
                      d="M12 2V22"
                      stroke={isActive ? '#3b82f6' : 'currentColor'}
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      className={isActive ? 'pipeline-arrow' : ''}
                    />
                    <path
                      d="M8 17L12 21L16 17"
                      stroke={isActive ? '#3b82f6' : 'currentColor'}
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProjectDetail({ slug, onNavigate }: ProjectDetailProps) {
  const project = PROJECTS.find((p) => p.slug === slug);

  // --- BUILD REPAIR SIMULATION STATES ---
  const [isSimulating, setIsSimulating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simStepIdx, setSimStepIdx] = useState<number | null>(null);
  const [simNodeOverride, setSimNodeOverride] = useState<number | null>(null);
  const [simSubnodeOverride, setSimSubnodeOverride] = useState<string | null>(null);

  // Clear states when project changes
  useEffect(() => {
    setIsSimulating(false);
    setShowReport(false);
    setSimLogs([]);
    setSimStepIdx(null);
    setSimNodeOverride(null);
    setSimSubnodeOverride(null);
  }, [slug]);

  const runSimulation = () => {
    setIsSimulating(true);
    setShowReport(false);
    setSimLogs([]);
    setSimStepIdx(0);
    setSimNodeOverride(1); // Repo Analysis Agent (Index 1)
    setSimSubnodeOverride(null);
    sound.playGlitch();

    // Use a precise timeline stack to push logs sequentially and highlight corresponding nodes
    let accumTime = 0;

    // Step 0: Repo analysis
    const step0Logs = [
      "anup@agent-ops:~$ boot --mode=simulator --job=build-reconstruct",
      "🤖 [System Host] Triggering AI troubleshooting sequence...",
      "🤖 [Repo Analysis Agent] Scanning project commit tree...",
      "❌ FAIL: GitHub Actions job 'run-tests' failed in auth_test.py (Exit Code: 1)",
      "🤖 [Repo Analysis Agent] Discovered build core trace. Dispatching workspace dump to collaborative workspace..."
    ];
    step0Logs.forEach((line, lineIdx) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, line]);
        sound.playTelemetry();
      }, accumTime + lineIdx * 350);
    });
    accumTime += 2200;

    // Step 1: Build Validation Agent
    setTimeout(() => {
      setSimStepIdx(1);
      setSimNodeOverride(2); // CrewAI
      setSimSubnodeOverride("Build Validation Agent");
      const step1Logs = [
        "🤖 [Build Validation Agent] Spinning up initial sandbox container...",
        "🤖 [Build Validation Agent] Executing pytest validation suite...",
        "❌ test_jwt_handshake_flow in tests/auth_test.py (L:124) raised exception:",
        "   KeyError: 'DATABASE_URL' in conftest.py:24",
        "🤖 [Build Validation Agent] Exception trace captured. Passing state to Log Analysis Agent..."
      ];
      step1Logs.forEach((line, lineIdx) => {
        setTimeout(() => {
          setSimLogs(prev => [...prev, line]);
          sound.playTelemetry();
        }, lineIdx * 300);
      });
    }, accumTime);
    accumTime += 2000;

    // Step 2: Log Analysis Agent
    setTimeout(() => {
      setSimStepIdx(2);
      setSimNodeOverride(2); // CrewAI
      setSimSubnodeOverride("Log Analysis Agent");
      const step2Logs = [
        "🤖 [Log Analysis Agent] Disassembling raw traceback...",
        "🤖 [Log Analysis Agent] Key signature: KeyError('DATABASE_URL')",
        "🤖 [Log Analysis Agent] Categorized as 'Missing Context Environment Configuration' in deployment yaml.",
        "🤖 [Log Analysis Agent] Passing details to Root Cause Analyst..."
      ];
      step2Logs.forEach((line, lineIdx) => {
        setTimeout(() => {
          setSimLogs(prev => [...prev, line]);
          sound.playTelemetry();
        }, lineIdx * 300);
      });
    }, accumTime);
    accumTime += 1800;

    // Step 3: Root Cause Analyst
    setTimeout(() => {
      setSimStepIdx(3);
      setSimNodeOverride(2); // CrewAI
      setSimSubnodeOverride("Root Cause analyst");
      const step3Logs = [
        "🤖 [Root Cause Analyst] Auditing paths: /backend/app/core/config.py, .github/workflows/ci-cd.yml...",
        "📌 Root cause discovered: Pytest runner relies on postgres, but CI/CD container has no 'postgres' dependency declared or secret environment tags.",
        "🤖 [Root Cause Analyst] Synthesizing mitigation query: 'PostgreSQL environment mappings in CI Actions'..."
      ];
      step3Logs.forEach((line, lineIdx) => {
        setTimeout(() => {
          setSimLogs(prev => [...prev, line]);
          sound.playTelemetry();
        }, lineIdx * 300);
      });
    }, accumTime);
    accumTime += 1800;

    // Step 4: RAG Layer
    setTimeout(() => {
      setSimStepIdx(4);
      setSimNodeOverride(3); // RAG Layer
      setSimSubnodeOverride(null);
      const step4Logs = [
        "🗄️ [RAG Retrieval Core] Encoding search vectors (SentenceTransformers)...",
        "🗄️ [RAG Retrieval Core] Querying local database ChromaDB indexes...",
        "🎯 Hit found (Cosine Sim: 0.96): 'Actions configuration template for postgres runners'",
        "💡 Extraction: Set Postgres service block in Actions workflow with DATABASE_URL mapped."
      ];
      step4Logs.forEach((line, lineIdx) => {
        setTimeout(() => {
          setSimLogs(prev => [...prev, line]);
          sound.playTelemetry();
        }, lineIdx * 300);
      });
    }, accumTime);
    accumTime += 1800;

    // Step 5: LangGraph Orchestrator
    setTimeout(() => {
      setSimStepIdx(5);
      setSimNodeOverride(4); // LangGraph
      setSimSubnodeOverride(null);
      const step5Logs = [
        "🧠 [LangGraph Orchestrator] Triggering state node: 'apply_workflow_patch'...",
        "📝 Generating YAML delta block for .github/workflows/ci-cd.yml...",
        "📝 Adding postgres container service definitions and system variables under 'pytest' steps...",
        "⚙️ [Validation Agent] Checking syntax integrity... Passed."
      ];
      step5Logs.forEach((line, lineIdx) => {
        setTimeout(() => {
          setSimLogs(prev => [...prev, line]);
          sound.playTelemetry();
        }, lineIdx * 300);
      });
    }, accumTime);
    accumTime += 1800;

    // Step 6: Output Reports
    setTimeout(() => {
      setSimStepIdx(6);
      setSimNodeOverride(5); // Reports
      setSimSubnodeOverride(null);
      const step6Logs = [
        "📊 [System] Compiling comprehensive resolution records...",
        "🚀 Triggering pre-commit compiler validation (dry-run mode)...",
        "✅ SUCCESS: All tests passed. Exit status: 0. Build repair verified.",
        "anup@agent-ops:~$ simulation concluded. Report generated."
      ];
      step6Logs.forEach((line, lineIdx) => {
        setTimeout(() => {
          setSimLogs(prev => [...prev, line]);
          sound.playSuccess();
        }, lineIdx * 300);
      });
    }, accumTime);
    accumTime += 2000;

    // End simulation, show report card
    setTimeout(() => {
      setIsSimulating(false);
      setShowReport(true);
      sound.playSuccess();
    }, accumTime);
  };

  useEffect(() => {
    // Scroll window instantly back up upon mounting
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 text-center">
        <HelpCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="font-sans text-2xl font-bold text-slate-800 dark:text-slate-150">Case Study Not Found</h2>
        <button
          onClick={() => onNavigate('#projects')}
          className="mt-4 flex items-center gap-2 text-blue-500 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </button>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Decorative localized vector backgrounds */}
      <div className="absolute top-[10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[25rem] h-[25rem] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          id="project-detail-back-top"
          onClick={() => onNavigate('#projects')}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 group mb-8 cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO PORTFOLIO HOME</span>
        </button>

        {/* 1. Header block */}
        <div className="border-b border-slate-200 dark:border-white/[0.06] pb-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">
                {project.title}
              </h1>
              <p className="font-sans text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                {project.tagline}
              </p>
            </div>

            {/* Action buttons (Omit/hide GitHub URL if not provided) */}
            {project.githubUrl && (
              <a
                id="project-detail-github-btn"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-white/10 text-white hover:bg-slate-800 text-xs font-extrabold shadow-md transform hover:-translate-y-0.5 active:scale-95 duration-200 cursor-pointer shrink-0"
              >
                <Github className="w-4 h-4" />
                <span>Source Repository</span>
              </a>
            )}
          </div>

          {/* Full tech stack animated pill tags */}
          <div className="flex flex-wrap gap-2 mt-8 select-none">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] font-mono text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Grid Layout: Left Details vs Right Assets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Overview & Features (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-12">
            {/* 2. Overview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-100/30 dark:bg-slate-900/10 border border-slate-200/50 dark:border-white/[0.03] shadow-md">
              <h2 className="font-sans font-bold text-lg text-slate-800 dark:text-slate-200 mb-4 select-none tracking-tight">
                Project Overview
              </h2>
              <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed select-text font-medium tracking-wide">
                {project.overview}
              </p>
            </div>

            {/* 5. Key Features */}
            <div>
              <h2 className="font-sans font-extrabold text-xl text-slate-800 dark:text-slate-100 mb-6 select-none tracking-tight border-b border-slate-200 dark:border-white/[0.04] pb-2 w-fit">
                Key Deliverables & Implementations
              </h2>
              <div className="flex flex-col gap-4">
                {project.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/[0.03] flex items-start gap-3.5 hover:border-blue-500/10 transition-all duration-200"
                  >
                    <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0 mt-0.5 select-none">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-450 leading-relaxed select-text">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Diagram & Repo explorer (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-10">
            {/* 3. Animated Flow/Architecture Diagram */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-sans font-bold text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                  // Pipeline Architecture
                </h3>
                
                {project.slug === 'devops-ai-platform' && (
                  <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-dotted border-red-500/40 hover:border-red-400 bg-red-500/5 hover:bg-red-500/15 text-red-400 font-sans text-[11px] font-extrabold transition-all duration-200 disabled:opacity-40 animate-pulse cursor-pointer shrink-0"
                  >
                    <Terminal className="w-3.5 h-3.5 text-red-400" />
                    <span>{isSimulating ? 'Simulating Fault...' : 'Simulate a Build Failure'}</span>
                  </button>
                )}
              </div>

              {/* Live terminal simulation logs & Recommendation report display */}
              {project.slug === 'devops-ai-platform' && (isSimulating || showReport || simLogs.length > 0) && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Console Terminal Log Box */}
                  <div className="flex flex-col rounded-3xl bg-[#030611] border border-cyan-500/20 p-5 shadow-inner min-h-[250px] max-h-[300px] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                        <span className="ml-1 font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-widest">// Multi-Agent DevOps Terminal</span>
                      </div>
                      <span className="font-mono text-[8.5px] text-cyan-500/50 uppercase tracking-widest font-extrabold max-sm:hidden">
                        JOB: LOCAL_DEBUG
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] text-cyan-400 scrollbar-thin scrollbar-thumb-white/5 pr-2">
                      {simLogs.map((log, lidx) => {
                        let isCmd = log.startsWith("anup@agent-ops") || log.startsWith("anup@portfolio");
                        let isFail = log.includes("❌") || log.includes("error") || log.includes("Error") || log.includes("KeyError") || log.includes("fail") || log.includes("FAIL");
                        let isSuccess = log.includes("✅") || log.includes("SUCCESS") || log.includes("Passed");
                        
                        return (
                          <div 
                            key={lidx} 
                            className={`leading-relaxed whitespace-pre-wrap ${
                              isCmd ? 'text-white font-bold' : 
                              isFail ? 'text-red-400 font-medium' : 
                              isSuccess ? 'text-emerald-400 font-semibold' : 'text-slate-350'
                            }`}
                          >
                            {!isCmd && <span className="text-slate-500 inline-block mr-1.5">❯</span>}
                            <span>{log}</span>
                          </div>
                        );
                      })}
                      {isSimulating && (
                        <div className="flex items-center gap-2 text-cyan-400/80 animate-pulse mt-1">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                          </span>
                          <span>Agents collaborating... executing task matrix</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendation Report Card */}
                  {showReport && (
                    <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
                      <div className="absolute top-[-20%] right-[-10%] w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                      <div className="flex items-start justify-between border-b border-white/[0.08] pb-3 mb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 px-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="font-sans font-bold text-[11px] uppercase tracking-wider text-white">AI RESOLUTION REPORT INTEL</h4>
                            <p className="font-mono text-[8px] text-emerald-400 uppercase mt-0.5 font-bold tracking-widest leading-none">
                              REPAIR STATUS: GREEN (100% HEALTH)
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={runSimulation}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans text-[9px] font-black tracking-wide cursor-pointer transition-all active:scale-95 shadow-md shrink-0"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Replay</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <span className="font-mono text-[7.5px] uppercase text-slate-500 tracking-widest font-black">Captured Defect</span>
                            <p className="font-sans text-[11.5px] font-semibold text-slate-200 mt-1 select-text">Missing postgres dependency & DATABASE_URL in ci-cd.yml</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <span className="font-mono text-[7.5px] uppercase text-slate-500 tracking-widest font-black">Applied Mitigation</span>
                            <p className="font-sans text-[11.5px] font-semibold text-slate-200 mt-1 select-text">Auto-injected docker services map & env test config</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between flex-wrap gap-2 select-none">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🎯</span>
                            <div className="flex flex-col">
                              <span className="font-sans text-[10px] font-bold text-slate-200 leading-none">Diagnostic confidence rating</span>
                              <span className="font-sans text-[8px] text-slate-500 leading-none mt-1">Validated across historical corpus records</span>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] font-black text-emerald-400 bg-emerald-950/30 border border-emerald-505/20 px-2.5 py-0.5 rounded">
                            98.42% Confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <InteractiveArchitecturePipeline 
                nodes={project.diagramNodes} 
                activeStepOverride={simStepIdx !== null && isSimulating ? simNodeOverride : undefined}
                activeSubnodeHighlight={simStepIdx !== null && isSimulating ? simSubnodeOverride : undefined}
              />
            </div>

            {/* 4. Animated git structure file-tree */}
            <div>
              <h3 className="font-sans font-bold text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 select-none">
                // Explorer Code Base Structure
              </h3>
              <div className="p-4 rounded-3xl bg-slate-900 border border-white/[0.06] shadow-xl">
                {/* Simulated editor panel header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3 px-2 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                    VSCode IDE Sidebar
                  </span>
                </div>

                {/* Git Root Recursive item */}
                <div className="overflow-x-auto overflow-y-auto max-h-[20rem] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <GitNode node={project.gitRepo} depth={0} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back navigation CTA */}
        <div className="mt-16 pt-8 border-t border-slate-205 dark:border-white/[0.04] flex justify-center">
          <button
            id="project-detail-back-bottom"
            onClick={() => onNavigate('#projects')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.02] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-slate-202 dark:border-white/[0.06] font-sans text-xs font-bold text-slate-705 dark:text-slate-200 shadow active:scale-95 duration-200 cursor-pointer select-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portfolio Home</span>
          </button>
        </div>
      </div>
    </section>
  );
}

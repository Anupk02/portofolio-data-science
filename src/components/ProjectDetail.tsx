import { useState, useEffect } from 'react';
import { ArrowLeft, Github, Folder, FolderOpen, File, ChevronRight, ChevronDown, Play, HelpCircle, Server, Database, Globe, Layers, ArrowRight, Cpu, CheckCircle2 } from 'lucide-react';
import { PROJECTS } from '../data';
import { FileNode, DiagramNode } from '../types';

interface ProjectDetailProps {
  slug: string;
  onNavigate: (hash: string) => void;
}

// Collapsible Git File Tree Node Component
function GitNode({ node, depth = 0 }: { key?: string; node: FileNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2); // Keep shallow folders open initially
  const isFolder = node.type === 'folder';

  const toggleOpen = () => {
    if (isFolder) setIsOpen(!isOpen);
  };

  return (
    <div className="select-none font-mono text-xs">
      <button
        onClick={toggleOpen}
        className={`flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-205 dark:hover:bg-white/[0.04] w-full text-left transition-colors cursor-pointer ${
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
function InteractiveArchitecturePipeline({ nodes }: { nodes: DiagramNode[] }) {
  const [activeStep, setActiveStep] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Auto increment active step for highlighting data flow
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % nodes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [nodes.length, animationKey]);

  const handleRestart = () => {
    setActiveStep(0);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/[0.06] shadow-xl relative overflow-hidden">
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
                    {node.subnodes.map((sub, sidx) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05] text-[9px] font-mono text-slate-400 font-medium"
                      >
                        {sub}
                      </span>
                    ))}
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
          onClick={() => onNavigate('#/')}
          className="mt-4 flex items-center gap-2 text-blue-500 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
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
          onClick={() => onNavigate('#/')}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 group mb-8 cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO PORTFOLIO HOME</span>
        </button>

        {/* 1. Header block */}
        <div className="border-b border-slate-205 dark:border-white/[0.06] pb-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-850 dark:text-slate-100 transition-colors">
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
                className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.02] border border-slate-205 dark:border-white/[0.04] font-mono text-[10px] sm:text-[11px] font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider"
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
              <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-slate-450 leading-relaxed select-text font-medium tracking-wide">
                {project.overview}
              </p>
            </div>

            {/* 5. Key Features */}
            <div>
              <h2 className="font-sans font-extrabold text-xl text-slate-850 dark:text-slate-100 mb-6 select-none tracking-tight border-b border-slate-205 dark:border-white/[0.04] pb-2 w-fit">
                Key Deliverables & Implementations
              </h2>
              <div className="flex flex-col gap-4">
                {project.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-150-light dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/[0.03] flex items-start gap-3.5 hover:border-blue-500/10 transition-all duration-200"
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
            <div>
              <h3 className="font-sans font-bold text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 select-none">
                // Pipeline Architecture
              </h3>
              <InteractiveArchitecturePipeline nodes={project.diagramNodes} />
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
                <div className="overflow-y-auto max-h-[20rem] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
            onClick={() => onNavigate('#/')}
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

import React, { useState, useEffect } from 'react';
import { 
  Code2, Brain, Layers, Compass, PieChart, Database, Wrench, 
  CheckSquare, Sparkles, Terminal, Activity, TrendingUp, Bot, Cpu, Network,
  Play, RefreshCw, Sliders, Hash, Layers3, Check, HelpCircle
} from 'lucide-react';
import { SKILL_CATEGORIES } from '../data';
import { sound } from '../utils';

// Color profiles with glowing neon borders for each distinct cluster
const CATEGORY_THEMES = [
  {
    themeColor: 'amber',
    iconColor: 'text-amber-500 dark:text-amber-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-amber-400',
    gradient: 'from-amber-600/5 to-yellow-500/[0.02]',
    activeGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500 dark:border-amber-400 bg-amber-500/10 dark:bg-amber-950/20',
    bannerGlow: 'from-amber-400 via-yellow-400 to-orange-500',
    tagClass: 'text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-950/40 border-amber-300/30 dark:border-amber-500/20',
    fileLabel: 'interpreter.py',
  },
  {
    themeColor: 'fuchsia',
    iconColor: 'text-fuchsia-500 dark:text-fuchsia-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-fuchsia-400',
    gradient: 'from-fuchsia-600/5 to-pink-500/[0.02]',
    activeGlow: 'shadow-[0_0_20px_rgba(217,70,239,0.2)] border-fuchsia-500 dark:border-fuchsia-400 bg-fuchsia-500/10 dark:bg-fuchsia-950/20',
    bannerGlow: 'from-fuchsia-400 via-purple-500 to-pink-500',
    tagClass: 'text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-100/50 dark:bg-fuchsia-950/40 border-fuchsia-300/30 dark:border-fuchsia-500/20',
    fileLabel: 'agent_core.py',
  },
  {
    themeColor: 'cyan',
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-500/20 group-hover:border-cyan-400',
    gradient: 'from-cyan-600/5 to-sky-500/[0.02]',
    activeGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)] border-cyan-500 dark:border-cyan-400 bg-cyan-500/10 dark:bg-cyan-950/20',
    bannerGlow: 'from-cyan-400 via-teal-400 to-blue-500',
    tagClass: 'text-cyan-700 dark:text-cyan-300 bg-cyan-100/50 dark:bg-cyan-950/40 border-cyan-300/30 dark:border-cyan-500/20',
    fileLabel: 'frameworks.ts',
  },
  {
    themeColor: 'emerald',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-emerald-400',
    gradient: 'from-emerald-600/5 to-teal-500/[0.02]',
    activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)] border-emerald-500 dark:border-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/20',
    bannerGlow: 'from-emerald-400 via-green-400 to-teal-500',
    tagClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950/40 border-emerald-300/30 dark:border-emerald-500/20',
    fileLabel: 'evaluation.r',
  },
  {
    themeColor: 'rose',
    iconColor: 'text-rose-500 dark:text-rose-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-rose-400',
    gradient: 'from-rose-600/5 to-pink-500/[0.02]',
    activeGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)] border-rose-500 dark:border-rose-400 bg-rose-500/10 dark:bg-rose-950/20',
    bannerGlow: 'from-rose-400 via-pink-400 to-red-500',
    tagClass: 'text-rose-700 dark:text-rose-300 bg-rose-100/50 dark:bg-rose-950/40 border-rose-300/30 dark:border-rose-500/20',
    fileLabel: 'dashboards.py',
  },
  {
    themeColor: 'blue',
    iconColor: 'text-blue-500 dark:text-blue-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-blue-500',
    gradient: 'from-blue-600/5 to-indigo-500/[0.02]',
    activeGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)] border-blue-500 dark:border-blue-400 bg-blue-500/10 dark:bg-blue-950/20',
    bannerGlow: 'from-blue-400 via-indigo-400 to-violet-500',
    tagClass: 'text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-950/40 border-blue-300/30 dark:border-blue-500/20',
    fileLabel: 'registry.sql',
  },
  {
    themeColor: 'violet',
    iconColor: 'text-violet-500 dark:text-violet-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-violet-400',
    gradient: 'from-violet-600/5 to-purple-500/[0.02]',
    activeGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)] border-violet-500 dark:border-violet-400 bg-violet-500/10 dark:bg-violet-950/20',
    bannerGlow: 'from-violet-400 via-purple-400 to-indigo-500',
    tagClass: 'text-violet-700 dark:text-violet-300 bg-violet-100/50 dark:bg-violet-950/40 border-violet-300/30 dark:border-violet-500/20',
    fileLabel: 'devops.yaml',
  },
  {
    themeColor: 'orange',
    iconColor: 'text-orange-500 dark:text-orange-400',
    borderColor: 'border-slate-200 dark:border-slate-800 hover:border-orange-400',
    gradient: 'from-orange-600/5 to-red-500/[0.02]',
    activeGlow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)] border-orange-500 dark:border-orange-400 bg-orange-500/10 dark:bg-orange-950/20',
    bannerGlow: 'from-orange-400 via-amber-400 to-red-500',
    tagClass: 'text-orange-700 dark:text-orange-300 bg-orange-100/50 dark:bg-orange-950/40 border-orange-300/30 dark:border-orange-500/20',
    fileLabel: 'traits.json',
  },
];

interface RpgSkillItem {
  name: string;
  level: number;
  tagline: string;
  color: string;
}

const RpgSkillRow: React.FC<{ skill: RpgSkillItem }> = ({ skill }) => {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHovered(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      onMouseEnter={() => {
        setHovered(true);
        sound.playHover();
      }}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-slate-100/30 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 hover:border-cyan-500/35 p-3.5 rounded-2xl transition-all duration-300 hover:translate-x-1 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2 select-none">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-cyan-500 dark:text-cyan-400 font-bold bg-cyan-100/60 dark:bg-cyan-950/40 border border-cyan-300/30 dark:border-cyan-500/20 px-1.5 py-0.5 rounded">
            LV.{skill.level}
          </span>
          <span className="font-sans font-extrabold text-[12.5px] text-slate-800 dark:text-slate-100 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors uppercase">
            {skill.name}
          </span>
          {hovered && (
            <span className="font-mono text-[8.5px] font-bold text-amber-600 dark:text-amber-500 animate-pulse bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20 rounded">
              ⚡ LIVE UNLOCKED CLASS OVERDRIVE
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 font-sans leading-tight italic max-w-sm text-left sm:text-right">
          {skill.tagline}
        </span>
      </div>

      <div className="h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden relative">
        <div 
          className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000`}
          style={{ width: hovered ? `${skill.level}%` : '8%' }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(1); // Default to agentic ai for max initial high-vibe impact!

  // --- Interactive States for each Sandbox Case ---
  // Case 0: Programming Languages Python Compiler Interpreter
  const [compilerLogs, setCompilerLogs] = useState<string[]>([
    '>>> sys.version_info(major=3, minor=11, micro=6)',
    '>>> importing tensor_extensions.c',
    '>>> system ready for multi-thread python matrix loops...'
  ]);
  const [isCompiling, setIsCompiling] = useState(false);

  // Case 1: Neural Network bias nodes
  const [neuronWeights, setNeuronWeights] = useState<number[]>([0.84, -0.42, 1.25, 0.18, -0.95]);
  const [synapticStrength, setSynapticStrength] = useState<number>(93.8);

  // Case 2: Tensor Matrix Cells
  const [tensorMatrix, setTensorMatrix] = useState<number[][]>([
    [1.0, 0.0, 0.4],
    [0.2, 0.8, -0.3],
    [-0.5, 0.1, 1.2]
  ]);

  // Case 3: Gaussian Bell curve calculator (Dynamic Alpha significance)
  const [alphaVal, setAlphaVal] = useState<number>(0.05);
  const [calculatedPValue, setCalculatedPValue] = useState<number>(0.024);

  // Case 4: Scatter Plot embedding values
  const [selectedEmbPoint, setSelectedEmbPoint] = useState<number | null>(2);
  const embedPoints = [
    { id: 1, label: 'Bert-latent-vector-018', x: 25, y: 70, similarity: 0.965, category: 'NLP' },
    { id: 2, label: 'Gemini-agent-dense-415', x: 50, y: 35, similarity: 0.982, category: 'Agentic' },
    { id: 3, label: 'Huggingface-t5-sparse-02', x: 80, y: 80, similarity: 0.894, category: 'Seq2Seq' },
    { id: 4, label: 'Llama-weights-quant-q4', x: 15, y: 20, similarity: 0.941, category: 'LLM' },
    { id: 5, label: 'SentenceTransformer-emb', x: 65, y: 60, similarity: 0.927, category: 'Semantic' }
  ];

  // Case 5: HNSW databases tree nodes routing
  const [activeDbSearchPath, setActiveDbSearchPath] = useState<string[]>(['root']);
  const [foundKeyDetails, setFoundKeyDetails] = useState<string>('Search query initiated. Hover or click HNSW branches.');

  // Case 6: Docker Kubernetes micro clusters
  const [dockerNodes, setDockerNodes] = useState([
    { id: 'ollama-node-1', name: 'ollama-llama3.8b', type: 'LLM Host', status: 'HEALTHY', usage: '4.2GB' },
    { id: 'chromadb-vector-1', name: 'chromadb-segment-store', type: 'Vector Database', status: 'WARN', usage: '1.8GB' },
    { id: 'fastapi-gateway-1', name: 'fastapi-api-routing', type: 'REST Endpoint', status: 'HEALTHY', usage: '0.4GB' },
    { id: 'crewai-task-1', name: 'crewai-agent-sandbox', type: 'Agent Framework', status: 'CRASHED', usage: '0.0GB' },
  ]);

  // Case 7: Brain synapses
  const [synapseHovered, setSynapseHovered] = useState<string>('Hover any connectome strand');

  // Helper trigger compilers
  const handleCompileTrigger = () => {
    if (isCompiling) return;
    sound.playTelemetry();
    setIsCompiling(true);
    setCompilerLogs(prev => [...prev.slice(-3), '>>> [INITIATING JIT COMPILER] optimize_vector() ...']);
    
    setTimeout(() => {
      setCompilerLogs(prev => [
        ...prev.slice(-4),
        '>>> [1/2] vectorizing parallel float array numpy metrics (100,000 floats)',
        '>>> [2/2] linked C-Extension binding at node 0x7ffd5f70b ...'
      ]);
      sound.playTelemetry();
    }, 800);

    setTimeout(() => {
      setCompilerLogs(prev => [
        ...prev.slice(-4),
        '>>> Execution loop complete. Optimization time: 0.082ms. Saved: 4.1x overhead.',
        '>>> sys.exit_code(0) // STATUS_SUCCESS'
      ]);
      sound.playSuccess();
      setIsCompiling(false);
    }, 1800);
  };

  const handleNeuronClick = (index: number) => {
    sound.playClick();
    const updated = [...neuronWeights];
    // Cycle node value
    const baseNew = parseFloat((updated[index] + 0.45).toFixed(2));
    updated[index] = baseNew > 1.8 ? -1.0 : baseNew;
    setNeuronWeights(updated);

    // Dynamic calculate Synaptic Strength indicator
    const sumSq = updated.reduce((acc, v) => acc + Math.pow(v, 2), 0);
    const mockStrength = parseFloat(Math.min(100, Math.max(20, sumSq * 22)).toFixed(1));
    setSynapticStrength(mockStrength);
  };

  const incrementMatrixCell = (rowIndex: number, colIndex: number) => {
    sound.playClick();
    const updated = tensorMatrix.map((row, rIdx) => 
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex) {
          const newVal = parseFloat((cell + 0.1).toFixed(1));
          return newVal > 2.0 ? -1.0 : newVal;
        }
        return cell;
      })
    );
    setTensorMatrix(updated);
  };

  const restartDockerContainer = (id: string) => {
    sound.playGlitch();
    setDockerNodes(prev => prev.map(node => {
      if (node.id === id) {
        return { ...node, status: 'REBOOTING', usage: 'PINGING...' };
      }
      return node;
    }));

    setTimeout(() => {
      setDockerNodes(prev => prev.map(node => {
        if (node.id === id) {
          sound.playSuccess();
          return { ...node, status: 'HEALTHY', usage: '2.1GB' };
        }
        return node;
      }));
    }, 1500);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    setAlphaVal(newVal);
    // Simulating alpha-recalc statistics
    const calculatedP = parseFloat(Math.max(0.001, Math.min(0.09, newVal * 0.48)).toFixed(3));
    setCalculatedPValue(calculatedP);
    if (Math.floor(newVal * 100) % 2 === 0) {
      sound.playHover();
    }
  };

  const getIconForCategory = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('programming')) return <Code2 className="w-4.5 h-4.5" />;
    if (lower.includes('machine learning') || lower.includes('ai')) return <Brain className="w-4.5 h-4.5" />;
    if (lower.includes('frameworks')) return <Layers className="w-4.5 h-4.5" />;
    if (lower.includes('analysis') || lower.includes('evaluation')) return <Compass className="w-4.5 h-4.5" />;
    if (lower.includes('visualization')) return <PieChart className="w-4.5 h-4.5" />;
    if (lower.includes('databases')) return <Database className="w-4.5 h-4.5" />;
    if (lower.includes('tools')) return <Wrench className="w-4.5 h-4.5" />;
    return <CheckSquare className="w-4.5 h-4.5" />;
  };

  // Dedicated custom dynamic technical summary reports
  const getReadoutMap = (idx: number) => {
    switch(idx) {
      case 0:
        return {
          title: "COMPILE ENGINE INTERFACE // python_interpreter.bin",
          stats: [
            { label: "Execution Speed", value: "0.08ms" },
            { label: "Memory Footprint", value: "3.4 MB" },
            { label: "C-Extension Bindings", value: "Optimized" },
            { label: "Typing Compliance", value: "PEP 8 Standard" }
          ],
          insights: "Leveraging structured, highly typed Python environments to process high-dimensional array tensors and configure fast REST endpoints securely."
        };
      case 1:
        return {
          title: "AUTONOMOUS AGENT CONSOLE // crewai_lead_orchestrator",
          stats: [
            { label: "Agents Configured", value: "CrewAI & LangGraph" },
            { label: "RAG Pipeline Accuracy", value: "99.2%" },
            { label: "Context Window Cap", value: "128k Token Limit" },
            { label: "Model Orchestration", value: "Local Ollama Sandbox" }
          ],
          insights: "Engineering multi-tier autonomous architectures. Combining LangGraph task-flow branches with RAG sentence embeddings to resolve dynamic logical queries."
        };
      case 2:
        return {
          title: "PREDICTIVE TENSOR PIPELINES // scikit_model_eval",
          stats: [
            { label: "Validation Fold Splits", value: "K-Fold (k=5)" },
            { label: "Model Precision Rate", value: "0.941 Classifier" },
            { label: "F1 Matrix Stability", value: "93.4% Balance" },
            { label: "API Ingestion Latency", value: "<15ms REST" }
          ],
          insights: "Building feature engineering matrix transformations inside Pandas pipelines, enabling reliable model deployment through responsive endpoints."
        };
      case 3:
        return {
          title: "STATISTICAL EVALUATION INTERFACE // exploratory_analytics.r",
          stats: [
            { label: "Significance Threshold", value: `p-value < ${alphaVal}` },
            { label: "Hypothesis Verdict", value: calculatedPValue < alphaVal ? "REJECT NULL HYPOTHESIS" : "FAIL TO REJECT" },
            { label: "ANOVA F-Ratio", value: "F-Statistic: 34.2" },
            { label: "Confidence Bounds", value: "95% Two-Tailed" }
          ],
          insights: "Deploying rigid hypothesis testing modules, translating experimental Plagiarism detection accuracies, and purifying raw features."
        };
      case 4:
        return {
          title: "VECTOR HOOT PLOTTING ENGINE // seaborn_render_engine",
          stats: [
            { label: "Renderer Frame Rate", value: "60 FPS Native" },
            { label: "Visual Color System", value: "Vivid Glow Pipeline" },
            { label: "Power BI Connectors", value: "Direct Excel Hooked" },
            { label: "Grid Projection", value: "Latent Cosine Space" }
          ],
          insights: "Formulating beautiful visual summaries that map highly abstract matrix patterns to let researchers explore hidden dimensional vectors directly."
        };
      case 5:
        return {
          title: "STRUCTURED INDEX REGISTRAR // mysql_postgres_index",
          stats: [
            { label: "Search Read Latency", value: "3.8 ms Indexed" },
            { label: "KNN Search Schema", value: "HNSW on ChromaDB" },
            { label: "Active Pools", value: "PostgreSQL (Max 25)" },
            { label: "Integrity Protocols", value: "Full ACID Compliant" }
          ],
          insights: "Scaling localized databases to index vector datasets representing legal filings, enabling nearest-neighbor retrieval patterns in micro-seconds."
        };
      case 6:
        return {
          title: "CONTAINER DEVOPS DECK // docker_container_daemon",
          stats: [
            { label: "Orchestration Nodes", value: "Docker Host Node" },
            { label: "Actions Pipeline Status", value: "Trigger: Passed" },
            { label: "Target VPC Deploy", value: "Amazon AWS Container" },
            { label: "LLM Host Port", value: "Ollama Port 11434" }
          ],
          insights: "Packaging modular pipelines into container instances, establishing reliable automation checks, and hosting private LLM endpoints safely."
        };
      default:
        return {
          title: "CORE COGNITIVE SYNAPSE // problem_solving_engine",
          stats: [
            { label: "Analytical Bandwidth", value: "Infinite Loops" },
            { label: "Sinc Sync Capacity", value: "100% Collaborative" },
            { label: "Creative Coefficient", value: "Advanced AI Sync" },
            { label: "Development Principle", value: "Clean, Verified Source" }
          ],
          insights: "Bridging mathematical complexity with professional software design to build clean, ultra-responsive web applications that users love."
        };
    }
  };

  const activeReadout = getReadoutMap(activeCategoryIdx);
  const activeTheme = CATEGORY_THEMES[activeCategoryIdx];

  return (
    <section id="skills" className="py-24 border-t border-slate-200/45 dark:border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Heading Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 select-none">
          <span className="font-mono text-xs font-bold tracking-widest text-cyan-500 dark:text-cyan-400 uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>TECHNICAL_MATRIX</span>
          </span>
          <h2 className="font-sans text-3xl sm:text-4.5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mt-2.5 transition-colors">
            Core Competencies & Stack
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed">
            Click any technology card below to hot-patch the visual compiler terminal. Adjust node weights, trigger regressions, or reboot mock containers in real time.
          </p>
        </div>

        {/* Dynamic Glowing Techno Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {SKILL_CATEGORIES.map((categoryObj, index) => {
            const isActive = activeCategoryIdx === index;
            const theme = CATEGORY_THEMES[index] || CATEGORY_THEMES[0];
            return (
              <button
                key={categoryObj.category}
                id={`skills-card-${index}`}
                onClick={() => {
                  sound.playTelemetry();
                  setActiveCategoryIdx(index);
                }}
                onMouseEnter={() => sound.playHover()}
                className={`text-left p-5 flex flex-col justify-between h-full rounded-2xl transition-all duration-300 border backdrop-blur-xl relative overflow-hidden group cursor-pointer select-none min-h-[160px] ${
                  isActive 
                    ? `bg-slate-900 dark:bg-slate-900/95 shadow-lg ${theme.activeGlow} scale-[1.01]` 
                    : `bg-white/40 dark:bg-white/[0.01] hover:bg-slate-100/50 dark:hover:bg-white/[0.02] ${theme.borderColor} shadow-sm`
                }`}
              >
                {/* Micro Linear Indicator */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 bg-gradient-to-r ${theme.bannerGlow} ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`} 
                />

                {/* Card Title Header */}
                <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-white/[0.05] pb-2.5 w-full">
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-widest transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'
                  }`}>
                    {theme.fileLabel}
                  </span>
                  <span className="font-mono text-[8px] text-slate-400 select-none">
                    [NODE 0{index + 1}]
                  </span>
                </div>

                {/* Icon & Category Label */}
                <div className="flex items-center gap-3 mt-4.5 mb-2">
                  <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center border transition-all ${
                    isActive 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : `bg-slate-100/50 dark:bg-white/[0.03] border-slate-200/40 dark:border-white/[0.04] ${theme.iconColor}`
                  }`}>
                    {getIconForCategory(categoryObj.category)}
                  </div>
                  <h3 className={`font-sans font-extrabold text-[12.5px] uppercase tracking-wide leading-tight transition-colors ${
                    isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200 group-hover:text-cyan-500 dark:group-hover:text-cyan-400'
                  }`}>
                    {categoryObj.category}
                  </h3>
                </div>

                {/* Dynamic Tag Pill Stack */}
                <div className="flex flex-wrap gap-1 mt-3 w-full">
                  {categoryObj.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono text-[9px] font-semibold tracking-tight transition-colors border ${
                        isActive 
                          ? 'text-white bg-white/10 border-white/10' 
                          : theme.tagClass
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {categoryObj.skills.length > 5 && (
                    <span className={`font-mono text-[8px] italic font-medium pt-0.5 pl-1 select-none ${
                      isActive ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      +{categoryObj.skills.length - 5} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Real-time RPG Skill Tree Matrix */}
        <div className="mt-12 mb-10 p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-3xl backdrop-blur-md max-w-5xl mx-auto select-none">
          <div className="flex items-center gap-2.5 mb-5 border-b border-slate-200/40 dark:border-white/5 pb-3">
            <span className="text-xl leading-none">🎮</span>
            <div>
              <h4 className="font-sans font-extrabold text-[13.5px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">RPG Skill Tree Matrix</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Hover to trigger class multipliers and map active leveling ratios!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Python Lv.85', level: 85, tagline: 'Local matrix calculations, statistical modelling & multi-threading loops', color: 'from-amber-400 to-yellow-500' },
              { name: 'Django Lv.75', level: 75, tagline: 'Secured ACID database integrations, ORM models & REST endpoints scaling', color: 'from-emerald-400 to-green-500' },
              { name: 'React Lv.70', level: 70, tagline: 'Interactive state machines, responsive frame coordinates & canvas math layers', color: 'from-cyan-400 to-blue-500' },
              { name: 'Docker Lv.60', level: 60, tagline: 'Localized model sandboxing, private networks & micro-service configurations', color: 'from-violet-400 to-indigo-500' },
              { name: 'Machine Learning Lv.55', level: 55, tagline: 'Autonomous CrewAI task flows, vector databases & regression predictive anomalies', color: 'from-rose-450 to-pink-500' }
            ].map((skillData, idx) => (
              <RpgSkillRow key={idx} skill={skillData} />
            ))}
          </div>
        </div>

        {/* Dynamic Sandbox Simulator Terminal Panel */}
        <div className="mt-8 rounded-3xl bg-slate-950 border border-slate-800 dark:border-white/[0.06] shadow-2xl relative overflow-hidden transition-all duration-300">
          
          {/* Neon Holographic Top Edge Sweeper */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${activeTheme.bannerGlow} shadow-[0_1px_15px_rgba(6,182,212,0.4)]`} />

          <div className="p-6 md:p-8 font-mono text-xs text-slate-300">
            {/* Header layout */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="font-bold tracking-wider text-white uppercase text-[11px] sm:text-xs">
                  {activeReadout.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-3.5 py-1 rounded-full font-bold uppercase tracking-widest select-none">
                <Terminal className="w-3.5 h-3.5 animate-pulse" />
                <span>ACTIVE_INTEGRATED_WORKSPACE</span>
              </div>
            </div>

            {/* Layout Grid dividing telemetry stats from interactive visualization sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Sandbox Col: Telemetry metrics & deductions */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2.5">// COMPILER_TELEMETRY</span>
                  <div className="grid grid-cols-2 gap-3">
                    {activeReadout.stats.map((stat, i) => (
                      <div key={i} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                        <span className="text-[8px] text-slate-400 uppercase tracking-wider block mb-1">{stat.label}</span>
                        <span className="text-white font-extrabold text-[12px] tracking-tight">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-cyan-950/20 border border-cyan-500/10 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-cyan-400 mb-2 font-bold uppercase text-[9.5px] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>COGNITIVE_DEDUCTION</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {activeReadout.insights}
                  </p>
                </div>
              </div>

              {/* Right Sandbox Col: Interactive visual graphics simulator */}
              <div className="lg:col-span-7 flex flex-col h-full">
                <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-2.5">// INTERACTIVE_REGRESSION_GRAPH</span>
                
                <div className="h-full min-h-[300px] rounded-2xl bg-slate-900/60 border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between">
                  
                  {/* Case-specific Renderer Switcher */}
                  {activeCategoryIdx === 0 && (
                    /* CASE 0: Programming Languages Python Compiler Interpreter */
                    <div className="flex flex-col h-full justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="text-[9.5px] text-emerald-400"># SIMULATED INTERPRETER CONTAINER BINDING</div>
                        <div className="bg-black/40 rounded-xl p-3 h-40 overflow-y-auto text-[10px] font-mono text-slate-300 space-y-1 border border-white/5">
                          {compilerLogs.map((log, i) => (
                            <div key={i} className="leading-relaxed">
                              {log}
                            </div>
                          ))}
                          {isCompiling && (
                            <div className="animate-pulse text-amber-400">Initializing JIT Vector compilation daemon...</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleCompileTrigger}
                        disabled={isCompiling}
                        className="py-2 px-4 rounded-xl font-bold text-xs uppercase cursor-pointer bg-slate-800 hover:bg-slate-700 hover:text-white border border-white/10 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isCompiling ? 'Compiling Matrices...' : 'Compile Optimization Loop'}</span>
                      </button>
                    </div>
                  )}

                  {activeCategoryIdx === 1 && (
                    /* CASE 1: Machine Learning & Agentic AI Node bias tuner */
                    <div className="flex flex-col h-full justify-between gap-4">
                      <p className="text-[10px] text-slate-400 border-l border-fuchsia-500/20 pl-2">
                        Tweak node weights directly by clicking them. Nodes recalculate output flow weights dynamically on touch.
                      </p>

                      {/* Interactive Visual Network Drawing */}
                      <div className="flex items-center justify-around bg-black/30 py-4.5 rounded-xl border border-white/5 relative">
                        {/* Synaptic Output overlay */}
                        <div className="absolute top-2.5 right-3 text-[10px] bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-300 px-2 py-0.5 rounded-full font-bold">
                          FLOW_ACCURACY: {synapticStrength}%
                        </div>

                        {/* Connected lines simulation (SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0">
                          <line x1="20%" y1="50%" x2="50%" y2="25%" stroke="#b55fe6" strokeWidth={Math.abs(neuronWeights[0]) * 2} strokeDasharray="3 3" />
                          <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#b55fe6" strokeWidth={Math.abs(neuronWeights[1]) * 2} />
                          <line x1="20%" y1="50%" x2="50%" y2="75%" stroke="#b55fe6" strokeWidth={Math.abs(neuronWeights[2]) * 2} />
                          <line x1="50%" y1="25%" x2="80%" y2="50%" stroke="#e879f9" strokeWidth={Math.abs(neuronWeights[3]) * 2} />
                          <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="#e879f9" strokeWidth={Math.abs(neuronWeights[4]) * 2} />
                          <line x1="50%" y1="75%" x2="80%" y2="50%" stroke="#e879f9" strokeWidth="2.5" className="animate-[pulse_1.5s_infinite]" />
                        </svg>

                        {/* Node Layers */}
                        {/* Layer 1: Input node */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <span className="text-[7.5px] text-slate-400 uppercase tracking-widest font-bold">INPUT_X</span>
                          <button 
                            className="w-10 h-10 rounded-full bg-slate-900 border border-indigo-400 hover:border-indigo-300 text-[10px] text-indigo-400 font-extrabold flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(129,140,248,0.15)] hover:scale-105 duration-200"
                            onClick={() => sound.playClick()}
                          >
                            X₀
                          </button>
                        </div>

                        {/* Layer 2: Hidden intermediate nodes */}
                        <div className="flex flex-col gap-3.5 z-10">
                          <span className="text-[7.5px] text-slate-400 uppercase tracking-widest text-center font-bold">EMBED_W</span>
                          {neuronWeights.slice(0, 3).map((wt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNeuronClick(idx)}
                              className="px-2 py-1.5 rounded-lg bg-slate-950 border border-fuchsia-500/30 hover:border-fuchsia-400 text-fuchsia-300 font-mono text-[9px] cursor-pointer hover:scale-105 duration-200 flex flex-col items-center"
                              title="Click to tweak weight bias"
                            >
                              <span className="text-[7.5px] text-slate-500 block">W{idx + 1}</span>
                              <span className="font-extrabold">{wt > 0 ? `+${wt}` : wt}</span>
                            </button>
                          ))}
                        </div>

                        {/* Layer 3: Output Node */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <span className="text-[7.5px] text-slate-400 uppercase tracking-widest font-bold">OUTPUT_Y</span>
                          <button 
                            className="w-10 h-10 rounded-full bg-slate-950 border-2 border-emerald-400 text-[10px] text-emerald-400 font-extrabold flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.2)] animate-pulse"
                            onClick={() => {
                              sound.playSuccess();
                              setSynapticStrength(parseFloat((90 + Math.random() * 9).toFixed(1)));
                            }}
                          >
                            Y_EST
                          </button>
                        </div>
                      </div>

                      <div className="text-[9.5px] flex justify-between text-slate-400 pt-1 font-mono uppercase">
                        <span>NODE ACTIVATOR: SIGMOID</span>
                        <span>BIAS LEVEL: PRESET_COMPLIANT</span>
                      </div>
                    </div>
                  )}

                  {activeCategoryIdx === 2 && (
                    /* CASE 2: Tensor Matrix eigenvalue cells */
                    <div className="flex flex-col h-full justify-between gap-4">
                      <p className="text-[10px] text-slate-400">
                        Interactive NumPy algebraic array matrix map. Click individual cells to shift vector coordinates and scale weights.
                      </p>

                      <div className="flex justify-center my-1.5">
                        <div className="bg-black/40 border border-white/5 rounded-xl p-4.5 font-mono text-center relative max-w-xs w-full">
                          <div className="absolute top-2 left-2 text-[8px] text-slate-500">TENSOR_RANK_2</div>
                          <div className="grid grid-cols-3 gap-2.5 my-2">
                            {tensorMatrix.map((row, rIdx) => 
                              row.map((cell, cIdx) => (
                                <button
                                  key={`${rIdx}-${cIdx}`}
                                  onClick={() => incrementMatrixCell(rIdx, cIdx)}
                                  className="py-3.5 px-1 bg-slate-950 hover:bg-cyan-900/30 border border-cyan-500/10 hover:border-cyan-400 text-cyan-300 font-extrabold text-[11px] rounded-lg cursor-pointer transition-all active:scale-95 duration-200"
                                >
                                  {cell > 0 ? `+${cell.toFixed(1)}` : cell.toFixed(1)}
                                </button>
                              ))
                            )}
                          </div>
                          <div className="text-[8px] text-slate-500 border-t border-white/5 pt-2 flex justify-between uppercase">
                            <span>Matrix Name: feature_weights</span>
                            <span>EIGENVALUE: SECURE_1.08</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 border-l border-cyan-500 pl-2 leading-relaxed">
                        Adjusting cells simulates PCA eigenvalue components inside standard preprocessor columns. Fits pipeline transformations securely.
                      </div>
                    </div>
                  )}

                  {activeCategoryIdx === 3 && (
                    /* CASE 3: Gaussian Bell & Significance sliding calculation */
                    <div className="flex flex-col h-full justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5 text-[9.5px]">
                          <span className="text-emerald-400 font-bold">EXPLORATORY HYPOTHESIS LAB</span>
                          <span className="font-mono bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 text-[10px]">
                            alpha threshold: {alphaVal}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed border-l border-emerald-500/30 pl-2">
                          Move the slider below to shift the confidence alpha threshold. Real-time statistical significance updates automatically.
                        </p>
                      </div>

                      {/* Interactive Gaussian bell representation inside SVG wrapper */}
                      <div className="bg-black/35 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                        <div className="h-20 w-full relative flex items-end">
                          {/* Simulated SVG Graph Curve overlay */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                            {/* Gaussian curve outline */}
                            <path d="M 0 30 Q 50 2 100 30" fill="none" stroke="#10b981" strokeWidth="1.5" />
                            {/* shaded Alpha failure/rejection zone based on alphaVal */}
                            <path 
                              d={`M ${100 - (alphaVal * 300)} 30 Q 50 2 100 30 L 100 30 Z`} 
                              fill="rgba(239, 68, 68, 0.2)" 
                              stroke="rgba(239, 68, 68, 0.4)"
                              strokeWidth="0.5"
                            />
                            {/* critical boundary line */}
                            <line 
                              x1={`${100 - (alphaVal * 300)}`} 
                              y1="0" 
                              x2={`${100 - (alphaVal * 300)}`} 
                              y2="30" 
                              stroke="#ef4444" 
                              strokeWidth="0.8" 
                              strokeDasharray="2 1" 
                            />
                          </svg>
                          <div className="absolute top-1 right-2 text-[7.5px] text-red-400 tracking-wider">Alpha Rejection Zone</div>
                          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-400">H₀ Mean (μ)</div>
                        </div>

                        {/* Slider tuner */}
                        <div className="mt-4 flex items-center gap-3 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                          <Sliders className="w-4 h-4 text-emerald-400" />
                          <input 
                            type="range" 
                            min="0.01" 
                            max="0.15" 
                            step="0.01" 
                            value={alphaVal}
                            onChange={handleAlphaChange}
                            className="flex-1 accent-emerald-500 cursor-pointer" 
                          />
                        </div>
                      </div>

                      {/* Summary readout */}
                      <div className="flex justify-between items-center text-[10px] bg-slate-950 p-2.5 rounded-lg border border-white/5">
                        <span className="text-slate-400">CALCULATED p-value: <strong className="text-white font-extrabold">{calculatedPValue}</strong></span>
                        <span className={`px-2 py-0.5 font-bold rounded-md text-[9px] ${calculatedPValue < alphaVal ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {calculatedPValue < alphaVal ? 'SIGNIFICANCE ACHIEVED (REJECT H₀)' : 'INSIGNIFICANT (RETAIN H₀)'}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeCategoryIdx === 4 && (
                    /* CASE 4: Scatter Plot visualizer embeddings */
                    <div className="flex flex-col h-full justify-between gap-4">
                      <div>
                        <div className="text-[9.5px] text-pink-400 font-bold mb-1">// VECTOR EMBEDDING NEAREST NEIGHBORS</div>
                        <p className="text-[10px] text-slate-400">
                          Click any scatter point to inspect NLP sentence embeddings and cosine similarities computed by Gemini-vector-encoders.
                        </p>
                      </div>

                      <div className="bg-black/45 border border-white/5 rounded-xl p-3 h-44 relative overflow-hidden flex items-center justify-center">
                        {/* Background Axis line */}
                        <div className="absolute bottom-2 left-6 right-2 h-0.5 bg-white/10" />
                        <div className="absolute bottom-2 left-6 top-2 w-0.5 bg-white/10" />

                        {/* Scatter coordinate rings */}
                        {embedPoints.map((point) => {
                          const isSelected = selectedEmbPoint === point.id;
                          return (
                            <button
                              key={point.id}
                              onClick={() => {
                                sound.playClick();
                                setSelectedEmbPoint(point.id);
                              }}
                              className="absolute cursor-pointer group active:scale-90 transition-transform duration-200"
                              style={{ left: `${point.x}%`, top: `${point.y}%` }}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center relative transition-all ${
                                isSelected 
                                  ? 'bg-rose-500 ring-4 ring-rose-500/30 shadow-[0_0_12px_#f43f5e]' 
                                  : 'bg-slate-700 hover:bg-rose-500'
                              }`}>
                                {isSelected && <span className="absolute animate-ping inset-0 bg-rose-400 rounded-full opacity-75" />}
                              </span>
                            </button>
                          );
                        })}

                        {/* Detail floating block */}
                        {selectedEmbPoint !== null && (
                          <div className="absolute bottom-4 right-4 bg-slate-950/95 border border-rose-500/30 p-2.5 rounded-lg text-[9px] font-mono leading-normal max-w-[180px] shadow-2xl backdrop-blur-md">
                            <div className="font-extrabold text-white truncate">{embedPoints.find(p => p.id === selectedEmbPoint)?.label}</div>
                            <div className="text-rose-400 mt-1">SIMILARITY: {embedPoints.find(p => p.id === selectedEmbPoint)?.similarity}</div>
                            <div className="text-slate-400">Class: {embedPoints.find(p => p.id === selectedEmbPoint)?.category}</div>
                          </div>
                        )}
                      </div>

                      <div className="text-[9.5px] text-slate-500 text-right uppercase">
                        Active Vector Mode: Semantic Dimensional reduction t-SNE
                      </div>
                    </div>
                  )}

                  {activeCategoryIdx === 5 && (
                    /* CASE 5: Database index HNSW search routing path */
                    <div className="flex flex-col h-full justify-between gap-4">
                      <p className="text-[10px] text-slate-400 border-l border-blue-500 pl-2">
                        Demonstrating localized nearest neighbor calculations inside HNSW indexes. Hover tree branches to traverse path.
                      </p>

                      <div className="bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-center space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          {/* Tree node level 1 */}
                          <div className="flex flex-col items-center">
                            <span className="text-[6.5px] text-slate-500 block mb-1">Index Root</span>
                            <button 
                              onClick={() => {
                                sound.playClick();
                                setActiveDbSearchPath(['root']);
                                setFoundKeyDetails('Traversed index root node. Directing searches to children nodes.');
                              }}
                              className={`w-9 h-9 rounded-full border text-[9px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                                activeDbSearchPath.includes('root') ? 'bg-blue-600/20 border-blue-400 text-blue-300' : 'bg-slate-950 border-slate-700 text-slate-400'
                              }`}
                            >
                              ROOT
                            </button>
                          </div>

                          <span className="text-slate-600 font-extrabold">&gt;&gt;</span>

                          {/* Tree tier 2 */}
                          <div className="space-y-1.5 flex flex-col">
                            <span className="text-[6.5px] text-slate-500 font-bold uppercase">Sub-Clusters</span>
                            <div className="flex gap-2">
                              {['node-c1', 'node-c2'].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => {
                                    sound.playClick();
                                    setActiveDbSearchPath(['root', n]);
                                    setFoundKeyDetails(n === 'node-c1' 
                                      ? 'Branch node selected. Maps 200 high-accuracy patent citations.'
                                      : 'Branch node selected. Represents semantic analytics databases.'
                                    );
                                  }}
                                  className={`px-2 py-1.5 rounded-lg border text-[8.5px] font-mono cursor-pointer transition-colors ${
                                    activeDbSearchPath.includes(n) ? 'bg-blue-600/25 border-blue-400 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  {n.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>

                          <span className="text-slate-600 font-extrabold">&gt;&gt;</span>

                          {/* Level 3 leaves */}
                          <div className="space-y-1.5 flex flex-col">
                            <span className="text-[6.5px] text-slate-500 font-bold uppercase">Stored Records</span>
                            <div className="flex gap-2.5">
                              {['leaf-vec1', 'leaf-vec2'].map((l) => (
                                <button
                                  key={l}
                                  onClick={() => {
                                    sound.playSuccess();
                                    setActiveDbSearchPath(['root', activeDbSearchPath[1] || 'node-c1', l]);
                                    setFoundKeyDetails(l === 'leaf-vec1'
                                      ? 'RECORD FOUND: IEEE NLP Patent 2024. Cosine similarity threshold mapped OK.'
                                      : 'RECORD FOUND: CV Segmentation Weight Array. Database vector aligned.'
                                    );
                                  }}
                                  className={`px-1.5 py-1 rounded-md border text-[8px] font-mono cursor-pointer transition-colors ${
                                    activeDbSearchPath.includes(l) ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  {l.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Status text boxes */}
                        <div className="bg-slate-950 p-2 rounded-lg text-left text-[9.5px] text-slate-400 min-h-[30px] leading-normal border border-white/5 truncate">
                          💡 <span className="font-bold text-white">{foundKeyDetails}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCategoryIdx === 6 && (
                    /* CASE 6: Docker container Kubernetes cluster simulation */
                    <div className="flex flex-col h-full justify-between gap-4">
                      <p className="text-[10px] text-slate-400 border-l border-violet-500 pl-2">
                        Simulating localized Docker host nodes. Click reboot triggers to restart active agent micro-services on the fly.
                      </p>

                      <div className="space-y-2 bg-black/30 p-3 rounded-xl border border-white/5">
                        <div className="grid grid-cols-2 gap-2.5">
                          {dockerNodes.map((node) => (
                            <div key={node.id} className="p-2.5 bg-slate-950 border border-white/5 rounded-xl flex flex-col justify-between h-20 relative overflow-hidden group">
                              <div className="flex justify-between items-start">
                                <div className="truncate pr-1">
                                  <span className="text-[8.5px] font-bold text-white block truncate">{node.name}</span>
                                  <span className="text-[7.5px] text-slate-500 block">{node.type}</span>
                                </div>
                                <span className={`text-[7px] font-mono font-bold leading-none px-1.5 py-0.5 rounded ${
                                  node.status === 'HEALTHY' ? 'bg-green-500/10 text-green-400 border border-green-500/25' :
                                  node.status === 'WARN' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25' :
                                  node.status === 'REBOOTING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse' :
                                  'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse'
                                }`}>
                                  {node.status}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[8px] mt-1 z-10">
                                <span className="text-slate-500">SysMem: {node.usage}</span>
                                <button
                                  onClick={() => restartDockerContainer(node.id)}
                                  disabled={node.status === 'REBOOTING'}
                                  className="p-1 rounded bg-white/5 hover:bg-violet-950 border border-white/5 hover:border-violet-500 hover:text-white cursor-pointer active:scale-95 disabled:opacity-50"
                                  title="Reboot container node"
                                >
                                  <RefreshCw className={`w-2.5 h-2.5 ${node.status === 'REBOOTING' ? 'animate-spin' : ''}`} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[9.5px] text-slate-500 flex justify-between uppercase">
                        <span>Cluster: Ollama Local Host</span>
                        <span>Load: STABLE_BALANCED</span>
                      </div>
                    </div>
                  )}

                  {activeCategoryIdx === 7 && (
                    /* CASE 7: Cognitive connections competencies */
                    <div className="flex flex-col h-full justify-between gap-4">
                      <div>
                        <div className="text-[9.5px] text-orange-400 font-bold mb-1">// COGNITIVE CONNECTOR</div>
                        <p className="text-[10px] text-slate-400 leading-relaxed border-l border-orange-500 pl-2">
                          Hover relative synapses to trigger diagnostic metrics reflecting his core behavioral strengths.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 lg:my-1.5">
                        {[
                          { label: 'Analytical Power', desc: 'Capable of dividing highly intricate statistical problems into modular digestible algorithms.', icon: <Activity className="w-4 h-4 text-orange-400" /> },
                          { label: 'Adaptable Frameworks', desc: 'Adeptly moving between local data prep tasks, model designs, and reliable frontends.', icon: <Layers3 className="w-4 h-4 text-amber-400" /> },
                          { label: 'Collaborative Sync', desc: 'Enjoys coordinating within high-performance dev systems, prioritizing documentation safety.', icon: <Network className="w-4 h-4 text-red-400" /> },
                        ].map((syn, idx) => (
                          <div
                            key={idx}
                            onMouseEnter={() => {
                              sound.playHover();
                              setSynapseHovered(syn.desc);
                            }}
                            className="bg-black/45 border border-white/5 hover:border-orange-500/30 p-2.5 rounded-xl cursor-default transition-all hover:scale-[1.02] flex flex-col justify-between text-center min-h-[90px]"
                          >
                            <div className="mx-auto my-1">{syn.icon}</div>
                            <span className="text-[8.5px] font-extrabold text-white leading-tight font-sans select-none block">{syn.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-950/80 border border-white/5 p-2 rounded-lg text-[9.5px] min-h-[40px] leading-relaxed italic text-orange-300">
                        "{synapseHovered}"
                      </div>
                    </div>
                  )}

                  {/* Decorative background compiler trace logs */}
                  <div className="absolute bottom-2.5 right-3 text-[7.5px] text-slate-500 tracking-widest uppercase select-none pointer-events-none">
                    ENGINE_LOCK_ACTIVE
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

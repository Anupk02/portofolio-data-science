import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RefreshCw, Plus, Minus, Info, Cpu, Sparkles, Sliders, 
  HelpCircle, Binary, Compass, Activity, ZoomIn, Eye, ChevronsRight, Type, CheckCircle2
} from 'lucide-react';
import { sound } from '../utils';

// Core math helper types for our custom MLP
interface NeuralLayer {
  neurons: number[]; // activations
  biases: number[];
}

interface WeightMatrix {
  values: number[][]; // matrix dimension: [nextLayerNeurons][currentLayerNeurons]
  gradients: number[][];
}

interface DataPoint {
  x: number; // component 1 (-1 to 1)
  y: number; // component 2 (-1 to 1)
  label: number; // +1 (cyan) or -1 (magenta)
}

// Custom data patterns
type DatasetPattern = 'XOR' | 'CIRCLE' | 'LINEAR' | 'CUSTOM';

export default function NeuralSandbox() {
  // Config state
  const [layersConfig, setLayersConfig] = useState<number[]>([2, 4, 3, 1]); // input is 2, output is 1 automatically
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [activationType, setActivationType] = useState<'sigmoid' | 'tanh' | 'relu'>('tanh');
  const [selectedPattern, setSelectedPattern] = useState<DatasetPattern>('XOR');
  
  // Simulation training state
  const [epochs, setEpochs] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainLoss, setTrainLoss] = useState<number>(0.5);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  
  // Dataset storage
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  
  // Weights / biases model references
  const weightsRef = useRef<WeightMatrix[]>([]);
  const layersRef = useRef<NeuralLayer[]>([]);
  const trainingIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tokenizer and Vector embeddings states
  const [embeddingText, setEmbeddingText] = useState<string>("Artificial general intelligence and model weights");
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [tokenVectorScale, setTokenVectorScale] = useState<boolean>(false);

  // Self-attention state
  const [attentionHoverIdx, setAttentionHoverIdx] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string; val: number } | null>(null);

  // Initialize dataset on pattern swap
  useEffect(() => {
    generateDatasetPoints(selectedPattern);
    initializeNetwork(layersConfig);
    setLossHistory([]);
    setEpochs(0);
    setTrainLoss(0.5);
    if (isTraining) {
      stopTraining();
    }
  }, [selectedPattern]);

  // Handle layer count updates cleanly
  const updateLayers = (index: number, delta: number) => {
    sound.playClick();
    const nextWeights = [...layersConfig];

    // Don't modify input (index 0) or output (last index) dimensions
    if (index === 0 || index === layersConfig.length - 1) return;

    nextWeights[index] = Math.max(1, Math.min(8, nextWeights[index] + delta));
    setLayersConfig(nextWeights);
    initializeNetwork(nextWeights);
    setLossHistory([]);
    setEpochs(0);
  };

  const addHiddenLayer = () => {
    if (layersConfig.length >= 6) return; // max 4 hidden layers
    sound.playClick();
    const nextWeights = [...layersConfig];
    nextWeights.splice(nextWeights.length - 1, 0, 3); // insert layer of size 3 before output
    setLayersConfig(nextWeights);
    initializeNetwork(nextWeights);
    setLossHistory([]);
    setEpochs(0);
  };

  const removeHiddenLayer = () => {
    if (layersConfig.length <= 3) return; // need at least 1 hidden layer
    sound.playClick();
    const nextWeights = [...layersConfig];
    nextWeights.splice(nextWeights.length - 2, 1); // remove last hidden layer
    setLayersConfig(nextWeights);
    initializeNetwork(nextWeights);
    setLossHistory([]);
    setEpochs(0);
  };

  // Generate pattern datasets
  const generateDatasetPoints = (pattern: DatasetPattern) => {
    const points: DataPoint[] = [];
    const count = 120;

    if (pattern === 'XOR') {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        // XOR is positive if signs differ, with a bit of noise
        const label = (x * y > 0) ? 1 : -1;
        const noise = 0.05;
        const finalLabel = Math.random() < noise ? -label : label;
        points.push({ x, y, label: finalLabel });
      }
    } else if (pattern === 'CIRCLE') {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const dist = Math.sqrt(x*x + y*y);
        // Circle cluster: inside radius 0.6 is positive
        const label = (dist < 0.6) ? 1 : -1;
        points.push({ x, y, label });
      }
    } else if (pattern === 'LINEAR') {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        // Simple linear equation x + y > 0.1
        const label = (x + y > 0.15) ? 1 : -1;
        points.push({ x, y, label });
      }
    } else if (pattern === 'CUSTOM') {
      // Seed initial custom points
      points.push({ x: -0.4, y: 0.5, label: 1 });
      points.push({ x: 0.3, y: -0.6, label: 1 });
      points.push({ x: 0.5, y: 0.5, label: -1 });
      points.push({ x: -0.6, y: -0.4, label: -1 });
    }

    setDataset(points);
  };

  // Users can click on Custom canvas to append points
  const handleCustomPointAdd = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedPattern !== 'CUSTOM') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    sound.playClick();
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Convert pixel to normalized coordinates (-1 to 1)
    const x = ((px / canvas.width) * 2) - 1;
    const y = (1 - (py / canvas.height)) * 2 - 1; // invert Y for Cartesian

    // Alternating label polarities (Left click positive, Shift/right click negative or alternate)
    const label = e.shiftKey ? -1 : 1;
    setDataset(prev => [...prev, { x, y, label }]);
    setEpochs(0); // prompt retraining
  };

  // Initialize MLP weights with random Xavier weights
  const initializeNetwork = (config: number[]) => {
    const layers: NeuralLayer[] = [];
    const weights: WeightMatrix[] = [];

    // Initialize Layers
    for (let i = 0; i < config.length; i++) {
      layers.push({
        neurons: Array(config[i]).fill(0),
        biases: Array(config[i]).fill(0).map(() => Math.random() * 0.4 - 0.2)
      });
    }

    // Initialize Weight Matrices
    for (let i = 0; i < config.length - 1; i++) {
      const fromSize = config[i];
      const toSize = config[i + 1];
      const val: number[][] = [];
      const grad: number[][] = [];

      for (let r = 0; r < toSize; r++) {
        const rowWeights: number[] = [];
        const rowGrads: number[] = [];
        // Xavier/He-like distribution limits
        const devLimit = Math.sqrt(2.0 / fromSize);
        for (let c = 0; c < fromSize; c++) {
          rowWeights.push((Math.random() * 2 - 1) * devLimit);
          rowGrads.push(0);
        }
        val.push(rowWeights);
        grad.push(rowGrads);
      }

      weights.push({ values: val, gradients: grad });
    }

    layersRef.current = layers;
    weightsRef.current = weights;
  };

  // Activation & derivative functions
  const activate = (x: number, type: 'sigmoid' | 'tanh' | 'relu'): number => {
    if (type === 'sigmoid') {
      return 1.0 / (1.0 + Math.exp(-x));
    } else if (type === 'tanh') {
      return Math.tanh(x);
    } else {
      return Math.max(0, x); // ReLU
    }
  };

  const derivative = (y: number, type: 'sigmoid' | 'tanh' | 'relu'): number => {
    if (type === 'sigmoid') {
      return y * (1.0 - y);
    } else if (type === 'tanh') {
      return 1.0 - y * y;
    } else {
      return y > 0 ? 1 : 0.05; // ReLU approximation gradient leaking for backprop stability
    }
  };

  // Feed-forward algorithm
  const forwardPass = (inputs: number[]): number[] => {
    const lay = layersRef.current;
    const w = weightsRef.current;
    if (lay.length === 0) return [0];

    // Input activations
    lay[0].neurons = [...inputs];

    for (let i = 0; i < w.length; i++) {
      const fromLayer = lay[i].neurons;
      const nextLayer = lay[i + 1].neurons;
      const biases = lay[i + 1].biases;
      const mat = w[i].values;

      for (let r = 0; r < nextLayer.length; r++) {
        let sum = biases[r];
        for (let c = 0; c < fromLayer.length; c++) {
          sum += fromLayer[c] * mat[r][c];
        }
        lay[i + 1].neurons[r] = activate(sum, activationType);
      }
    }

    return lay[lay.length - 1].neurons;
  };

  // Step interactive neural backpropagation gradient updates
  const backwardPass = (outputs: number[], targets: number[]) => {
    const lay = layersRef.current;
    const w = weightsRef.current;
    const L = lay.length;

    // Node error delta arrays
    const deltas: number[][] = [];
    for (let i = 0; i < L; i++) {
      deltas.push(Array(lay[i].neurons.length).fill(0));
    }

    // Output delta. Squared loss / derivative
    // Output label matches mapping: using continuous outputs between -1 (magenta) and +1 (cyan)
    const outIdx = L - 1;
    for (let h = 0; h < lay[outIdx].neurons.length; h++) {
      const a = lay[outIdx].neurons[h];
      const error = targets[h] - a;
      // error gradient
      deltas[outIdx][h] = error * derivative(a, activationType);
    }

    // Hidden layer error deltas
    for (let i = L - 2; i > 0; i--) {
      const currActivations = lay[i].neurons;
      const nextDeltas = deltas[i + 1];
      const weightMatrix = w[i].values;

      for (let c = 0; c < currActivations.length; c++) {
        let errAccum = 0;
        for (let r = 0; r < nextDeltas.length; r++) {
          errAccum += nextDeltas[r] * weightMatrix[r][c];
        }
        deltas[i][c] = errAccum * derivative(currActivations[c], activationType);
      }
    }

    // Gradient updates for Weights and Biases
    for (let i = 0; i < w.length; i++) {
      const fromLayer = lay[i].neurons;
      const nextDeltas = deltas[i + 1];
      const val = w[i].values;
      const biases = lay[i + 1].biases;

      for (let r = 0; r < nextDeltas.length; r++) {
        const d = nextDeltas[r];
        biases[r] += learningRate * d; // Update Bias
        for (let c = 0; c < fromLayer.length; c++) {
          val[r][c] += learningRate * d * fromLayer[c]; // Update Weight
        }
      }
    }
  };

  // Train one full epoch matching dataset batches
  const runSingleTrainEpoch = () => {
    if (dataset.length === 0) return;

    let lossAccum = 0;
    // Iterate over points
    for (let i = 0; i < dataset.length; i++) {
      const pt = dataset[i];
      const outputs = forwardPass([pt.x, pt.y]);
      // target mapping label from dataset (label -1 map to float range -0.8, +1 map to +0.8 for model comfort)
      const targetVal = pt.label === 1 ? 0.85 : -0.85;
      const diff = targetVal - outputs[0];
      lossAccum += 0.5 * diff * diff;

      backwardPass(outputs, [targetVal]);
    }

    const currentLoss = lossAccum / dataset.length;
    setTrainLoss(parseFloat(currentLoss.toFixed(4)));
    setEpochs(prev => prev + 1);

    // Keep history limits
    if (epochs % 10 === 0) {
      setLossHistory(prev => {
        const next = [...prev, currentLoss];
        if (next.length > 35) next.shift(); // keep graph rolling
        return next;
      });
    }
  };

  // Start continuous loop
  const startTraining = () => {
    if (isTraining) return;
    sound.playTelemetry();
    setIsTraining(true);
    
    // Quick train interval
    trainingIntervalRef.current = setInterval(() => {
      // Speed up iterations: run 15 epochs per timer interval
      for (let step = 0; step < 15; step++) {
        runSingleTrainEpoch();
      }
    }, 50);
  };

  const stopTraining = () => {
    setIsTraining(false);
    if (trainingIntervalRef.current) {
      clearInterval(trainingIntervalRef.current);
      trainingIntervalRef.current = null;
    }
  };

  const handleResetWeights = () => {
    sound.playGlitch();
    initializeNetwork(layersConfig);
    setLossHistory([]);
    setEpochs(0);
    setTrainLoss(0.5);
  };

  // Keep boundary decision canvas rendered
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions setup
    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw Decision boundary background grid
    const scale = 5; // resolution pixel chunk size
    for (let px = 0; px < w; px += scale) {
      for (let py = 0; py < h; py += scale) {
        // Map pixel to cartesian coordinates (-1 to 1)
        const x = ((px / w) * 2) - 1;
        const y = (1 - (py / h)) * 2 - 1;

        // Model predictions
        const out = forwardPass([x, y])[0];

        // Output fits from -1 to 1.
        // Interpolate color color: cyan for +1, magenta for -1
        let red = 15;
        let green = 23;
        let blue = 42; // base slate dark background (#0f172a)

        if (out > 0) {
          // positive: add cyan (0, 186, 212)
          const factor = Math.min(1.0, out);
          red = Math.floor(15 * (1 - factor) + 6 * factor);
          green = Math.floor(23 * (1 - factor) + 120 * factor);
          blue = Math.floor(42 * (1 - factor) + 180 * factor);
        } else {
          // negative: add pink/magenta (219, 39, 119)
          const factor = Math.min(1.0, Math.abs(out));
          red = Math.floor(15 * (1 - factor) + 160 * factor);
          green = Math.floor(23 * (1 - factor) + 15 * factor);
          blue = Math.floor(42 * (1 - factor) + 90 * factor);
        }

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(px, py, scale, scale);
      }
    }

    // 2. Auxiliary Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // 3. Draw Dataset Points
    dataset.forEach(pt => {
      // Map back to canvas pixel coordinate system
      const cx = ((pt.x + 1) / 2) * w;
      const cy = (1 - ((pt.y + 1) / 2)) * h;

      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, 2 * Math.PI);
      
      if (pt.label === 1) {
        // Cyan category
        ctx.fillStyle = '#06b6d4';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
      } else {
        // Magenta category
        ctx.fillStyle = '#db2777';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
      }
      ctx.fill();
      ctx.stroke();
    });

  }, [dataset, epochs, activationType, layersConfig]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (trainingIntervalRef.current) {
        clearInterval(trainingIntervalRef.current);
      }
    };
  }, []);

  // Split string into visual colors
  const words = embeddingText.split(" ");
  const customColors = [
    'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    'bg-amber-500/10 border-amber-500/30 text-amber-400',
    'bg-pink-500/10 border-pink-500/30 text-pink-400',
    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    'bg-sky-500/10 border-sky-500/30 text-sky-400',
    'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  ];

  // Token weights simulation vectors
  const generateSimulatedEmbedding = (word: string, index: number) => {
    // deterministic values based on letters
    const vals: number[] = [];
    for (let i = 0; i < 12; i++) {
      const charCode = word.charCodeAt(i % word.length) || 32;
      const factor = Math.abs(Math.sin(charCode * (index + 1) * (i + 1)));
      vals.push(parseFloat((factor * 2 - 1).toFixed(3)));
    }
    return vals;
  };

  // Projected 2D high-dimensional semantic clustering points simulation
  const projectedClusters = [
    { name: "Model", x: 60, y: 70, cat: "core" },
    { name: "Weights", x: 65, y: 65, cat: "core" },
    { name: "Swarms", x: 75, y: 30, cat: "agent" },
    { name: "Agentic", x: 80, y: 25, cat: "agent" },
    { name: "Matrix", x: 20, y: 80, cat: "math" },
    { name: "Calculus", x: 15, y: 85, cat: "math" },
    { name: "Oceanic", x: 30, y: 15, cat: "pirate" },
    { name: "Sun", x: 35, y: 20, cat: "pirate" },
  ];

  return (
    <section id="extreme-neural-network-interactive" className="py-24 relative select-none overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-x-0 top-1/4 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl" aria-hidden="true">
        <div className="aspect-[1100/600] w-[64rem] flex-none bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 opacity-30" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title and subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-4">
            <Cpu className="w-3.5 h-3.5" /> INTERACTIVE LABORATORY
          </div>
          <h2 className="text-3xl font-black heading-font text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-3">
            EXTREME NEURAL NET DEPTH EXPLORER
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-lg mx-auto leading-relaxed">
            Real Artificial Neural Networks, word embeddings, transformer queries, and high-dimensional model vectors executing live inside your browser!
          </p>
        </div>

        {/* CONTAINER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* COLUMN 1 (5/12 span): Classification Dataset Canvas & Training Loop Panel */}
          <div className="lg:col-span-5 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-lg flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-200/40 dark:border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <span className="font-extrabold text-[12px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">Classification Dataset Board</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" />
                  <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">TRAINING_STABLE</span>
                </div>
              </div>

              {/* Pattern selector buttons */}
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {(['XOR', 'CIRCLE', 'LINEAR', 'CUSTOM'] as DatasetPattern[]).map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => {
                      sound.playClick();
                      setSelectedPattern(pattern);
                    }}
                    className={`py-2 px-1 border font-mono font-bold text-[9px] uppercase rounded-xl transition-all cursor-pointer ${
                      selectedPattern === pattern
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                        : 'bg-black/20 border-slate-200/50 dark:border-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-black/35'
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>

              {/* Dynamic educational tag explaining the active pattern */}
              <div className="text-[10px] text-slate-400 dark:text-slate-400/95 font-sans mb-4 min-h-[30px] flex items-start gap-1 p-2 rounded-xl bg-slate-100/10 dark:bg-black/20 border border-slate-200/20 dark:border-white/5">
                <span className="text-[10px] text-cyan-400 leading-none">⚡</span>
                <p className="leading-tight">
                  {selectedPattern === 'XOR' && <span className="font-medium text-slate-300"><strong>XOR Quadrants</strong>: Alternating coordinates. Demands standard non-linear layer depth configurations to classify.</span>}
                  {selectedPattern === 'CIRCLE' && <span className="font-medium text-slate-300"><strong>Radial concentric sphere</strong>: Center matches cyan class (+1) and perimeter matches pink/rose (-1).</span>}
                  {selectedPattern === 'LINEAR' && <span className="font-medium text-slate-300"><strong>Straight Line division</strong>: Linearly separable dataset. Simple single-neuron layers classify this easily in fewer epochs.</span>}
                  {selectedPattern === 'CUSTOM' && <span className="font-medium text-slate-300"><strong>Sandbox Canvas</strong>: Click anywhere to plant custom seed points and experiment with boundary adjustments.</span>}
                </p>
              </div>

              {/* Dataset Canvas and coordinate maps */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-white/5 bg-slate-950 flex items-center justify-center">
                <canvas
                  id="neural-decision-canvas"
                  ref={canvasRef}
                  width={340}
                  height={340}
                  onClick={handleCustomPointAdd}
                  className="w-full h-full cursor-crosshair block"
                />

                {selectedPattern === 'CUSTOM' && (
                  <div className="absolute top-2.5 left-2.5 bg-black/85 border border-white/10 p-2 rounded-lg text-[8.5px] text-slate-400 max-w-[200px] pointer-events-none font-mono leading-tight">
                    💡 <span className="font-bold text-white uppercase text-[8.5px]">Click Canvas</span> to add positive (<span className="text-cyan-400 font-bold">Cyan</span>) points. <span className="font-bold text-white uppercase text-[8.5px]">Shift-Click</span> to add negative (<span className="text-pink-500 font-bold">Pink</span>) points.
                  </div>
                )}
              </div>

              {/* Complete comprehensive legend for the canvas */}
              <div className="mt-3.5 bg-slate-100/40 dark:bg-black/35 border border-slate-200/30 dark:border-white/5 p-3 rounded-2xl flex flex-col gap-2 text-[9px] font-mono leading-tight shadow-inner">
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white shadow shadow-cyan-400/50" />
                    <span className="text-slate-600 dark:text-slate-300">Target Positive (+1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white shadow shadow-rose-500/50" />
                    <span className="text-slate-600 dark:text-slate-300">Target Negative (-1)</span>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-slate-200 dark:bg-white/5 my-0.5" />
                <div className="text-slate-500 dark:text-slate-400 font-sans tracking-wide leading-relaxed">
                  The blended background gradient represents the model's <strong className="text-cyan-400/90 font-bold">continuous multi-coordinate decision surface</strong>. The boundary shifts live as backpropagation adjusts weights!
                </div>
              </div>
            </div>

            {/* Hyperparameter slider controllers */}
            <div className="mt-5 border-t border-slate-200/40 dark:border-white/5 pt-4 space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Learning Rate</label>
                  <select
                    value={learningRate}
                    onChange={(e) => {
                      sound.playClick();
                      setLearningRate(parseFloat(e.target.value));
                    }}
                    className="w-full p-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/5 rounded-xl font-bold text-[10px] text-slate-800 dark:text-cyan-400 focus:outline-none"
                  >
                    <option value="0.01">0.01 (Slow / Solid)</option>
                    <option value="0.05">0.05 (Smooth)</option>
                    <option value="0.1">0.1 (Responsive)</option>
                    <option value="0.3">0.3 (Aggressive)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Activation Function</label>
                  <select
                    value={activationType}
                    onChange={(e) => {
                      sound.playClick();
                      setActivationType(e.target.value as any);
                    }}
                    className="w-full p-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/5 rounded-xl font-bold text-[10px] text-slate-800 dark:text-cyan-400 focus:outline-none"
                  >
                    <option value="tanh">Hyperbolic Tanh</option>
                    <option value="sigmoid">Sigmoid (Logistic)</option>
                    <option value="relu">Rectified Linear</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2 (7/12 span): Multi-layer Neural Network Topology Graph View */}
          <div className="lg:col-span-7 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-lg flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-200/40 dark:border-white/5 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <span className="font-extrabold text-[12px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">Topology & Synapse Weights</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={addHiddenLayer}
                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-300 dark:border-cyan-500/20 bg-slate-100 dark:bg-cyan-950/20 text-slate-600 dark:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 transition-all font-mono text-[9px] font-bold uppercase cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD LAYER
                  </button>
                  <button
                    onClick={removeHiddenLayer}
                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-300 dark:border-rose-500/20 bg-slate-100 dark:bg-rose-950/20 text-slate-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-400 hover:text-rose-300 transition-all font-mono text-[9px] font-bold uppercase cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" /> REM_LAYER
                  </button>
                </div>
              </div>

              {/* Main controls loop panel */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-100/60 dark:bg-black/30 border border-slate-200/40 dark:border-white/5 p-4 rounded-2xl mb-6">
                <div className="flex items-center gap-2">
                  {isTraining ? (
                    <button
                      onClick={stopTraining}
                      className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(244,63,94,0.35)]"
                    >
                      <Pause className="w-4 h-4 fill-white" />
                    </button>
                  ) : (
                    <button
                      onClick={startTraining}
                      className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                    >
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </button>
                  )}
                  <button
                    onClick={runSingleTrainEpoch}
                    title="Train Single Epoch Step"
                    className="p-3 bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-cyan-400/40 hover:text-cyan-400 rounded-full transition-all cursor-pointer active:scale-90"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetWeights}
                    title="Initialize randomWeights"
                    className="p-3 bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-amber-400/40 hover:text-amber-400 rounded-full transition-all cursor-pointer active:scale-90"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 flex justify-between items-center text-[10px] font-mono leading-none border-l border-slate-200 dark:border-white/10 pl-4 gap-4">
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block mb-1">Epochs</span>
                    <span className="text-[13.5px] font-black text-slate-800 dark:text-cyan-400 font-mono">{epochs}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block mb-1">Training Loss</span>
                    <span className="text-[13.5px] font-black text-rose-500 dark:text-rose-400 font-mono">{trainLoss}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block mb-1">Hidden Layers</span>
                    <span className="text-[13.5px] font-black text-slate-800 dark:text-cyan-400 font-mono">{layersConfig.length - 2}</span>
                  </div>
                </div>
              </div>

              {/* Topology Synapses Graph visualization */}
              <div className="bg-slate-100/30 dark:bg-black/40 border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin p-5">
                  <div className="relative min-h-[235px] min-w-[500px] flex justify-between items-center">
                    {layersConfig.map((neuronCount, layerIndex) => {
                      const isInput = layerIndex === 0;
                      const isOutput = layerIndex === layersConfig.length - 1;
                      const isHidden = !isInput && !isOutput;

                      return (
                        <div key={layerIndex} className="flex flex-col items-center justify-center gap-3.5 relative shrink-0 z-10 w-24">
                          {/* Interactive neuron updater controls for hidden layers */}
                          {isHidden ? (
                            <div className="flex items-center gap-1 shadow-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-lg p-1 h-[24px]">
                              <button
                                onClick={() => updateLayers(layerIndex, 1)}
                                className="p-0.5 text-slate-400 hover:text-cyan-400 bg-transparent rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5"
                                title="Add Node"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => updateLayers(layerIndex, -1)}
                                className="p-0.5 text-slate-400 hover:text-pink-400 bg-transparent rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5"
                                title="Remove Node"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-[8px] text-slate-400/95 font-bold uppercase tracking-widest flex items-center justify-center h-[24px]">
                              {isInput ? "INPUT" : "OUTPUT"}
                            </span>
                          )}

                          {/* Neurons lists with standard fixed heights so they align centered vertically */}
                          <div className="flex flex-col gap-3 justify-center items-center h-[170px]">
                            {Array(neuronCount).fill(0).map((_, nodeIndex) => {
                              const val = layersRef.current[layerIndex]?.neurons[nodeIndex] || 0;
                              // Glow intensity based on neuron activation levels
                              const outputColor = val > 0 ? "rgba(6, 182, 212, 0.45)" : "rgba(244, 63, 94, 0.45)";
                              const normalizedGlow = Math.min(1.0, Math.max(0, Math.abs(val)));

                              return (
                                <div
                                  key={nodeIndex}
                                  style={{
                                    boxShadow: `0 0 ${8 + normalizedGlow * 12}px ${outputColor}`,
                                  }}
                                  className={`w-9 h-9 rounded-full relative flex flex-col justify-center items-center font-mono text-[8.5px] font-black border transition-all ${
                                    val > 0 
                                      ? 'bg-cyan-950/20 border-cyan-400 text-cyan-300' 
                                      : 'bg-rose-950/20 border-rose-500 text-rose-300'
                                  }`}
                                >
                                  <span>{val.toFixed(1)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* SVG Connecting Synaptic Weights lines drawn behind */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      {/* Dynamic weights wiring connects layers together */}
                      {weightsRef.current.map((matrix, layerIdx) => (
                        matrix.values.map((row_weights, toIdx) => (
                          row_weights.map((weightVal, fromIdx) => {
                            const layerCount = layersConfig.length;
                            const fromLayerSize = layersConfig[layerIdx];
                            const toLayerSize = layersConfig[layerIdx + 1];

                            // Coordinates are now extremely clean percentiles inside the container
                            const xFrom = 10 + (layerIdx / (layerCount - 1)) * 80;
                            const xTo = 10 + ((layerIdx + 1) / (layerCount - 1)) * 80;

                            const fromOffset = 57 - ((fromLayerSize - 1) * 7.5) + (fromIdx * 15);
                            const toOffset = 57 - ((toLayerSize - 1) * 7.5) + (toIdx * 15);

                            // Elegant synapse highlighting based on strengths
                            const colorCode = weightVal > 0 
                              ? `rgba(34, 211, 238, ${Math.min(0.7, 0.15 + Math.abs(weightVal) * 0.45)})` // Cyan
                              : `rgba(244, 63, 94, ${Math.min(0.7, 0.15 + Math.abs(weightVal) * 0.45)})`; // Rose
                            const thickness = Math.min(2.5, Math.abs(weightVal) * 1.5 + 0.5);

                            return (
                              <line
                                key={`${layerIdx}-${fromIdx}-${toIdx}`}
                                x1={`${xFrom}%`}
                                y1={`${fromOffset}%`}
                                x2={`${xTo}%`}
                                y2={`${toOffset}%`}
                                stroke={colorCode}
                                strokeWidth={thickness}
                                strokeDasharray={weightVal < 0 ? "3,3" : "0"}
                              />
                            );
                          })
                        ))
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Loss History Chart Tracker */}
            <div className="mt-5 border-t border-slate-200/40 dark:border-white/5 pt-4">
              <span className="font-mono text-[8px] font-black text-cyan-400 uppercase tracking-widest block mb-2">// REAL-TIME MSE LOSS CURVE</span>
              <div className="h-16 w-full bg-slate-100/60 dark:bg-black/30 border border-slate-200/40 dark:border-white/5 rounded-xl p-2 flex items-end">
                {lossHistory.length < 2 ? (
                  <div className="w-full h-full flex justify-center items-center text-[9px] text-slate-500 font-mono lowercase uppercase">Awaiting training cycles...</div>
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      points={lossHistory.map((val, idx) => {
                        const x = (idx / (lossHistory.length - 1)) * 100;
                        const y = 90 - (Math.min(1.0, val) * 80); // scale max value limit
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: AI Tokenizer and Word Vectors semantic clustering */}
        <div id="ai_tokenizer_section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6">
          
          {/* TOKENIZER INPUT BOX */}
          <div className="lg:col-span-6 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200/40 dark:border-white/5 pb-2.5">
                <Type className="w-5 h-5 text-indigo-400" />
                <span className="font-extrabold text-[12px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">Embedding Tokenizer</span>
              </div>
              <p className="font-sans text-[10.5px] text-slate-400 mb-4 leading-relaxed">
                Transformers convert human language into multi-dimensional float arrays (token embeddings) before analyzing semantic context. Type text to see vector breakdown.
              </p>

              <div className="mb-4">
                <textarea
                  value={embeddingText}
                  onChange={(e) => {
                    setEmbeddingText(e.target.value);
                  }}
                  maxLength={110}
                  className="w-full bg-slate-100/80 dark:bg-slate-950/80 text-slate-800 dark:text-slate-100 p-3.5 border border-slate-300 dark:border-white/5 hover:border-indigo-400/30 rounded-2xl font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  rows={3}
                />
              </div>

              {/* Dynamic Tokens Blocks */}
              <div className="flex flex-wrap gap-2.5 items-center bg-slate-100/30 dark:bg-black/30 p-4 border border-slate-200/40 dark:border-white/5 rounded-2xl min-h-[70px]">
                {words.map((word, idx) => {
                  const styleClass = customColors[idx % customColors.length];
                  const isSelected = selectedTokenIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playClick();
                        setSelectedTokenIndex(idx === selectedTokenIndex ? null : idx);
                      }}
                      className={`py-1.5 px-3 rounded-lg border font-mono text-[10px] font-bold cursor-pointer transition-all ${styleClass} ${
                        isSelected ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-102 hover:contrast-125'
                      }`}
                    >
                      {word}
                      <span className="text-[7.5px] text-white/55 block opacity-85 mt-0.5">ID: {(word.charCodeAt(0) * Math.max(1, idx)).toString(16).toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Word Embeddings vectors coordinates simulation */}
            <div className="mt-6 border-t border-slate-200/40 dark:border-white/5 pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[8px] font-black text-indigo-400 uppercase tracking-widest block">// DENSE EMBEDDING HIGHLIGHTS (D=12, REALTIME)</span>
                <span className="text-[8.5px] text-slate-500 font-bold uppercase">Token Index: {selectedTokenIndex !== null ? `#${selectedTokenIndex}` : 'None Selected'}</span>
              </div>

              {selectedTokenIndex !== null && words[selectedTokenIndex] ? (
                <div className="space-y-2.5">
                  <div className="font-sans text-[10.5px] text-slate-100 font-bold uppercase leading-none">
                     Word mapping: <span className="text-indigo-400">"{words[selectedTokenIndex]}"</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-slate-150 dark:bg-black/40 p-3.5 border border-slate-300 dark:border-white/5 rounded-xl text-center">
                    {generateSimulatedEmbedding(words[selectedTokenIndex], selectedTokenIndex).map((val, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                        <span className="text-[7px] text-slate-400 block mb-0.5">d_{idx}</span>
                        <span className="text-[8.5px] font-bold font-mono text-slate-800 dark:text-indigo-300">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-150 dark:bg-black/20 rounded-xl border border-dashed border-slate-300 dark:border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Click any highlighted token word above to map spatial embedding vector</span>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: Transformer Self-Attention Visualizer Matrix */}
          <div className="lg:col-span-6 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-200/40 dark:border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-500 font-bold" />
                  <span className="font-extrabold text-[12px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">Self-Attention Heatmap</span>
                </div>
                <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 font-mono text-[7px] font-bold text-amber-400 rounded">
                  Q_K_V_MATRIX
                </div>
              </div>

              <p className="font-sans text-[10.5px] text-slate-400 mb-4 leading-normal">
                Hover columns in our self-attention matrix to inspect how transformer weights track relationships between words dynamically inside deep-learning decoders.
              </p>

              {/* Matrix Layout */}
              <div className="grid gap-1 bg-black/40 p-4 border border-slate-200/45 dark:border-white/5 rounded-2xl scrollbar-thin overflow-x-auto select-none">
                {/* Horizontal row word mappings */}
                <div className="flex items-center gap-1 min-w-[280px]">
                  <div className="w-14 truncate font-mono text-[8px] text-slate-500" />
                  {words.slice(0, 6).map((word, idx) => (
                    <div key={idx} className="flex-1 text-center font-mono text-[8.5px] font-bold uppercase text-slate-300 dark:text-slate-200 truncate tracking-tight">
                      {word}
                    </div>
                  ))}
                </div>

                {/* Sub rows */}
                {words.slice(0, 6).map((rWord, rowIdx) => (
                  <div key={rowIdx} className="flex items-center gap-1 min-w-[280px]">
                    {/* Row headers */}
                    <div className="w-14 text-right pr-2 font-mono text-[8px] uppercase font-bold text-slate-300 dark:text-slate-200 truncate tracking-tight">
                      {rWord}
                    </div>

                    {words.slice(0, 6).map((cWord, colIdx) => {
                      // Generate self attention coefficients (diagonal high, related words high)
                      const isSelf = rowIdx === colIdx;
                      let coefficient = 0.12;

                      if (isSelf) {
                        coefficient = 0.85; // self attention
                      } else {
                        // semantic relationship correlations mock calculation
                        const charDiff = Math.abs(rWord.length - cWord.length);
                        coefficient = parseFloat((0.15 + (1 / (charDiff + 1.2)) * 0.55).toFixed(2));
                      }

                      const valGlow = Math.floor(coefficient * 255);
                      // Amber heat highlights
                      const colorHex = `rgba(245, 158, 11, ${coefficient})`;
                      const isHovered = attentionHoverIdx === colIdx;

                      return (
                        <div
                          key={colIdx}
                          onMouseEnter={() => {
                            setAttentionHoverIdx(colIdx);
                            setHoveredCell({ row: rWord, col: cWord, val: coefficient });
                          }}
                          onMouseLeave={() => {
                            setAttentionHoverIdx(null);
                            setHoveredCell(null);
                          }}
                          style={{
                            background: colorHex,
                            border: isHovered ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: isHovered ? '0 0 12px rgba(245, 158, 11, 0.5)' : 'none',
                          }}
                          title={`Attention Coefficient (${rWord} -> ${cWord}): ${coefficient}`}
                          className={`flex-1 aspect-square rounded flex items-center justify-center font-mono text-[8.5px] cursor-pointer transition-all ${
                            coefficient > 0.5 
                              ? 'text-amber-950 font-black scale-102 z-10' 
                              : 'text-amber-200/90 dark:text-amber-100/90 font-bold'
                          }`}
                        >
                          {coefficient > 0.3 ? coefficient : ''}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Interactive dynamic tooltip decoder text explaining attention */}
              <div className="mt-3 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 p-2.5 rounded-xl min-h-[46px] flex items-center gap-1.5 shadow-sm">
                <span className="text-[10px] text-amber-400">💡</span>
                {hoveredCell ? (
                  <div className="font-mono text-[9px] text-amber-200 leading-tight">
                    <span className="text-amber-400 font-bold uppercase">Attention Weight decoded:</span> Column tag <strong className="text-white font-bold">"{hoveredCell.col}"</strong> projects a <strong className="text-amber-300 font-black">{(hoveredCell.val * 100).toFixed(0)}% focus scalar</strong> onto row unit <strong className="text-white font-bold">"{hoveredCell.row}"</strong>.
                  </div>
                ) : (
                  <div className="font-mono text-[9px] text-slate-400/95 leading-normal italic">
                    Hover any heat cell in the correlation matrix Grid above to see real-time Query-Key-Value transformer mathematical projections!
                  </div>
                )}
              </div>
            </div>

            {/* Semantic Plane Projection Tracker */}
            <div className="mt-6 border-t border-slate-200/40 dark:border-white/5 pt-4">
              <span className="font-mono text-[8px] font-black text-amber-500 uppercase tracking-widest block mb-1">// 2D SEMANTIC PROJECTION (COSINE DISTANCES)</span>
              
              <div className="relative h-24 bg-slate-100/30 dark:bg-black/30 border border-slate-200/40 dark:border-white/5 rounded-2xl p-2.5 overflow-hidden shadow-inner">
                {/* Visual grid lines representing vector spaces */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.22] flex items-center justify-center">
                  <div className="w-[1px] h-full bg-slate-400/40" />
                  <div className="h-[1px] w-full bg-slate-400/40 absolute" />
                  <div className="border border-dashed border-slate-500/35 rounded-full w-20 h-20 absolute" />
                  <div className="border border-dashed border-slate-500/25 rounded-full w-40 h-40 absolute" />
                  <span className="absolute bottom-1 right-2 text-slate-500 text-[6.5px] font-mono">2D_T_SNE_REDUCED</span>
                </div>

                {projectedClusters.map((p, idx) => {
                  let badgeColor = "text-cyan-400 border-cyan-500/10 bg-cyan-950/20";
                  if (p.cat === "agent") badgeColor = "text-indigo-400 border-indigo-500/10 bg-indigo-950/20";
                  if (p.cat === "math") badgeColor = "text-pink-400 border-pink-500/10 bg-pink-950/20";
                  if (p.cat === "pirate") badgeColor = "text-amber-400 border-amber-500/10 bg-amber-950/20";

                  return (
                    <span
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={`px-1.5 py-0.5 rounded border font-mono text-[7.5px] uppercase font-bold backdrop-blur-sm shadow-sm transition-all hover:scale-110 hover:contrast-125 select-none ${badgeColor}`}
                    >
                      {p.name}
                    </span>
                  );
                })}
              </div>

              {/* Group Category Legends */}
              <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[7.5px] font-mono uppercase tracking-wider text-slate-400/90">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow shadow-cyan-400/50" /> System Core</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow shadow-indigo-400/50" /> Agents Swarms</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-400 shadow shadow-pink-400/50" /> Tensor Calculus</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow shadow-amber-400/50" /> Pirate Theme</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

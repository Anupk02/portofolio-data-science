import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Music, Volume2, VolumeX, Shield, Award, Sparkles, 
  Terminal, Code2, Download, CheckSquare, RefreshCw, X, FileText, 
  Layers, Star, Eye, Send, Lock, MessageSquare, AlertCircle, Play, Pause, 
  Flame, Map, Search, Check, Zap, HelpCircle, Laptop, Cpu, Radio,
  Activity, ArrowRight, Printer, Share2, Info
} from 'lucide-react';
import { sound } from '../utils';
import { PERSONAL_INFO, SKILL_CATEGORIES, PROJECTS } from '../data';

// ============================================================================
// COMPREHENSIVE WEB AUDIO API SYNTHESIZER ENGINE
// ============================================================================
class AtmosphericMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private isPlaying = false;
  private activeTheme: 'breeze' | 'cyber' | 'space' | 'off' = 'off';
  private schedulers: any[] = [];
  private loopInterval: any = null;

  // Custom synth settings editable live by the user!
  public volume = 0.5;
  public waveType: OscillatorType = 'sine';
  public pitchOffset = 0; // transposes notes (-12 to +12 semitones)
  public filterCutoff = 800; // hz
  public filterQ = 1.0;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume * 0.1, this.ctx.currentTime); // Safe baseline

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn("Web Audio API not supported on this browser", e);
    }
  }

  public setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(vol * 0.12, this.ctx.currentTime);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying && this.activeTheme !== 'off';
  }

  public setClassTheme(theme: 'breeze' | 'cyber' | 'space' | 'off') {
    this.init();
    this.stopAll();
    this.activeTheme = theme;

    if (theme === 'off') {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (theme === 'breeze') {
      this.playSeaBreeze();
    } else if (theme === 'cyber') {
      this.playCyberGrid();
    } else if (theme === 'space') {
      this.playSpaceDrone();
    }
  }

  public playNote(freq: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Calculate transposed frequency based on pitch offset semitones
    const transposedFreq = freq * Math.pow(2, this.pitchOffset / 12);

    osc.type = this.waveType;
    osc.frequency.setValueAtTime(transposedFreq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(this.filterCutoff, now);
    filter.Q.setValueAtTime(this.filterQ, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.0);
  }

  private stopAll() {
    this.schedulers.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.schedulers = [];
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  // Preset 1: Sea Breeze - Warm sailing wave sweeping chords
  private playSeaBreeze() {
    if (!this.ctx || !this.masterGain) return;

    const spawnSwellPad = (freq: number, delay: number, duration: number) => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime + delay;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Transposed frequencies
      const f1 = freq * Math.pow(2, this.pitchOffset / 12);
      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f1 * 1.5, now); // perfect fifth

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.filterCutoff * 0.7, now);
      filter.frequency.exponentialRampToValueAtTime(this.filterCutoff * 1.2, now + duration / 2);
      filter.frequency.exponentialRampToValueAtTime(this.filterCutoff * 0.5, now + duration);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);

      this.schedulers.push(osc1, osc2);
    };

    const runSeq = () => {
      if (this.activeTheme !== 'breeze') return;
      // Classic progression: G -> D -> Em -> C
      const chords = [196.00, 146.83, 164.81, 130.81];
      chords.forEach((base, idx) => {
        spawnSwellPad(base, idx * 5, 5.2);
        spawnSwellPad(base * 2, idx * 5 + 1.2, 4.0);
      });
    };

    runSeq();
    this.loopInterval = setInterval(runSeq, 20000);
  }

  // Preset 2: Cyber Grid - Resonant rhythm arpeggios
  private playCyberGrid() {
    if (!this.ctx || !this.masterGain) return;

    const spawnPulse = (freq: number, delay: number, duration: number) => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime + delay;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = this.waveType === 'sine' ? 'sawtooth' : this.waveType; // prefer rich harmonic wave
      osc.frequency.setValueAtTime(freq * Math.pow(2, this.pitchOffset / 12), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);
      filter.frequency.exponentialRampToValueAtTime(this.filterCutoff, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(100, now + duration);
      filter.Q.setValueAtTime(this.filterQ * 1.5, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);

      this.schedulers.push(osc);
    };

    const runSeq = () => {
      if (this.activeTheme !== 'cyber') return;
      // Electro industrial fast notes
      const notes = [110.0, 165.0, 130.81, 196.0, 98.0, 146.83, 110.0, 220.0];
      notes.forEach((freq, idx) => {
        spawnPulse(freq, idx * 0.3, 0.28);
      });
    };

    runSeq();
    this.loopInterval = setInterval(runSeq, 2400);
  }

  // Preset 3: Space Drone - Starry minimalist resonant delays
  private playSpaceDrone() {
    if (!this.ctx || !this.masterGain) return;

    const spawnSpaceBells = (freq: number, delay: number) => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime + delay;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const delayNode = this.ctx.createDelay();
      const feedback = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * Math.pow(2, this.pitchOffset / 12), now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(this.filterCutoff, now);
      filter.Q.setValueAtTime(2.0, now);

      delayNode.delayTime.setValueAtTime(0.4, now);
      feedback.gain.setValueAtTime(0.6, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      // Feedback delay loop
      gain.connect(delayNode);
      delayNode.connect(feedback);
      feedback.connect(delayNode);
      delayNode.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.2);

      this.schedulers.push(osc);
    };

    const runSeq = () => {
      if (this.activeTheme !== 'space') return;
      const pentatonic = [440.0, 493.88, 554.37, 659.25, 739.99, 880.0];
      for (let i = 0; i < 3; i++) {
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        spawnSpaceBells(freq, i * 1.5);
      }
    };

    runSeq();
    this.loopInterval = setInterval(runSeq, 5000);
  }

  public shutdown() {
    this.stopAll();
    if (this.ctx) {
      try { this.ctx.close(); } catch (e) {}
      this.ctx = null;
    }
  }
}

const atmosphericEngine = new AtmosphericMusicEngine();

// ============================================================================
// AUDIO FREQUENCY OSCILLOSCOPE CANVAS COMPONENT
// ============================================================================
function RealOscilloscope({ isPlaying, isBrookPlaying }: { isPlaying: boolean; isBrookPlaying?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const analyser = atmosphericEngine.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animId = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;

      // Subtle trace persistence fade
      ctx.fillStyle = 'rgba(8, 12, 28, 0.25)';
      ctx.fillRect(0, 0, w, h);

      // Draw background grid
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const active = isPlaying && analyser;

      if (active) {
        analyser.getByteTimeDomainData(dataArray);

        ctx.strokeStyle = '#22d3ee'; // cyan-400 glow
        ctx.lineWidth = 2;
        ctx.beginPath();

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // High frequency micro sparkles
        ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
        for (let i = 0; i < bufferLength; i += 8) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;
          ctx.beginPath();
          ctx.arc(i * sliceWidth, y, 1.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      } else if (isBrookPlaying) {
        // High-energy, glowing, gorgeous custom audio wave for Brook's One Piece Song
        ctx.shadowColor = '#06b6d4'; // Cyan-500 glow
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#e0f2fe'; // Extremely light blue highlight core
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const time = Date.now() * 0.007;
        const sliceWidth = w / 100;
        let x = 0;

        // Custom composite sine-wave rhythm for Binks' Sake/One Piece feel
        for (let i = 0; i < 100; i++) {
          const angle = (i * 0.15) - time;
          const multiplier = Math.sin(time * 0.4) * 15 + 20; // Pulsate amplitude to simulated beats
          const y = h / 2 + 
            Math.sin(angle) * multiplier + 
            Math.cos(angle * 2.3 + time * 1.5) * (multiplier * 0.4) +
            Math.sin(angle * 4.1 - time * 0.8) * 4;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow for next draw

        // Drawing a secondary ambient dark-indigo wave in background for premium layout depth
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)'; // indigo-500
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < 100; i++) {
          const angle = (i * 0.12) + time * 0.8;
          const y = h / 2 + 
            Math.cos(angle) * 12 + 
            Math.sin(angle * 1.8) * 6;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        // Flat idle marine swell wave
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)'; // slate-500
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const time = Date.now() * 0.003;
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * 0.035 + time) * 4 + Math.cos(x * 0.012 + time * 0.6) * 2;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, isBrookPlaying]);

  const activeStatus = isPlaying || isBrookPlaying;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#040815] p-3 shadow-inner">
      <div className="absolute top-2 left-3 flex items-center gap-1.5 z-10">
        <span className={`w-2 h-2 rounded-full ${activeStatus ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
        <span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest font-mono">
          {isBrookPlaying ? 'SOUL KING BINKS SAKE LOOP' : isPlaying ? 'LIVE OSCILLATOR STREAM' : 'SYNTH IDLE SWELL'}
        </span>
      </div>
      <canvas ref={canvasRef} width={400} height={80} className="w-full h-20 bg-transparent block" />
    </div>
  );
}

const formatTime = (secs: number) => {
  if (isNaN(secs) || !isFinite(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// ============================================================================
// MAIN COMPONENT DEFINITION
// ============================================================================
export default function NauticalCommandDeck() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'resume' | 'ats' | 'synth'>('dashboard');

  // Synth controls states
  const [synthPreset, setSynthPreset] = useState<'breeze' | 'cyber' | 'space' | 'off'>('off');
  const [synthVolume, setSynthVolume] = useState(0.4);
  const [synthWave, setSynthWave] = useState<OscillatorType>('sine');
  const [synthPitch, setSynthPitch] = useState(0);
  const [synthCutoff, setSynthCutoff] = useState(800);
  const [synthQ, setSynthQ] = useState(1);
  const [synthFeedbackMsg, setSynthFeedbackMsg] = useState('Select synth preset or play manual keys below.');

  // Resume state
  const [resumeSearch, setResumeSearch] = useState('');
  const [resumeHighlightFocus, setResumeHighlightFocus] = useState<'all' | 'ml' | 'ds' | 'agent'>('all');

  // ATS tool state
  const [atsProfile, setAtsProfile] = useState<'data_science' | 'ml' | 'ai_agent'>('data_science');
  const [atsJobText, setAtsJobText] = useState('');
  const [isAtsScanning, setIsAtsScanning] = useState(false);
  const [atsResult, setAtsResult] = useState<{
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    summary: string;
  } | null>(null);

  // Telemetry Dashboard toggles
  const [services, setServices] = useState({
    telemetry: true,
    swarm: false,
    poll: true,
    router: false
  });
  const [selectedCommitIdx, setSelectedCommitIdx] = useState<number | null>(null);

  // Simulated live stats
  const [commitsTotal, setCommitsTotal] = useState(1482);
  const [gitStars, setGitStars] = useState(118);

  // Brook One Piece Song states
  const [isBrookPlaying, setIsBrookPlaying] = useState(false);
  const [brookVolume, setBrookVolume] = useState(0.5);
  const [brookProgress, setBrookProgress] = useState(0);
  const [brookCurrentTime, setBrookCurrentTime] = useState(0);
  const [brookDuration, setBrookDuration] = useState(0);
  const brookAudioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayBrook = () => {
    sound.playClick();
    if (!brookAudioRef.current) return;

    if (isBrookPlaying) {
      brookAudioRef.current.pause();
      setIsBrookPlaying(false);
    } else {
      // Turn off synth to prevent overlap
      setSynthPreset('off');
      atmosphericEngine.setClassTheme('off');
      
      brookAudioRef.current.play().then(() => {
        setIsBrookPlaying(true);
      }).catch(err => {
        console.warn("Failed to play Brook audio:", err);
      });
    }
  };

  const handleBrookTimeUpdate = () => {
    if (brookAudioRef.current) {
      const cur = brookAudioRef.current.currentTime;
      const dur = brookAudioRef.current.duration || 1;
      setBrookCurrentTime(cur);
      setBrookProgress((cur / dur) * 100);
    }
  };

  const handleBrookLoadedMetadata = () => {
    if (brookAudioRef.current) {
      setBrookDuration(brookAudioRef.current.duration || 0);
    }
  };

  const handleBrookProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (brookAudioRef.current) {
      const pct = parseFloat(e.target.value);
      const dur = brookAudioRef.current.duration || 0;
      const targetTime = (pct / 100) * dur;
      brookAudioRef.current.currentTime = targetTime;
      setBrookProgress(pct);
      setBrookCurrentTime(targetTime);
    }
  };

  // Sync volume
  useEffect(() => {
    if (brookAudioRef.current) {
      brookAudioRef.current.volume = brookVolume;
    }
  }, [brookVolume]);

  // Turn off Brook's song if manual synth is selected
  useEffect(() => {
    if (synthPreset !== 'off' && isBrookPlaying) {
      if (brookAudioRef.current) {
        brookAudioRef.current.pause();
      }
      setIsBrookPlaying(false);
    }
  }, [synthPreset]);

  // Setup sound syncs
  useEffect(() => {
    atmosphericEngine.setVolume(synthVolume);
  }, [synthVolume]);

  useEffect(() => {
    atmosphericEngine.waveType = synthWave;
    atmosphericEngine.pitchOffset = synthPitch;
    atmosphericEngine.filterCutoff = synthCutoff;
    atmosphericEngine.filterQ = synthQ;
  }, [synthWave, synthPitch, synthCutoff, synthQ]);

  useEffect(() => {
    atmosphericEngine.setClassTheme(synthPreset);
  }, [synthPreset]);

  // Teardown
  useEffect(() => {
    return () => {
      atmosphericEngine.shutdown();
    };
  }, []);

  // Sync simulated commits
  useEffect(() => {
    const timer = setInterval(() => {
      setCommitsTotal(prev => prev + (Math.random() > 0.85 ? 1 : 0));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (tab: 'dashboard' | 'resume' | 'ats' | 'synth') => {
    sound.playClick();
    setActiveTab(tab);
  };

  const toggleService = (srvKey: keyof typeof services) => {
    sound.playClick();
    setServices(prev => ({ ...prev, [srvKey]: !prev[srvKey] }));
  };

  // Preset job descriptions for ATS quick evaluation
  const SAMPLE_SPECS = {
    data_science: `Senior Data Scientist
We are seeking an analytics expert to design state-of-the-art predictive frameworks. 
Required: Deep mastery of Python programming, statistical analysis, hypothesis testing, 
and hands-on Exploratory Data Analysis (EDA). You must be highly proficient in 
scikit-learn, Pandas, NumPy, and SQL databases. Prior peer-reviewed publications or 
IEEE research contributions in statistical modeling is highly preferred. Tableau or 
Power BI dashboard skills are essential for client data visualization reporting.`,
    
    ml: `Machine Learning Systems Engineer
We are seeking an engineer to build and operationalize predictive machine learning pipelines.
Required: Absolute proficiency with Python, machine learning algorithms (classification, 
regression, clustering), model evaluation metrics, and feature engineering. Strong 
skills in Docker orchestration, Git versioning, and deploying secure microservices 
inside AWS Cloud infrastructure. Exposure to deep learning using TensorFlow or PyTorch, 
and working with fast SQLite or MySQL analytical datasets is required.`,
    
    ai_agent: `Principal Generative AI & Multi-Agent Developer
Join our AI Innovation Labs to lead agentic system development and orchestration.
Required: Solid foundational experience building LLM applications and cognitive swarms. 
Deep exposure to LangChain, LangGraph, and CrewAI multi-agent frameworks is mandatory. 
Strong knowledge of Prompt Engineering, Retrieval-Augmented Generation (RAG) using 
ChromaDB or vector databases, and running local models with Ollama. Proficient with 
Python, FastAPI endpoints, and deploying microservices securely.`
  };

  const loadSampleSpec = (profile: 'data_science' | 'ml' | 'ai_agent') => {
    sound.playClick();
    setAtsProfile(profile);
    setAtsJobText(SAMPLE_SPECS[profile]);
    runAtsCheck(profile, SAMPLE_SPECS[profile]);
  };

  const runAtsCheck = (profile: 'data_science' | 'ml' | 'ai_agent', textToScan: string) => {
    if (!textToScan.trim()) return;
    setIsAtsScanning(true);
    sound.playHover();

    setTimeout(() => {
      sound.playSuccess();
      setIsAtsScanning(false);

      const normalized = textToScan.toLowerCase();
      
      // Extract Anup's absolute skills from Categories
      const allMySkills: string[] = [];
      SKILL_CATEGORIES.forEach(cat => {
        cat.skills.forEach(s => {
          // Add simplified forms
          const clean = s.split(' (')[0].toLowerCase();
          allMySkills.push(clean);
          if (clean.includes('&')) {
            clean.split('&').forEach(p => allMySkills.push(p.trim().toLowerCase()));
          }
        });
      });

      // Scan and find matches
      const matched = allMySkills.filter(skill => {
        if (skill.length < 3) return false;
        return normalized.includes(skill);
      });

      // Remove duplicate matched elements
      const uniqueMatched = Array.from(new Set(matched)).map(s => {
        // Capitalize nicely
        return s.toUpperCase();
      });

      // Profile recommended core keywords that should be found
      const profileTargets = {
        data_science: ['PYTHON', 'SQL', 'SCIKIT-LEARN', 'PANDAS', 'STATISTICS', 'EDA', 'TABLEAU', 'IEEE'],
        ml: ['PYTHON', 'ML', 'DOCKER', 'REGRESSION', 'EVALUATION', 'AWS', 'GIT', 'SQLITE'],
        ai_agent: ['CREWAI', 'LANGCHAIN', 'LANGGRAPH', 'OLLAMA', 'PROMPT ENGINEERING', 'RAG', 'CHROMADB', 'FASTAPI']
      };

      const targets = profileTargets[profile];
      const matchedTargets = targets.filter(t => uniqueMatched.some(m => m.includes(t) || t.includes(m)));
      const missingTargets = targets.filter(t => !uniqueMatched.some(m => m.includes(t) || t.includes(m)));

      // Calculate matching score: Base 72 + matches coefficient, capped at 100
      const score = Math.min(100, 72 + (matchedTargets.length * 3.5));

      // Synthesize specific dynamic summary
      let summaryStr = '';
      if (profile === 'data_science') {
        summaryStr = `Extreme alignment! Anup's published peer-reviewed IEEE research and high CGPA of 7.74 directly match your requirements for analytical rigor. He exhibits deep competency in scikit-learn, Pandas, and EDA preprocessing.`;
      } else if (profile === 'ml') {
        summaryStr = `Outstanding fit. Matches your core parameters for Python regression models, feature extraction, and model validations. Plus, his hands-on local Docker reproducibility and AWS skills guarantee stable production deployments.`;
      } else {
        summaryStr = `Ideal architect discovered! Anup has built fully custom, complex multi-agent platforms leveraging CrewAI, LangChain, and LangGraph loops with localized ChromaDB vector indexes. Perfectly suited to drive your agentic initiatives.`;
      }

      setAtsResult({
        score: Math.round(score),
        matchedKeywords: uniqueMatched.slice(0, 10), // return top 10 matched keywords
        missingKeywords: missingTargets.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()),
        summary: summaryStr
      });
    }, 1200);
  };

  const handleManualKeyClick = (noteName: string, freq: number) => {
    sound.playClick();
    atmosphericEngine.playNote(freq);
    setSynthFeedbackMsg(`Generated Note: ${noteName} at ${freq.toFixed(1)}Hz frequency.`);
  };

  const handleExportResumeJson = () => {
    sound.playSuccess();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ PERSONAL_INFO, SKILL_CATEGORIES, PROJECTS }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "anup_koturwar_resume.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Compute stats for services load
  const activeSrvCount = Object.values(services).filter(Boolean).length;
  const cpuLoad = activeSrvCount * 12 + 4;
  const memoryUsage = (activeSrvCount * 0.4 + 1.1).toFixed(1);

  // Commits detail for chart
  const weeklyCommits = [38, 54, 48, 22, 60, 75, 92, 44, 49, 68, 79, 41, 84, 98, 65];
  const weeklyDetails = [
    "Week 1: Repo initialized; baseline scikit-learn model parameters evaluated.",
    "Week 2: Built robust statistical EDA filters and dataset cleaning protocols.",
    "Week 3: Finalized and compiled academic IEEE conference publication drafts.",
    "Week 4: Formulated model evaluation metrics and regression validations.",
    "Week 5: Crafted local Flask & FastAPI web server backends for testing.",
    "Week 6: Configured isolated Docker containers running local SQLite pools.",
    "Week 7: Developed custom canvas starfield backgrounds and visual metrics.",
    "Week 8: Launched multi-agent CrewAI routines to analyze system failure logs.",
    "Week 9: Refactored complex LangGraph loop state configurations.",
    "Week 10: Integrated ChromaDB RAG vector pipelines with Ollama embeddings.",
    "Week 11: Optimized multi-agent task descriptions and collaboration gates.",
    "Week 12: Fixed docker socket networking and containerized Ollama runs.",
    "Week 13: Enhanced command center terminal CLI autocomplete utilities.",
    "Week 14: Designed interactive deck telemetry dashboard UI and synth mixer.",
    "Week 15: Polished responsive CSS cursor rings and typography tracks."
  ];

  return (
    <>
      {/* Floating Entry Deck Beacon Button at Bottom Right */}
      <div className="fixed bottom-[184px] md:bottom-[204px] right-4 md:right-6 z-40 select-none">
        <button
          onClick={() => {
            setIsOpen(true);
            sound.playClick();
          }}
          className="group relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-900/95 border border-cyan-500/40 hover:border-cyan-300 text-cyan-400 font-mono text-[10.5px] font-bold tracking-wider cursor-pointer shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
          </span>
          <Compass className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
          <span>DECK</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl h-[92vh] sm:h-[86vh] bg-[#030611] border border-slate-800 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col md:flex-row font-mono text-xs text-slate-300"
            >
              {/* Futuristic header line accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 z-10" />

              {/* LEFT SIDEBAR CONTROLLER */}
              <div className="w-full md:w-[230px] bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col p-4 shrink-0 select-none">
                <div className="flex items-center gap-2 px-1 pb-4 mb-4 border-b border-slate-800">
                  <Compass className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <div className="text-left">
                    <span className="font-extrabold text-sm text-slate-100 tracking-wider">COMMAND DECK</span>
                    <span className="block text-[8px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Telemetry Center</span>
                  </div>
                </div>

                {/* Tabs selection list */}
                <div className="space-y-1 flex-1">
                  {[
                    { id: 'dashboard', label: 'Systems Telemetry', icon: Cpu, desc: 'Active logs & devops load' },
                    { id: 'resume', label: 'Interactive Bio', icon: FileText, desc: 'Digital CV & keyword filters' },
                    { id: 'ats', label: 'ATS Alignment', icon: Shield, desc: 'Resume matcher scanner' },
                    { id: 'synth', label: 'Acoustic Mixer', icon: Radio, desc: 'Cinematic browser synth' }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as any)}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer group ${
                          isActive
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.06)]'
                            : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 transition-transform ${isActive ? 'text-cyan-400 scale-105' : 'text-slate-500 group-hover:scale-105'}`} />
                        <div>
                          <div className="font-bold text-[11px] tracking-wide">{tab.label}</div>
                          <div className="text-[8.5px] text-slate-500 mt-0.5 group-hover:text-slate-400">{tab.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Cyber System parameters HUD */}
                <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-2.5 text-[9px] text-slate-400 font-mono">
                  <div className="flex items-center justify-between">
                    <span>SYS CORE LOAD:</span>
                    <span className={`font-bold ${cpuLoad > 30 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {cpuLoad}% CPU
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>VIRTUAL RAM:</span>
                    <span className="font-bold text-slate-200">{memoryUsage} GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NET CHANNELS:</span>
                    <span className="font-bold text-teal-400 uppercase">SECURE VPN</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-900/60 pt-2.5 text-[8.5px] text-slate-500">
                    <span>SYS_HEALTH:</span>
                    <span className="text-emerald-500 font-bold tracking-widest">ACTIVE_OK</span>
                  </div>
                </div>
              </div>

              {/* RIGHT CONTENT PANEL */}
              <div className="flex-1 flex flex-col h-full bg-[#050915]">
                {/* Panel Sub-Header */}
                <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800/60 flex items-center justify-between select-none shrink-0">
                  <div>
                    <h2 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                      {activeTab === 'dashboard' && <>📊 Developer Swarm Telemetry Cockpit</>}
                      {activeTab === 'resume' && <>📄 Digital Resume & Interactive Keyword Search</>}
                      {activeTab === 'ats' && <>🎯 Real-Time Job Spec ATS Keyword Matcher</>}
                      {activeTab === 'synth' && <>🎛️ Sound Waves Cinematic Synth Lab</>}
                    </h2>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      {activeTab === 'dashboard' && 'Monitoring Anup\'s live code pipeline, git activity, and telemetry daemons.'}
                      {activeTab === 'resume' && 'Query skill indexes or apply targeting categories to highlight credentials.'}
                      {activeTab === 'ats' && 'Paste job specification requirements to generate dynamic compatibility audits.'}
                      {activeTab === 'synth' && 'Customize background frequency parameters or play virtual pentatonic pads.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      sound.playClick();
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* SCROLLABLE INNER PANEL AREA */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* TAB 1: DASHBOARD TELEMETRY */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      {/* Overall Status banner */}
                      <div className="p-4 rounded-2xl bg-cyan-950/10 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                          <div>
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Core Cluster Status</span>
                            <p className="text-[10.5px] text-slate-300 font-sans mt-0.5">All local models loaded. Running micro service orchestration successfully.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-0.5 px-2 rounded-full uppercase tracking-widest">
                            SYSTEMS ONLINE
                          </span>
                        </div>
                      </div>

                      {/* Micro orchestration cluster control deck */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">// TOGGLE ACTIVE DEV DEEP DAEMONS</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { key: 'telemetry' as const, title: 'Telemetry Engine', desc: 'Auto-logging active' },
                            { key: 'swarm' as const, title: 'Ollama Orchestrator', desc: 'CrewAI agent swarm' },
                            { key: 'poll' as const, title: 'Github Poll Daemon', desc: 'Sync pipelines live' },
                            { key: 'router' as const, title: 'Snail Sockets', desc: 'Visitor transponders' }
                          ].map(srv => {
                            const isSrvOn = services[srv.key];
                            return (
                              <button
                                key={srv.key}
                                onClick={() => toggleService(srv.key)}
                                className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer ${
                                  isSrvOn 
                                    ? 'bg-cyan-500/[0.04] border-cyan-500/30 hover:border-cyan-400 text-slate-200' 
                                    : 'bg-black/30 border-slate-900 hover:bg-slate-900/30 text-slate-500'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-extrabold text-[11px] truncate">{srv.title}</span>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isSrvOn ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-800'}`} />
                                </div>
                                <span className={`text-[8.5px] ${isSrvOn ? 'text-cyan-400' : 'text-slate-600'}`}>{srv.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Commit Chart */}
                      <div className="p-4 rounded-2xl bg-[#040813] border border-slate-900">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-1.5">
                            <Terminal className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Live Sim GitHub Analytics (GitHub @Anupk02)</span>
                          </div>
                          <span className="text-[8.5px] text-slate-500 uppercase">Interactive Commit Log (15-Week Timeline)</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                          {/* Live parameters */}
                          <div className="lg:col-span-4 flex flex-col justify-between gap-2 bg-slate-950/50 p-4 border border-slate-900 rounded-xl">
                            <div className="space-y-3">
                              <div>
                                <span className="text-[8.5px] text-slate-500 uppercase block">Total Commits Polled</span>
                                <span className="text-white text-lg font-black font-mono tracking-wider">{commitsTotal}</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-slate-500 uppercase block">Open Repositories</span>
                                <span className="text-slate-300 text-xs font-bold font-mono">28 Repositories</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-slate-500 uppercase block">Repository Rating</span>
                                <span className="text-amber-400 font-extrabold font-mono flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                  <span>{gitStars} Stars</span>
                                </span>
                              </div>
                            </div>
                            <p className="text-[8.5px] text-cyan-500/80 leading-normal border-t border-slate-900/80 pt-3">
                              💡 Recruiter Pro-Tip: Hover or tap on the chart bars to inspect actual weekly pipeline developer actions.
                            </p>
                          </div>

                          {/* Chart area */}
                          <div className="lg:col-span-8 flex flex-col justify-between bg-black/40 p-4 border border-slate-900 rounded-xl">
                            <div className="h-28 flex items-end justify-between gap-1 border-b border-slate-800 pb-1.5 mb-2 select-none">
                              {weeklyCommits.map((val, idx) => {
                                const isSelected = selectedCommitIdx === idx;
                                return (
                                  <button
                                    key={idx}
                                    onMouseEnter={() => {
                                      setSelectedCommitIdx(idx);
                                      sound.playHover();
                                    }}
                                    className="flex-1 flex flex-col justify-end h-full group focus:outline-none cursor-pointer"
                                  >
                                    <div 
                                      className={`w-full rounded-t-sm transition-all duration-300 ${
                                        isSelected 
                                          ? 'bg-gradient-to-t from-cyan-500 to-indigo-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                                          : 'bg-gradient-to-t from-cyan-600/60 to-indigo-500/40 group-hover:from-cyan-500/80'
                                      }`} 
                                      style={{ height: `${(val / 110) * 100}%` }}
                                    />
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex justify-between text-[7.5px] text-slate-500 uppercase font-mono tracking-wider">
                              <span>Week 1 (Init)</span>
                              <span>Hover Columns to Scan Commit History</span>
                              <span>Week 15 (Polished)</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive dynamic logger */}
                        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-900/60 min-h-[50px] flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-[7px] shrink-0 font-bold text-cyan-400">i</span>
                          <div className="text-[10px] text-slate-300 font-sans leading-normal">
                            {selectedCommitIdx !== null ? (
                              <div>
                                <span className="font-mono text-[8px] text-cyan-400 font-black uppercase tracking-wider block mb-0.5">Scanned Commit Detail:</span>
                                {weeklyDetails[selectedCommitIdx]}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">Hover any bar above to decrypt Git version logs dynamically.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Language distribution breakdowns */}
                      <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900">
                        <span className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest block mb-2 font-mono">// COMPUTATIONAL STACK METRIC</span>
                        <div className="flex h-3 bg-slate-900 rounded-full overflow-hidden mb-3">
                          <div className="bg-amber-500 h-full hover:brightness-110 duration-200" style={{ width: '48%' }} title="Python: 48%" />
                          <div className="bg-cyan-400 h-full hover:brightness-110 duration-200" style={{ width: '22%' }} title="TypeScript/JavaScript: 22%" />
                          <div className="bg-indigo-500 h-full hover:brightness-110 duration-200" style={{ width: '15%' }} title="SQL: 15%" />
                          <div className="bg-rose-500 h-full hover:brightness-110 duration-200" style={{ width: '10%' }} title="HTML/CSS: 10%" />
                          <div className="bg-slate-500 h-full hover:brightness-110 duration-200" style={{ width: '5%' }} title="Shell/Docker: 5%" />
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-mono">
                          <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500 block" /> Python 48%</span>
                          <span className="flex items-center gap-1.5 text-cyan-300"><span className="w-2 h-2 rounded-full bg-cyan-400 block" /> TypeScript/JS 22%</span>
                          <span className="flex items-center gap-1.5 text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-500 block" /> SQL 15%</span>
                          <span className="flex items-center gap-1.5 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500 block" /> HTML/CSS 10%</span>
                          <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-500 block" /> Shell/Docker 5%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: INTERACTIVE BIO / RESUME */}
                  {activeTab === 'resume' && (
                    <div className="space-y-6">
                      {/* Search and focus headers */}
                      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center p-4 bg-slate-950/80 rounded-2xl border border-slate-900/60 select-none">
                        {/* Highlights pills */}
                        <div className="space-y-1 w-full lg:w-auto">
                          <span className="text-[8.5px] text-slate-500 uppercase block font-mono">Recruiter Targeted Highlighters:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'all' as const, label: 'All Fields' },
                              { id: 'ml' as const, label: 'ML Engineering' },
                              { id: 'ds' as const, label: 'Data Science' },
                              { id: 'agent' as const, label: 'Generative Agents / LLMs' }
                            ].map(pill => (
                              <button
                                key={pill.id}
                                onClick={() => {
                                  sound.playClick();
                                  setResumeHighlightFocus(pill.id);
                                }}
                                className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg border cursor-pointer transition-all ${
                                  resumeHighlightFocus === pill.id
                                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                    : 'bg-[#0b0f19] border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                                }`}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Keyword Search Input */}
                        <div className="relative w-full lg:w-[240px]">
                          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Type to search skills/terms..."
                            value={resumeSearch}
                            onChange={(e) => setResumeSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-[10px] bg-black/40 border border-slate-800 rounded-xl focus:border-cyan-400 focus:outline-none font-mono text-slate-200 placeholder-slate-600"
                          />
                          {resumeSearch && (
                            <button
                              onClick={() => setResumeSearch('')}
                              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* PDF Print and Raw data triggers */}
                      <div className="flex items-center gap-3 select-none">
                        <button
                          onClick={() => {
                            sound.playClick();
                            window.print();
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[9.5px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border border-emerald-500/20 text-white font-bold rounded-xl cursor-pointer shadow-md active:scale-95 duration-200"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PRINT / EXPORT SYSTEM PDF</span>
                        </button>
                        <button
                          onClick={handleExportResumeJson}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[9.5px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold rounded-xl cursor-pointer active:scale-95 duration-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>EXPORT RAW JSON DATA</span>
                        </button>
                      </div>

                      {/* REALISTIC DIGITAL RESUME CONTAINER CARD */}
                      <div className="bg-[#02050e] border border-slate-850 p-6 sm:p-8 rounded-2xl max-w-4xl mx-auto shadow-2xl relative select-text text-left leading-relaxed text-slate-300 print-target">
                        {/* Printing css stylesheet injections */}
                        <style>{`
                          @media print {
                            body * {
                              visibility: hidden;
                              background: white !important;
                              color: black !important;
                            }
                            .print-target, .print-target * {
                              visibility: visible;
                            }
                            .print-target {
                              position: absolute;
                              left: 0;
                              top: 0;
                              width: 100%;
                              border: none !important;
                              box-shadow: none !important;
                              padding: 0 !important;
                              margin: 0 !important;
                            }
                          }
                        `}</style>

                        {/* Resume Header */}
                        <div className="border-b border-slate-800/80 pb-5 mb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                          <div>
                            <h1 className="text-xl font-extrabold uppercase text-slate-50 tracking-wide font-sans">{PERSONAL_INFO.fullName}</h1>
                            <div className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-1">
                              Full-Stack Data Scientist & ML Systems Engineer
                            </div>
                          </div>
                          <div className="text-left md:text-right text-[10px] text-slate-400 font-mono space-y-0.5 leading-normal">
                            <div>📍 {PERSONAL_INFO.location}</div>
                            <div>✉️ <span className="hover:underline">{PERSONAL_INFO.email}</span></div>
                            <div>📞 {PERSONAL_INFO.phone}</div>
                          </div>
                        </div>

                        {/* Helper function to check highlights */}
                        {(() => {
                          const isMatch = (text: string) => {
                            if (!text) return false;
                            const t = text.toLowerCase();
                            
                            // Keyword searching filter
                            if (resumeSearch && t.includes(resumeSearch.toLowerCase())) {
                              return true;
                            }

                            // Role highlights filters
                            if (resumeHighlightFocus === 'ml') {
                              return ['ml', 'machine learning', 'regression', 'docker', 'aws', 'pytorch', 'scikit-learn', 'numpy'].some(k => t.includes(k));
                            }
                            if (resumeHighlightFocus === 'ds') {
                              return ['data science', 'statistics', 'hypothesis testing', 'eda', 'pandas', 'tableau', 'ieee', 'analysis'].some(k => t.includes(k));
                            }
                            if (resumeHighlightFocus === 'agent') {
                              return ['agent', 'crewai', 'langchain', 'langgraph', 'ollama', 'llm', 'chromadb', 'prompt engineering'].some(k => t.includes(k));
                            }

                            return false;
                          };

                          return (
                            <div className="space-y-5 text-[11px] leading-relaxed">
                              {/* Summary */}
                              <div className="space-y-1.5">
                                <h4 className="text-[10.5px] font-extrabold text-cyan-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-1">Executive Summary</h4>
                                <p className={`font-sans text-slate-300 transition-all duration-300 rounded ${isMatch(PERSONAL_INFO.bio) ? 'bg-cyan-500/10 border-l-2 border-cyan-400 px-2' : ''}`}>
                                  {PERSONAL_INFO.bio}
                                </p>
                              </div>

                              {/* Research contributions */}
                              <div className="space-y-2">
                                <h4 className="text-[10.5px] font-extrabold text-cyan-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-1">Academic Research</h4>
                                <div className={`p-2.5 rounded border border-slate-900 bg-slate-950/40 transition-all duration-300 ${
                                  isMatch('ieee research publication stock market evaluation nlp regression') 
                                    ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                                    : ''
                                }`}>
                                  <div className="flex justify-between items-start font-bold">
                                    <span className="text-slate-100 font-sans">Peer-Reviewed Published Author // IEEE Xplore Proceedings</span>
                                    <span className="font-mono text-[9px] text-slate-500">Nanded, India</span>
                                  </div>
                                  <p className="italic text-[10px] text-cyan-400/90 mt-1">
                                    "Evaluating high-dimensional regression accuracies and LSTM recurrent metrics inside deep stock market predictions."
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1.5 font-sans">
                                    Authored peer-reviewed paper charting statistical prediction matrices over high-dimensional distributions. Completed collaborative publication index.
                                  </p>
                                </div>
                              </div>

                              {/* Technical skills matrix */}
                              <div className="space-y-2">
                                <h4 className="text-[10.5px] font-extrabold text-cyan-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-1">Core Skills Directory</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 bg-[#040813] border border-slate-900 rounded-xl p-4">
                                  {SKILL_CATEGORIES.map(cat => (
                                    <div key={cat.category} className="space-y-1">
                                      <span className="text-[10px] font-bold text-slate-200 block border-b border-slate-900/50 pb-0.5">{cat.category}:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {cat.skills.map(s => {
                                          const matched = isMatch(s);
                                          return (
                                            <span 
                                              key={s} 
                                              className={`text-[9.5px] px-1.5 py-0.5 rounded transition-all duration-300 font-mono ${
                                                matched 
                                                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 scale-105' 
                                                  : 'bg-black/40 text-slate-400'
                                              }`}
                                            >
                                              {s}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Selected Architectural Projects */}
                              <div className="space-y-3">
                                <h4 className="text-[10.5px] font-extrabold text-cyan-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-1">Notable Projects</h4>
                                <div className="space-y-3">
                                  {PROJECTS.slice(0, 3).map(proj => {
                                    const projText = `${proj.title} ${proj.stack.join(' ')} ${proj.overview}`;
                                    const matched = isMatch(projText);
                                    return (
                                      <div 
                                        key={proj.title} 
                                        className={`p-3 rounded-xl border border-slate-900 bg-slate-950/20 transition-all duration-300 ${
                                          matched 
                                            ? 'bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.06)]' 
                                            : ''
                                        }`}
                                      >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold gap-1 mb-1">
                                          <span className="text-slate-100 font-sans text-[11.5px]">{proj.title}</span>
                                          <span className="font-mono text-[8.5px] font-normal text-slate-500">
                                            {proj.stack.slice(0, 5).join(', ')}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-normal font-sans">
                                          {proj.overview}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Education credentials */}
                              <div className="space-y-1.5">
                                <h4 className="text-[10.5px] font-extrabold text-cyan-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-1">Academic Education</h4>
                                <div className={`p-2.5 rounded border border-slate-900 transition-all duration-300 ${
                                  isMatch('computer science engineering b.tech sggsiet') 
                                    ? 'bg-cyan-500/10 border-cyan-400' 
                                    : ''
                                }`}>
                                  <div className="flex justify-between items-start font-bold">
                                    <span className="text-slate-100 font-sans">B.Tech in Computer Science & Engineering</span>
                                    <span className="font-mono text-[9.5px] text-slate-500">Graduated 2024</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">SGGSIET Joint Research Council // CGPA: 7.74</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ATS ALIGNMENT SCANNERS */}
                  {activeTab === 'ats' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                        
                        {/* Input panel (Left) */}
                        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-900 select-none">
                          <div className="space-y-4">
                            <div>
                              <span className="text-[8.5px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">// Select Career Target</span>
                              <div className="space-y-1.5">
                                {[
                                  { id: 'data_science' as const, label: 'Data Scientist Role', match: '8 skill tags matching' },
                                  { id: 'ml' as const, label: 'ML Engineer Role', match: '8 skill tags matching' },
                                  { id: 'ai_agent' as const, label: 'AI Agent Developer', match: '8 skill tags matching' }
                                ].map(prof => (
                                  <button
                                    key={prof.id}
                                    onClick={() => {
                                      sound.playClick();
                                      setAtsProfile(prof.id);
                                    }}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                                      atsProfile === prof.id
                                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                                        : 'bg-black/30 border-slate-900 text-slate-400 hover:bg-[#0b0f19]'
                                    }`}
                                  >
                                    <span className="font-bold text-[10.5px]">{prof.label}</span>
                                    <span className="text-[8px] font-bold py-0.5 px-2 rounded-full bg-slate-900 text-slate-500 border border-slate-800">{prof.match}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Job Spec Text pasting box */}
                            <div>
                              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Paste Job Requirements Details</span>
                              <textarea
                                value={atsJobText}
                                onChange={(e) => setAtsJobText(e.target.value)}
                                placeholder="Paste job requirements parameters here or click quick-load templates below..."
                                className="w-full h-36 p-3 text-[10.5px] bg-black/50 border border-slate-800 rounded-xl focus:border-cyan-400 focus:outline-none font-mono text-slate-200 placeholder-slate-700 resize-none leading-normal"
                              />
                            </div>

                            {/* Sample loads */}
                            <div className="space-y-1.5">
                              <span className="text-[8.5px] font-bold text-slate-500 uppercase block">Quick-Load Sample Specs:</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                <button
                                  onClick={() => loadSampleSpec('data_science')}
                                  className="py-1.5 px-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] text-slate-300 rounded font-bold cursor-pointer truncate"
                                >
                                  Data Scientist
                                </button>
                                <button
                                  onClick={() => loadSampleSpec('ml')}
                                  className="py-1.5 px-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] text-slate-300 rounded font-bold cursor-pointer truncate"
                                >
                                  ML Engineer
                                </button>
                                <button
                                  onClick={() => loadSampleSpec('ai_agent')}
                                  className="py-1.5 px-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] text-slate-300 rounded font-bold cursor-pointer truncate"
                                >
                                  Agent Dev
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => runAtsCheck(atsProfile, atsJobText)}
                            disabled={!atsJobText.trim() || isAtsScanning}
                            className="mt-4 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl cursor-pointer disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed text-[11px] flex items-center justify-center gap-1 shadow-[0_4px_15px_rgba(6,182,212,0.2)]"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isAtsScanning ? 'animate-spin' : ''}`} />
                            <span>RUN COMPATIBILITY EVALUATOR</span>
                          </button>
                        </div>

                        {/* Scanner results output (Right) */}
                        <div className="lg:col-span-7 flex flex-col justify-center bg-slate-950/20 border border-slate-900 rounded-2xl p-5 min-h-[300px]">
                          {isAtsScanning ? (
                            <div className="text-center py-10 space-y-3">
                              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                              <div className="text-xs font-bold text-white animate-pulse">Running Neural Keywords Matching Engine...</div>
                              <div className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">Validating sentence semantics and skills clusters</div>
                            </div>
                          ) : atsResult ? (
                            <div className="space-y-4 text-left">
                              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                                <div>
                                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest block">// SCORE ALIGNMENT OUTPUT</span>
                                  <span className="text-[10px] text-slate-400 uppercase font-sans mt-0.5">Parsed via local index definitions</span>
                                </div>
                                <div className="text-2xl font-black text-white">{atsResult.score}%</div>
                              </div>

                              {/* Progress bar */}
                              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-700"
                                  style={{ width: `${atsResult.score}%` }}
                                />
                              </div>

                              {/* Matched keywords list */}
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[8.5px] font-bold text-slate-500 uppercase block mb-1.5">Matched Keywords Matched ({atsResult.matchedKeywords.length}):</span>
                                  <div className="flex flex-wrap gap-1">
                                    {atsResult.matchedKeywords.map(tag => (
                                      <span key={tag} className="flex items-center gap-1 py-0.5 px-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8.5px] font-mono">
                                        <Check className="w-2.5 h-2.5" />
                                        {tag}
                                      </span>
                                    ))}
                                    {atsResult.matchedKeywords.length === 0 && (
                                      <span className="text-[9px] text-slate-600 italic">No direct matches scanned. Try quick-load samples above.</span>
                                    )}
                                  </div>
                                </div>

                                {/* Missing targets */}
                                {atsResult.missingKeywords.length > 0 && (
                                  <div>
                                    <span className="text-[8.5px] font-bold text-slate-500 uppercase block mb-1.5">Enhancement Keywords Suggested:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {atsResult.missingKeywords.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 py-0.5 px-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8.5px] font-mono">
                                          <Sparkles className="w-2.5 h-2.5" />
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Summary feedback write */}
                                <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-900 text-slate-300 font-sans text-[10.5px] leading-relaxed">
                                  <div className="font-mono text-[8px] text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    <span>Recruiter Alignment Memo:</span>
                                  </div>
                                  {atsResult.summary}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-10 space-y-3">
                              <FileText className="w-10 h-10 text-slate-700 mx-auto" />
                              <div className="text-xs font-bold text-slate-400">ATS Evaluation Deck Ready</div>
                              <p className="text-[10px] text-slate-500 font-sans max-w-sm mx-auto leading-normal">
                                Paste custom requirements or quick-load sample specs on the left to test Anup\'s exact credential alignment parameters.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SOUND SYNTH MIXER */}
                  {activeTab === 'synth' && (
                    <div className="space-y-6">
                      {/* Interactive visualizer */}
                      <RealOscilloscope isPlaying={synthPreset !== 'off'} isBrookPlaying={isBrookPlaying} />

                      {/* Hidden HTML5 Audio node for Brook One Piece Song */}
                      <audio
                        ref={brookAudioRef}
                        src="/32.mp3"
                        loop
                        onTimeUpdate={handleBrookTimeUpdate}
                        onLoadedMetadata={handleBrookLoadedMetadata}
                      />

                      {/* Soul King's Brook Player Card */}
                      <div className="p-5 rounded-2xl bg-[#090e24] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)] relative overflow-hidden flex flex-col md:flex-row gap-5 items-center">
                        {/* Left Side: Spinning Record vinyl or Brook's Avatar */}
                        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                          {/* Outer glowing ring */}
                          <div className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 ${isBrookPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`} />
                          
                          {/* Inner Vinyl Record disc */}
                          <div className={`w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center relative shadow-lg ${isBrookPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}>
                            {/* Groove lines */}
                            <div className="absolute inset-2 rounded-full border border-slate-900/40" />
                            <div className="absolute inset-4 rounded-full border border-slate-900/20" />
                            
                            {/* Center Label (Brook/One Piece Theme) */}
                            <div className="w-6 h-6 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
                              <span className="text-[10px] text-cyan-300 font-extrabold font-mono">☠</span>
                            </div>
                          </div>
                          
                          {/* Tone arm needle */}
                          <div className={`absolute top-0 right-1 w-6 h-10 origin-top-right transition-transform duration-500 ${isBrookPlaying ? 'rotate-12' : '-rotate-6'}`}>
                            <div className="w-[2px] h-8 bg-slate-400/80 mx-auto" />
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mx-auto -mt-1 shadow" />
                          </div>
                        </div>

                        {/* Middle/Right: Info & Player Controls */}
                        <div className="flex-1 w-full space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-mono font-bold tracking-wider uppercase">
                                  ACTIVE AUDIO CHANNEL
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {isBrookPlaying ? '• STREAMING LIVE' : '• CHANNEL STANDBY'}
                                </span>
                              </div>
                              <h3 className="text-sm font-extrabold text-white mt-1 select-none">
                                One Piece - Binks' Sake (Brook's Violin & Piano)
                              </h3>
                              <p className="text-[10px] text-slate-400 select-none">
                                Brook's signature melody - restored and loaded from root directory `/32.mp3`
                              </p>
                            </div>

                            {/* Play/Pause Button */}
                            <button
                              onClick={togglePlayBrook}
                              className={`p-3 rounded-full cursor-pointer transition-all flex items-center justify-center ${
                                isBrookPlaying
                                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:scale-105'
                                  : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:scale-105'
                              }`}
                            >
                              {isBrookPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                              ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>

                          {/* Progress bar seek slider */}
                          <div className="space-y-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="0.1"
                              value={brookProgress}
                              onChange={handleBrookProgressChange}
                              className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                              <span>{formatTime(brookCurrentTime)}</span>
                              <span className="text-[8.5px] italic text-cyan-500/60 font-sans">
                                {isBrookPlaying ? "Yo-ho-ho-ho, Yo-ho-ho-ho..." : 'Restored Stream Active'}
                              </span>
                              <span>{formatTime(brookDuration)}</span>
                            </div>
                          </div>

                          {/* Volume controls for Brook Song */}
                          <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-slate-900/60 max-w-xs">
                            <span className="text-[8.5px] text-slate-500 font-mono font-bold">SONG VOL:</span>
                            <input
                              type="range"
                              min="0"
                              max="1.0"
                              step="0.05"
                              value={brookVolume}
                              onChange={(e) => setBrookVolume(parseFloat(e.target.value))}
                              className="flex-1 accent-cyan-400 cursor-pointer h-1"
                            />
                            <span className="text-[9px] text-cyan-400 font-mono w-8 text-right">{Math.round(brookVolume * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Preset triggers & Volume */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch select-none">
                        {/* Audio presets selections */}
                        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900 flex flex-col justify-between">
                          <div className="space-y-3">
                            <span className="text-[8.5px] font-bold text-cyan-400 uppercase tracking-widest block">// Cinematic Presets</span>
                            <div className="space-y-1.5">
                              {[
                                { id: 'breeze' as const, label: '⚓ Sea Breeze Drone', desc: 'Triangle waves & ocean wind swells' },
                                { id: 'cyber' as const, label: '🦾 Cyberpunk Matrix Grid', desc: 'Resonant fast saw arpeggiator' },
                                { id: 'space' as const, label: '🌌 Stellar Minimal Delay', desc: 'Sine star bells with echo reflections' },
                                { id: 'off' as const, label: '🤫 Silent Workspace Mode', desc: 'Bypass all audio loops' }
                              ].map(track => (
                                <button
                                  key={track.id}
                                  onClick={() => {
                                    sound.playClick();
                                    setSynthPreset(track.id);
                                  }}
                                  className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all ${
                                    synthPreset === track.id
                                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                                      : 'bg-black/30 border-slate-900 text-slate-400 hover:bg-[#0b0f19]'
                                  }`}
                                >
                                  <div className="font-extrabold text-[10.5px] mb-0.5">{track.label}</div>
                                  <span className="text-[8px] text-slate-500 block">{track.desc}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Sliders manual synth configurations */}
                        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900 space-y-3.5">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">// Custom Synthesizer Parameters</span>
                          
                          {/* Master volume slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>VOLUME DECK MIX:</span>
                              <span>{Math.round(synthVolume * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1.0"
                              step="0.05"
                              value={synthVolume}
                              onChange={(e) => setSynthVolume(parseFloat(e.target.value))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>

                          {/* Oscillator shape select */}
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 block">OSCILLATOR SHAPE:</span>
                            <div className="grid grid-cols-4 gap-1">
                              {(['sine', 'triangle', 'sawtooth', 'square'] as OscillatorType[]).map(shape => (
                                <button
                                  key={shape}
                                  onClick={() => {
                                    sound.playClick();
                                    setSynthWave(shape);
                                  }}
                                  className={`py-1 text-[8.5px] uppercase font-bold border rounded cursor-pointer transition-all ${
                                    synthWave === shape 
                                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400' 
                                      : 'bg-black/30 border-slate-900 text-slate-500'
                                  }`}
                                >
                                  {shape}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Semitones Transposer slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>SEMITONES TRANSPOSER (PITCH):</span>
                              <span className="text-cyan-400 font-bold">{synthPitch > 0 ? `+${synthPitch}` : synthPitch}</span>
                            </div>
                            <input
                              type="range"
                              min="-12"
                              max="12"
                              step="1"
                              value={synthPitch}
                              onChange={(e) => setSynthPitch(parseInt(e.target.value))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>

                          {/* Filter cutoff slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>LOWPASS CUTOFF FREQUENCY:</span>
                              <span className="text-cyan-400 font-bold">{synthCutoff} Hz</span>
                            </div>
                            <input
                              type="range"
                              min="200"
                              max="3000"
                              step="50"
                              value={synthCutoff}
                              onChange={(e) => setSynthCutoff(parseInt(e.target.value))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Playable sound piano keys */}
                      <div className="p-4 rounded-2xl bg-[#040813] border border-slate-900 space-y-3 select-none">
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">// Manual Playable Pentatonic Pads</span>
                        <div className="grid grid-cols-7 gap-1.5 h-16">
                          {[
                            { note: 'C4', freq: 261.63 },
                            { note: 'D4', freq: 293.66 },
                            { note: 'E4', freq: 329.63 },
                            { note: 'G4', freq: 392.00 },
                            { note: 'A4', freq: 440.00 },
                            { note: 'C5', freq: 523.25 },
                            { note: 'D5', freq: 587.33 }
                          ].map(key => (
                            <button
                              key={key.note}
                              onClick={() => handleManualKeyClick(key.note, key.freq)}
                              className="h-full bg-slate-950 hover:bg-cyan-500/10 active:bg-cyan-500/25 border border-slate-900 hover:border-cyan-500/40 rounded-lg flex flex-col justify-between items-center p-2 cursor-pointer transition-all hover:scale-[1.02] shadow"
                            >
                              <span className="text-[7px] text-slate-600 font-mono">PITCH</span>
                              <span className="text-[10px] font-extrabold text-slate-300 font-sans tracking-tight">{key.note}</span>
                            </button>
                          ))}
                        </div>

                        {/* Interactive audio display text */}
                        <div className="p-2.5 rounded-xl bg-black/40 border border-slate-900 text-center text-[9.5px] text-slate-500 italic font-mono truncate">
                          {synthFeedbackMsg}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

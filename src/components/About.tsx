import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Cpu, 
  Gamepad2, 
  RotateCcw, 
  Play, 
  Pause, 
  Zap, 
  Shield, 
  Activity, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Terminal,
  Award
} from 'lucide-react';
import { PERSONAL_INFO, SKILL_CATEGORIES } from '../data';
import { sound, getProxyUrl } from '../utils';
import finalPhoto from '@/finalphoto.jpeg';
import luffyImage from '@/luffy 34.jpg';

interface AboutProps {
  // Empty, no longer needs uploader logic
}

const SKILL_ITEMS = [
  { name: 'Python', color: '#3776AB', icon: '🐍', xp: 150 },
  { name: 'LangChain', color: '#13C2C2', icon: '🦜', xp: 200 },
  { name: 'LangGraph', color: '#722ED1', icon: '🕸️', xp: 250 },
  { name: 'CrewAI', color: '#FA8C16', icon: '🤖', xp: 250 },
  { name: 'SQL', color: '#005C84', icon: '🗄️', xp: 120 },
  { name: 'NLP', color: '#EB2F96', icon: '🔤', xp: 180 },
  { name: 'Scikit-Learn', color: '#F7931E', icon: '📊', xp: 170 },
  { name: 'Pandas', color: '#150458', icon: '🐼', xp: 140 },
  { name: 'FastAPI', color: '#059669', icon: '⚡', xp: 190 },
  { name: 'Ollama', color: '#F1F5F9', icon: '🦙', xp: 220 }
];

const OBSTACLE_ITEMS = [
  { name: 'Merge Conflict', color: '#EF4444', label: '💥 Conflict', damage: 25 },
  { name: 'Runtime Exception', color: '#F59E0B', label: '⚡ Runtime Error', damage: 15 },
  { name: 'Data Leak', color: '#EC4899', label: '🚨 Data Leak', damage: 20 },
  { name: 'Plagiarism Alert', color: '#D97706', label: '⚠️ Plagiarism', damage: 10 }
];

export default function About({}: AboutProps) {
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(() => {
    return Number(localStorage.getItem('stack_game_highscore') || 4800);
  });
  const [integratedSkills, setIntegratedSkills] = useState<string[]>([]);
  const [shield, setShield] = useState(100);
  const [activeAbility, setActiveAbility] = useState<string | null>(null);
  const [abilityCooldowns, setAbilityCooldowns] = useState({
    shield: 0,
    beam: 0,
    assistant: 0
  });

  const [soundEnabled, setSoundEnabled] = useState(!sound.isMuted());

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Bot details
  const botRef = useRef({
    x: 400,
    y: 350,
    radius: 22,
    speed: 6,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    shieldActive: false,
    shieldTimer: 0
  });

  // Game arrays in useRef to bypass state re-renders (anti-lag!)
  const itemsRef = useRef<any[]>([]);
  const obstaclesRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
  const alertsRef = useRef<any[]>([]);
  const assistantsRef = useRef<any[]>([]);
  const laserBeamsRef = useRef<any[]>([]);
  const frameCountRef = useRef(0);

  // Sync highscore to localstorage
  useEffect(() => {
    localStorage.setItem('stack_game_highscore', String(highscore));
  }, [highscore]);

  // Ability cooldowner
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver) return;
    const interval = setInterval(() => {
      setAbilityCooldowns(prev => ({
        shield: Math.max(0, prev.shield - 1),
        beam: Math.max(0, prev.beam - 1),
        assistant: Math.max(0, prev.assistant - 1)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, isGameOver]);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setSoundEnabled(!isMuted);
    sound.playClick();
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.code)) {
        if (isPlaying && !isPaused && !isGameOver) {
          e.preventDefault(); // Stop page scroll
        }
      }
      keysRef.current[e.code] = true;
      keysRef.current[e.key] = true;

      // Quick triggers for abilities
      if (isPlaying && !isPaused && !isGameOver) {
        if (e.key === '1' || e.code === 'Digit1') activateShield();
        if (e.key === '2' || e.code === 'Digit2') activateBeam();
        if (e.key === '3' || e.code === 'Digit3') activateAssistant();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isPaused, isGameOver, abilityCooldowns]);

  // Main game loop initialization
  useEffect(() => {
    if (isPlaying && !isPaused && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, isPaused, isGameOver]);

  // Restart details
  const startGame = () => {
    sound.playSuccess();
    setScore(0);
    setShield(100);
    setIntegratedSkills([]);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);

    botRef.current = {
      x: 350,
      y: 300,
      radius: 22,
      speed: 6,
      color: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.65)',
      shieldActive: false,
      shieldTimer: 0
    };

    itemsRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
    alertsRef.current = [];
    assistantsRef.current = [];
    laserBeamsRef.current = [];
    frameCountRef.current = 0;

    // Spawn 3 starting skills immediately
    for (let i = 0; i < 3; i++) {
      spawnItem();
    }
  };

  const spawnItem = () => {
    const skill = SKILL_ITEMS[Math.floor(Math.random() * SKILL_ITEMS.length)];
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 700;
    const height = canvas ? canvas.height : 400;

    itemsRef.current.push({
      x: Math.random() * (width - 60) + 30,
      y: Math.random() * (height - 120) + 40,
      radius: 18,
      name: skill.name,
      color: skill.color,
      icon: skill.icon,
      xp: skill.xp,
      pulse: 0,
      pulseDir: 1
    });
  };

  const spawnObstacle = () => {
    const obs = OBSTACLE_ITEMS[Math.floor(Math.random() * OBSTACLE_ITEMS.length)];
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 700;

    obstaclesRef.current.push({
      x: Math.random() * (width - 80) + 40,
      y: -30,
      width: Math.random() * 30 + 50,
      height: 24,
      vy: Math.random() * 1.5 + 2, // Falling speed
      name: obs.name,
      color: obs.color,
      label: obs.label,
      damage: obs.damage
    });
  };

  const createExplosion = (x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015
      });
    }
  };

  const triggerAlert = (text: string, x: number, y: number, color: string) => {
    alertsRef.current.push({
      text,
      x,
      y,
      vy: -1.2,
      color,
      alpha: 1
    });
  };

  // Upgrades
  const activateShield = () => {
    if (abilityCooldowns.shield > 0 || !isPlaying || isPaused || isGameOver) return;
    sound.playTelemetry();
    botRef.current.shieldActive = true;
    botRef.current.shieldTimer = 300; // 5 seconds at 60fps
    setActiveAbility('RAG Force Shield Active!');
    setAbilityCooldowns(prev => ({ ...prev, shield: 12 })); // 12s cooldown

    // Clear nearby obstacles with flash wave
    setTimeout(() => {
      setActiveAbility(null);
    }, 2500);
  };

  const activateBeam = () => {
    if (abilityCooldowns.beam > 0 || !isPlaying || isPaused || isGameOver) return;
    sound.playTelemetry();
    const bot = botRef.current;
    
    // Shoot continuous neural beam upward
    laserBeamsRef.current.push({
      x: bot.x,
      y: bot.y,
      width: 14,
      height: bot.y,
      timer: 45 // ~0.75 seconds of beam active
    });

    setActiveAbility('LangChain Neural Laser!');
    setAbilityCooldowns(prev => ({ ...prev, beam: 8 })); // 8s cooldown

    setTimeout(() => {
      setActiveAbility(null);
    }, 1500);
  };

  const activateAssistant = () => {
    if (abilityCooldowns.assistant > 0 || !isPlaying || isPaused || isGameOver) return;
    sound.playTelemetry();
    
    // Summon CrewAI agent drones
    const bot = botRef.current;
    assistantsRef.current.push({
      x: bot.x - 40,
      y: bot.y,
      targetX: bot.x,
      targetY: bot.y,
      radius: 12,
      color: '#eab308',
      timer: 400 // Lives for ~7 seconds
    });
    assistantsRef.current.push({
      x: bot.x + 40,
      y: bot.y,
      targetX: bot.x,
      targetY: bot.y,
      radius: 12,
      color: '#a855f7',
      timer: 400
    });

    setActiveAbility('CrewAI Agents Summoned!');
    setAbilityCooldowns(prev => ({ ...prev, assistant: 15 })); // 15s cooldown

    setTimeout(() => {
      setActiveAbility(null);
    }, 3000);
  };

  // Continuous loop physics + graphics
  const gameLoop = () => {
    if (!canvasRef.current || isPaused || isGameOver) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background matrix grid elements subtly
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    frameCountRef.current++;

    // 1. Spawning strategy (Every X frames)
    if (frameCountRef.current % 110 === 0 && itemsRef.current.length < 5) {
      spawnItem();
    }
    if (frameCountRef.current % 85 === 0) {
      spawnObstacle();
    }

    // 2. Playable Bot Control / Movement logic
    const bot = botRef.current;
    let dx = 0;
    let dy = 0;

    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['KeyA']) dx = -1;
    if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['KeyD']) dx = 1;
    if (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['KeyW']) dy = -1;
    if (keysRef.current['ArrowDown'] || keysRef.current['s'] || keysRef.current['KeyS']) dy = 1;

    // Normalize velocity vector
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    bot.x += dx * bot.speed;
    bot.y += dy * bot.speed;

    // Boundaries containment
    bot.x = Math.max(bot.radius, Math.min(canvas.width - bot.radius, bot.x));
    bot.y = Math.max(bot.radius + 30, Math.min(canvas.height - bot.radius, bot.y));

    // Decaying shield timer
    if (bot.shieldActive) {
      bot.shieldTimer--;
      if (bot.shieldTimer <= 0) {
        bot.shieldActive = false;
      }
    }

    // 3. Update Assistants (CrewAI Agents)
    assistantsRef.current.forEach((as, i) => {
      as.timer--;
      
      // Orbit around commander bot
      const orbitSpeed = frameCountRef.current * 0.05 + (i * Math.PI);
      as.targetX = bot.x + Math.cos(orbitSpeed) * 55;
      as.targetY = bot.y + Math.sin(orbitSpeed) * 55;

      // Smooth lag dampening chase
      as.x += (as.targetX - as.x) * 0.15;
      as.y += (as.targetY - as.y) * 0.15;

      // Harvest skills automatically
      itemsRef.current.forEach((item, itemIdx) => {
        const dist = Math.hypot(item.x - as.x, item.y - as.y);
        if (dist < as.radius + item.radius) {
          integrateSkillNode(item, itemIdx);
        }
      });
    });
    // Remove dead assistants
    assistantsRef.current = assistantsRef.current.filter(as => as.timer > 0);

    // 4. Update Laser beams
    laserBeamsRef.current.forEach((beam) => {
      beam.timer--;
      beam.x = bot.x; // Keep anchored to bot
      beam.height = bot.y; // Keep shooting up to ceiling

      // Zap obstacles in column range
      obstaclesRef.current.forEach((obs, obsIdx) => {
        const leftBound = beam.x - beam.width / 2 - obs.width / 2;
        const rightBound = beam.x + beam.width / 2 + obs.width / 2;
        if (obs.x >= leftBound && obs.x <= rightBound && obs.y < beam.height) {
          createExplosion(obs.x, obs.y, obs.color, 12);
          triggerAlert('+50 Defended!', obs.x, obs.y, '#22c55e');
          setScore(prev => prev + 50);
          sound.playTelemetry();
          obstaclesRef.current.splice(obsIdx, 1);
        }
      });
    });
    laserBeamsRef.current = laserBeamsRef.current.filter(beam => beam.timer > 0);

    // 5. Update and Draw Collectible Skills Items
    itemsRef.current.forEach((item, index) => {
      // Magnetic pull to bot if RAG shield is active
      if (bot.shieldActive) {
        const distToBot = Math.hypot(bot.x - item.x, bot.y - item.y);
        if (distToBot < 180) {
          item.x += (bot.x - item.x) * 0.08;
          item.y += (bot.y - item.y) * 0.08;
        }
      }

      // Pulse animation logic
      item.pulse += 0.08 * item.pulseDir;
      if (item.pulse > 6) item.pulseDir = -1;
      if (item.pulse < 0) item.pulseDir = 1;

      // Draw item neon container
      ctx.shadowBlur = 15;
      ctx.shadowColor = item.color;
      ctx.fillStyle = `${item.color}15`;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      // Draw smooth hexagon or circular skill star
      ctx.arc(item.x, item.y, item.radius + item.pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Reset shadow for text efficiency
      ctx.shadowBlur = 0;

      // Draw skill icon text
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, item.x, item.y);

      // Draw hovering skills tag label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(item.name, item.x, item.y + item.radius + 15);

      // Collision check with playable Hero Bot
      const dist = Math.hypot(bot.x - item.x, bot.y - item.y);
      if (dist < bot.radius + item.radius) {
        integrateSkillNode(item, index);
      }
    });

    // Helper helper to handle item integration state
    function integrateSkillNode(item: any, idx: number) {
      sound.playSuccess();
      createExplosion(item.x, item.y, item.color, 15);
      triggerAlert(`+${item.xp} XP - Joined Stack!`, item.x, item.y - 12, '#22d3ee');
      
      setScore(prev => {
        const newScore = prev + item.xp;
        if (newScore > highscore) {
          setHighscore(newScore);
        }
        return newScore;
      });

      // Keep track of connected skills in the visual readout
      setIntegratedSkills(prev => {
        if (!prev.includes(item.name)) {
          return [...prev, item.name];
        }
        return prev;
      });

      // Erase and respawn items
      itemsRef.current.splice(idx, 1);
      spawnItem();
    }

    // 6. Update and Draw Threat Obstacles (Bugs/Exceptions)
    obstaclesRef.current.forEach((obs, index) => {
      obs.y += obs.vy;

      // Draw Bug container
      ctx.shadowBlur = 10;
      ctx.shadowColor = obs.color;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = obs.color;
      ctx.lineWidth = 1.5;

      // Retro pill layout
      ctx.beginPath();
      ctx.roundRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height, 6);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Text alert name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obs.label, obs.x, obs.y);

      // Bottom ceiling escape check
      if (obs.y > canvas.height + 40) {
        obstaclesRef.current.splice(index, 1);
        return;
      }

      // Direct Hero Bot Collision Check
      const dist = Math.hypot(bot.x - obs.x, bot.y - obs.y);
      if (dist < bot.radius + 16) {
        // Did we hit with a guard shield active?
        if (bot.shieldActive) {
          sound.playTelemetry();
          createExplosion(obs.x, obs.y, '#a855f7', 10);
          triggerAlert('BLOCKED RAG!', obs.x, obs.y, '#a855f7');
          setScore(prev => prev + 100);
        } else {
          // Normal direct hit
          sound.playGlitch();
          createExplosion(obs.x, obs.y, obs.color, 14);
          triggerAlert(`-${obs.damage} Shield!`, obs.x, obs.y - 15, '#f43f5e');

          setShield(prev => {
            const nextShield = Math.max(0, prev - obs.damage);
            if (nextShield <= 0) {
              setGameOverState();
            }
            return nextShield;
          });
        }
        // Remove hit threat
        obstaclesRef.current.splice(index, 1);
      }
    });

    function setGameOverState() {
      setIsGameOver(true);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    // 7. Update and Draw Helpers (CrewAI Assist)
    assistantsRef.current.forEach((as) => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = as.color;
      ctx.fillStyle = as.color;
      ctx.beginPath();
      ctx.arc(as.x, as.y, as.radius, 0, Math.PI * 2);
      ctx.fill();

      // Mini core ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(as.x, as.y, 6, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;

    // 8. Update and Draw Laser Beams
    laserBeamsRef.current.forEach((beam) => {
      const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, 0);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.7)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');

      ctx.shadowBlur = 20;
      ctx.shadowColor = '#06b6d4';
      ctx.fillStyle = gradient;
      
      // Laser core path
      ctx.fillRect(beam.x - beam.width / 2, 0, beam.width, beam.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(beam.x - 3, 0, 6, beam.height);
    });
    ctx.shadowBlur = 0;

    // 9. Update and Draw Floating Alerts
    alertsRef.current.forEach((al, index) => {
      al.y += al.vy;
      al.alpha -= 0.025;
      
      ctx.fillStyle = al.color;
      ctx.globalAlpha = Math.max(0, al.alpha);
      ctx.font = 'bold 11px monospace';
      ctx.fillText(al.text, al.x, al.y);
      ctx.globalAlpha = 1.0;

      if (al.alpha <= 0) {
        alertsRef.current.splice(index, 1);
      }
    });

    // 10. Update and Draw Particles physics
    particlesRef.current.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      if (p.alpha <= 0) {
        particlesRef.current.splice(index, 1);
      }
    });

    // 11. Draw Anup's AI Bot Agent
    ctx.shadowBlur = 25;
    ctx.shadowColor = bot.glowColor;
    ctx.fillStyle = bot.color;
    
    // Draw outer body structure
    ctx.beginPath();
    ctx.arc(bot.x, bot.y, bot.radius, 0, Math.PI * 2);
    ctx.fill();

    // Pulse action aura if force shielded
    if (bot.shieldActive) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bot.x, bot.y, bot.radius + 8 + Math.sin(frameCountRef.current * 0.15) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // Core Face Plate
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(bot.x - 14, bot.y - 10, 28, 16, 5);
    ctx.fill();

    // Glowing bot eyes based on score / state
    ctx.fillStyle = bot.shieldActive ? '#a855f7' : '#22d3ee';
    ctx.beginPath();
    ctx.arc(bot.x - 6, bot.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(bot.x + 6, bot.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Bottom propulsion flame
    const flameHeight = 8 + Math.sin(frameCountRef.current * 0.3) * 6;
    const gradFlame = ctx.createLinearGradient(bot.x, bot.y + bot.radius - 2, bot.x, bot.y + bot.radius + flameHeight);
    gradFlame.addColorStop(0, '#f43f5e');
    gradFlame.addColorStop(1, '#eab30800');
    ctx.fillStyle = gradFlame;
    ctx.beginPath();
    ctx.moveTo(bot.x - 8, bot.y + bot.radius - 2);
    ctx.lineTo(bot.x + 8, bot.y + bot.radius - 2);
    ctx.lineTo(bot.x, bot.y + bot.radius + flameHeight);
    ctx.closePath();
    ctx.fill();

    // Continuously recurse loop frame if parameters fit
    if (isPlaying && !isPaused && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  return (
    <section
      id="about"
      className="relative py-24 border-t border-slate-100/5 dark:border-white/[0.02]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-cyan-500 animate-spin-slow" />
            <span className="font-mono text-xs font-semibold tracking-widest text-cyan-500 dark:text-cyan-400 uppercase">
              // Interactive Stack Playground
            </span>
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
            Let's Play: Agent Stack Defender
          </h2>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-xl">
            Synthesize Anupkumar Koturwar's complete data science, machine learning & multi-agent AI stack! Pilot his helper AI bot, absorb code skills, and neutralize bugs in 60fps local rendering.
          </p>
        </div>

        {/* Dynamic Game Center Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Arcade Board Canvas Area (Col span 8) */}
          <div className="lg:col-span-8 flex flex-col justify-between p-5 rounded-3xl border border-slate-200 dark:border-cyan-500/15 bg-white dark:bg-slate-950/80 shadow-[0_15px_40px_rgba(6,182,212,0.04)] relative overflow-hidden backdrop-blur-xl">
            
            {/* Top Stat bars */}
            <div className="flex items-center justify-between gap-4 mb-4 z-10 flex-wrap">
              {/* Score visual block */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-cyan-400">Score Stack</span>
                  <span className="font-mono text-xl font-black text-slate-800 dark:text-white leading-none">
                    {score} <span className="text-[10px] text-emerald-400">XP</span>
                  </span>
                </div>
              </div>

              {/* Central Active Ability HUD */}
              {activeAbility && (
                <div className="px-3.5 py-1.5 rounded-full ring-1 ring-cyan-500/30 bg-cyan-950/45 text-cyan-300 font-mono text-[10px] uppercase font-bold animate-pulse flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>{activeAbility}</span>
                </div>
              )}

              {/* High Score Panel */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-purple-400">Personal Best</span>
                  <span className="font-mono text-base font-extrabold text-purple-600 dark:text-purple-400">
                    {highscore} XP
                  </span>
                </div>

                {/* Sound control */}
                <button
                  id="game-audio-toggle"
                  onClick={toggleSound}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-cyan-500/10 cursor-pointer transition-all"
                  title="Toggle Audio Feedback"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Shield and System Integrity Indicator */}
            <div className="w-full flex items-center gap-3 mb-4 select-none">
              <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-cyan-400 uppercase tracking-widest min-w-[70px]">
                Integrity:
              </span>
              <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-full border border-slate-200 dark:border-cyan-500/10 overflow-hidden p-[2px]">
                <div 
                  className={`h-full rounded-full transition-all duration-150 relative ${
                    shield > 50 
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' 
                      : shield > 25 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                      : 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                  }`}
                  style={{ width: `${shield}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 [background-size:10px_10px] animate-[pulse_1.5s_infinite]" />
                </div>
              </div>
              <span className="font-mono text-xs font-black text-slate-700 dark:text-white w-10 text-right">
                {shield}%
              </span>
            </div>

            {/* Core Game Container Canvas Board wrapper */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[440px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#060a12] overflow-hidden flex items-center justify-center">
              
              <canvas
                id="stack-defender-canvas"
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full block bg-gradient-to-b from-[#060a12] via-[#09101d] to-[#04080e]"
              />

              {/* Start Screen Game Overlays */}
              {!isPlaying && !isGameOver && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4 animate-bounce">
                    <Bot className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="font-sans text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    Agent Stack Defender
                  </h3>
                  <p className="font-sans text-xs text-slate-350 max-w-sm mt-2 leading-relaxed">
                    Pilot the autonomous AI Dev Agent using <span className="font-mono text-cyan-400 font-bold">WASD</span>, <span className="font-mono text-cyan-400 font-bold">Arrow Keys</span>, or the <span className="font-mono text-cyan-400 font-bold">Screen Joystick</span>. Clear threat bugs and pack your agent framework.
                  </p>

                  {/* High Score Banner */}
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase font-bold tracking-wider">
                    🏆 Highscore: {highscore} XP
                  </div>

                  <button
                    id="game-start-btn"
                    onClick={startGame}
                    className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-sans text-sm font-bold uppercase tracking-widest mt-6 duration-200 transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Deploy Engine</span>
                  </button>
                </div>
              )}

              {/* Game Over Screen */}
              {isGameOver && (
                <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-24 h-24 rounded-full bg-slate-900 border border-red-500 flex items-center justify-center mb-5 overflow-hidden relative shadow-2xl shadow-red-500/30">
                    <img 
                      src={luffyImage}
                      alt="Luffy Cheering"
                      className="w-full h-full object-cover scale-110 animate-[bounce_1.5s_infinite]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-sans text-2xl font-black text-white uppercase tracking-tight">
                    Compilation Aborted
                  </h3>
                  <p className="font-sans text-xs text-slate-300 max-w-xs mt-2 leading-relaxed">
                    Bugs and exceptions overwhelmed your system. You successfully integrated <span className="font-bold text-cyan-400">{integratedSkills.length}</span> of Anup's core skills!
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="block font-mono text-[8px] uppercase text-slate-400">Your XP score</span>
                      <span className="font-mono text-lg font-black text-cyan-400">{score}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="block font-mono text-[8px] uppercase text-slate-400">All-Time High</span>
                      <span className="font-mono text-lg font-black text-purple-400">{highscore}</span>
                    </div>
                  </div>

                  <button
                    id="game-restart-btn"
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-200 font-sans text-sm font-bold uppercase tracking-wider mt-7 duration-150 transform active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Run Clean Build</span>
                  </button>
                </div>
              )}

              {/* On-Screen Touch Vector Controls for Mobile and mouse pointers */}
              {isPlaying && !isGameOver && !isPaused && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none md:hidden">
                  
                  {/* Skill Abilities trigger suite */}
                  <div className="flex gap-2.5 pointer-events-auto">
                    {/* Abili 1 */}
                    <button
                      id="touch-ability-shield"
                      onClick={activateShield}
                      disabled={abilityCooldowns.shield > 0}
                      className="w-11 h-11 rounded-full bg-black/50 border border-cyan-500/30 flex flex-col items-center justify-center text-cyan-400 active:scale-90 disabled:opacity-45 backdrop-blur-md cursor-pointer pointer-events-auto"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="text-[7px] font-mono font-black mt-0.5">{abilityCooldowns.shield || 'RAG'}</span>
                    </button>

                    {/* Abili 2 */}
                    <button
                      id="touch-ability-beam"
                      onClick={activateBeam}
                      disabled={abilityCooldowns.beam > 0}
                      className="w-11 h-11 rounded-full bg-black/50 border border-violet-500/30 flex flex-col items-center justify-center text-violet-400 active:scale-90 disabled:opacity-45 backdrop-blur-md cursor-pointer pointer-events-auto"
                    >
                      <Zap className="w-4 h-4" />
                      <span className="text-[7px] font-mono font-black mt-0.5">{abilityCooldowns.beam || 'L.C.'}</span>
                    </button>

                    {/* Abili 3 */}
                    <button
                      id="touch-ability-agent"
                      onClick={activateAssistant}
                      disabled={abilityCooldowns.assistant > 0}
                      className="w-11 h-11 rounded-full bg-black/50 border border-yellow-500/30 flex flex-col items-center justify-center text-yellow-500 active:scale-90 disabled:opacity-45 backdrop-blur-md cursor-pointer pointer-events-auto"
                    >
                      <Bot className="w-4 h-4" />
                      <span className="text-[7px] font-mono font-black mt-0.5">{abilityCooldowns.assistant || 'CREW'}</span>
                    </button>
                  </div>

                  {/* Interactive floating instructions */}
                  <span className="font-mono text-[8px] text-slate-400 bg-black/40 px-2 py-1 rounded">
                    Move using Cursor Drag or Arrow Keys
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Active Skill Hotkey HUD */}
            {isPlaying && !isGameOver && (
              <div className="hidden md:grid grid-cols-3 gap-3.5 mt-4 z-10 select-none">
                {/* Shield Ability */}
                <button
                  id="hotkey-shield"
                  onClick={activateShield}
                  disabled={abilityCooldowns.shield > 0}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-cyan-500/5 active:scale-98 transition-all relative text-left disabled:opacity-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-none">RAG Force-Shield</span>
                    <span className="font-mono text-[8px] text-slate-400 mt-1">Suck in skills & block damage</span>
                  </div>
                  <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 font-mono text-[8px] font-bold text-slate-600 dark:text-slate-350">
                    {abilityCooldowns.shield > 0 ? `${abilityCooldowns.shield}s` : 'Key 1'}
                  </span>
                </button>

                {/* Laser Beam Ability */}
                <button
                  id="hotkey-beam"
                  onClick={activateBeam}
                  disabled={abilityCooldowns.beam > 0}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-violet-500/5 active:scale-98 transition-all relative text-left disabled:opacity-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-none">LangChain Laser</span>
                    <span className="font-mono text-[8px] text-slate-400 mt-1">Shoot upward neural column</span>
                  </div>
                  <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 font-mono text-[8px] font-bold text-slate-600 dark:text-slate-350">
                    {abilityCooldowns.beam > 0 ? `${abilityCooldowns.beam}s` : 'Key 2'}
                  </span>
                </button>

                {/* CrewAI Assist Ability */}
                <button
                  id="hotkey-crew"
                  onClick={activateAssistant}
                  disabled={abilityCooldowns.assistant > 0}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-yellow-500/5 active:scale-98 transition-all relative text-left disabled:opacity-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-none">CrewAI Drones</span>
                    <span className="font-mono text-[8px] text-slate-400 mt-1">Summon bots to auto-harvest</span>
                  </div>
                  <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 font-mono text-[8px] font-bold text-slate-600 dark:text-slate-350">
                    {abilityCooldowns.assistant > 0 ? `${abilityCooldowns.assistant}s` : 'Key 3'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Visual Skill Readout and Resume HUD (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Real-time Integrated Skills Dashboard */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-900/15 backdrop-blur-xl flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold tracking-widest text-cyan-500 dark:text-cyan-400 uppercase">
                    // Stack Node Sync Readout
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {integratedSkills.length} / {SKILL_ITEMS.length} Connected
                  </span>
                </div>

                <h3 className="font-sans text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                  Skills Framework
                </h3>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Collect skill items inside the arcade to integrate them into Anupkumar's active system deployment list below!
                </p>

                {/* Skill Item badges with integration state */}
                <div className="grid grid-cols-2 gap-2.5 mt-5">
                  {SKILL_ITEMS.map((item) => {
                    const isIntegrated = integratedSkills.includes(item.name);
                    return (
                      <div
                        key={item.name}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                          isIntegrated
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-800 dark:text-white font-bold scale-[1.02] shadow-[0_0_10px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                            : 'bg-white dark:bg-slate-900/30 border-slate-200 dark:border-white/[0.03] text-slate-450 dark:text-slate-400'
                        }`}
                      >
                        {/* Shimmer glowing dot indicator */}
                        <div 
                          className={`w-2 h-2 rounded-full absolute top-2 right-2 ${
                            isIntegrated ? 'bg-cyan-400 animate-pulse' : 'bg-slate-200 dark:bg-slate-850'
                          }`}
                        />
                        <span className="text-sm select-none">{item.icon}</span>
                        <span className="font-sans text-[10px] tracking-wide truncate">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bot Character Info block */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.04]">
                <div className="flex items-center gap-4">
                  {/* Miniature bot layout */}
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white relative shadow-lg shadow-cyan-500/15 overflow-hidden group/mini select-none"
                  >
                    <img 
                      src={finalPhoto} 
                      alt={PERSONAL_INFO.name} 
                      className="w-full h-full object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400";
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[6px] text-white">●</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-sans text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Anupkumar Koturwar</span>
                    <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 dark:text-cyan-400 uppercase mt-0.5 leading-none">AI Agent Lead Developer</span>
                    <span className="font-sans text-[10px] text-slate-400 mt-1 lines-clamp-2 leading-none">IEEE Otcon NLP Publisher</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Resume & Credentials callout card */}
            <div className="p-6 rounded-3xl border border-dashed border-cyan-500/25 bg-cyan-500/[0.02] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none -z-10" />
              <div>
                <div className="flex items-center gap-2 text-cyan-500 mb-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Verified Portfolio Profile</span>
                </div>
                <h4 className="font-sans text-base font-extrabold text-slate-900 dark:text-white uppercase">Looking to Hire a Data Scientist?</h4>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Get the verified credentials, publications, and skills record in standard resume format.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <a
                  id="about-card-resume"
                  href={PERSONAL_INFO.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-sans text-xs font-extrabold uppercase tracking-widest active:scale-95 duration-200 cursor-pointer shadow-md"
                >
                  Download CV
                </a>
                <a
                  id="about-card-linkedin"
                  href={PERSONAL_INFO.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-250 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-sans text-xs font-semibold transition-all duration-200 cursor-pointer border border-slate-205 dark:border-white/[0.04]"
                >
                  LinkedIn
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

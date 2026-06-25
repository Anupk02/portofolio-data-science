import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Ship, Navigation, Globe, Map, Anchor, ShieldCheck, Star, Sparkles, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { sound } from '../utils';
import pngegg0 from '@/pngegg.png';
import pngegg1 from '@/pngegg (1).png';
import pngegg2 from '@/pngegg (2).png';
import pngegg3 from '@/pngegg (3).png';
import pngegg4 from '@/pngegg (4).png';
import pngegg5 from '@/pngegg (5).png';
import pngegg6 from '@/pngegg (6).png';
import thousandSunnyImage from '@/Thousand-Sunny-One-Piece-464.png';

interface Destination {
  id: string;
  name: string;
  classification: string;
  coords: { x: number; y: number }; // Percentage coords on our visual map box
  description: string;
  hyperlink?: string;
  isGrandLineOnly: boolean;
  dossierType: 'portfolio' | 'credentials' | 'github' | 'linkedin' | 'email';
  image: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: 'hyderabad',
    name: 'Hyderabad Port',
    classification: 'The New World Base',
    coords: { x: 58, y: 55 },
    description: 'Anup\'s primary command dock. Stationed here as an expert in Multi-Agent systems, deep learning optimizations, and full-stack AI development.',
    isGrandLineOnly: false,
    dossierType: 'portfolio',
    image: pngegg1
  },
  {
    id: 'water7',
    name: 'Water 7 (IEEE Hub)',
    classification: 'Shipwright & Research Guild',
    coords: { x: 28, y: 35 },
    description: 'Anup\'s published IEEE Xplore Digital Library research guild. Excellent core algorithm architecture and deep language vector design engineering.',
    hyperlink: 'https://ieee.org', // Stand-in for paper links
    isGrandLineOnly: true,
    dossierType: 'credentials',
    image: pngegg2
  },
  {
    id: 'wano',
    name: 'Wano Country (GitHub)',
    classification: 'Ironworks & Agent Repos',
    coords: { x: 74, y: 24 },
    description: 'Lethal open-source code repositories including autonomous DevOps AI networks, CrewAI agents, and local RAG neural preprocessors.',
    hyperlink: 'https://github.com/Anupk02',
    isGrandLineOnly: false,
    dossierType: 'github',
    image: pngegg3
  },
  {
    id: 'egghead',
    name: 'Egghead (Ollama Lab)',
    classification: 'Future Tech & LLM Lab',
    coords: { x: 88, y: 44 },
    description: 'The laboratory of the future: localized model optimization, fine-tuning sequence weights, and scaling distributed agentic swarms.',
    isGrandLineOnly: true,
    dossierType: 'portfolio',
    image: pngegg4
  },
  {
    id: 'sabaody',
    name: 'Sabaody (LinkedIn Node)',
    classification: 'Premium Global Concourse',
    coords: { x: 42, y: 72 },
    description: 'Liaison sector for recruiters, senior stakeholders, and engineering executives globally looking for high-tier Data Scientists.',
    hyperlink: 'https://linkedin.com/in/anupkoturwar',
    isGrandLineOnly: false,
    dossierType: 'linkedin',
    image: pngegg5
  },
  {
    id: 'skypiea',
    name: 'Skypiea (Cloud Server)',
    classification: 'Cloud Storage & Cloud Run',
    coords: { x: 12, y: 68 },
    description: 'Sovereign cloud-native territory. High scalability node handling automatic scaling, containerized ingress, and state hosting.',
    isGrandLineOnly: true,
    dossierType: 'portfolio',
    image: pngegg6
  }
];

export default function NauticalLogPoseMap() {
  const [mapMode, setMapMode] = useState<'standard' | 'grandline'>('grandline');
  const [selectedDest, setSelectedDest] = useState<Destination>(DESTINATIONS[0]);
  const [currentShipPos, setCurrentShipPos] = useState({ x: 58, y: 55 });
  const [isSailing, setIsSailing] = useState(false);
  const [sailProgress, setSailProgress] = useState(0);
  const [logPoseDegree, setLogPoseDegree] = useState(0);
  const [poseClash, setPoseClash] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const shipAnimationRef = useRef<number | null>(null);
  const spinAnimationRef = useRef<number | null>(null);

  // Trigger sound sequence on load and clean up any ongoing animation frames on unmount
  useEffect(() => {
    sound.playTelemetry();
    return () => {
      if (shipAnimationRef.current) cancelAnimationFrame(shipAnimationRef.current);
      if (spinAnimationRef.current) cancelAnimationFrame(spinAnimationRef.current);
    };
  }, []);

  // Set sail animation loop using requestAnimationFrame
  const handleSetSail = (dest: Destination) => {
    if (isSailing) return;
    sound.playClick();
    setIsSailing(true);
    setSailProgress(0);

    const startX = currentShipPos.x;
    const startY = currentShipPos.y;
    const targetX = dest.coords.x;
    const targetY = dest.coords.y;

    const duration = 2400; // 2.4 seconds cruise speed
    let startTime: number | null = null;

    // Fast wobbling spin of log pose to lock on target
    setIsSpinning(true);
    setPoseClash(true);
    
    // Play multiple click effects as ship starts sailing
    setTimeout(() => sound.playTelemetry(), 400);

    const animateSail = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic-bezier sailing acceleration/deceleration
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const nextX = startX + (targetX - startX) * ease;
      const nextY = startY + (targetY - startY) * ease;

      setCurrentShipPos({ x: nextX, y: nextY });
      setSailProgress(Math.floor(progress * 100));

      // Direct log pose towards target degree with slight wobble noise
      const deltaX = targetX - startX;
      const deltaY = targetY - startY;
      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
      angle += Math.sin(progress * Math.PI * 10) * 15; // Log Pose magnetic wobble!
      setLogPoseDegree(angle);

      if (progress < 1) {
        shipAnimationRef.current = requestAnimationFrame(animateSail);
      } else {
        setIsSailing(false);
        setIsSpinning(false);
        setPoseClash(false);
        setSelectedDest(dest);
        sound.playSuccess();
        // Recenter degree precisely
        setLogPoseDegree(Math.atan2(targetY - startY, targetX - startX) * (180 / Math.PI) + 90);
      }
    };

    shipAnimationRef.current = requestAnimationFrame(animateSail);
  };

  const handleSpinLogPose = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sound.playGlitch();
    
    let duration = 1200;
    let startTime = Date.now();
    
    const spin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Infinite rotate decelerating
      const ease = 1 - Math.pow(1 - progress, 3);
      setLogPoseDegree(prevState => prevState + (45 * (1 - progress)));
      
      if (progress < 1) {
        spinAnimationRef.current = requestAnimationFrame(spin);
      } else {
        setIsSpinning(false);
        // Lock back to point to Hyderabad core workspace
        const dy = selectedDest.coords.y - currentShipPos.y;
        const dx = selectedDest.coords.x - currentShipPos.x;
        const finalAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        setLogPoseDegree(finalAngle);
        sound.playSuccess();
      }
    };
    
    spinAnimationRef.current = requestAnimationFrame(spin);
  };

  // Filter destinations depending on map standard or Grand Line mode selection
  const visibleDestinations = DESTINATIONS.filter(d => {
    if (mapMode === 'standard') return !d.isGrandLineOnly;
    return true; // Show everything in Grand Line tactical view
  });

  return (
    <div id="nautical-nav-sector" className="relative p-6 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden max-w-6xl mx-auto my-16">
      {/* Visual map neon coordinates grid background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_45%)]" />
      <div className="absolute inset-5 border border-dashed border-cyan-500/10 rounded-2xl pointer-events-none select-none" />

      {/* Title Header with thematic sub-labels */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08] mb-8 select-none">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-[9px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>Grand Line Navigation Module</span>
          </div>
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <h2 className="font-sans text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              LOG POSE CARTOGRAPHY
            </h2>
            <img 
              src={pngegg0} 
              alt="Straw Hat Crest Logo" 
              className="h-10 sm:h-14 object-contain opacity-100 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
          <p className="font-mono text-[10px] text-slate-400 mt-1 max-w-xl">
            Live-telemetry sea chart mapping Anupkumar\'s central Hyderabad workspace to critical digital hubs. Set sail to explore core repo logs.
          </p>
        </div>

        {/* Map grid toggle controller */}
        <div className="flex bg-slate-900 border border-white/[0.06] p-1 rounded-xl shrink-0 self-start md:self-center font-mono text-[10px] uppercase font-bold">
          <button
            onClick={() => {
              setMapMode('standard');
              sound.playClick();
              // Reset selection if not visible
              if (selectedDest.isGrandLineOnly) {
                setSelectedDest(DESTINATIONS[0]);
                setCurrentShipPos({ x: DESTINATIONS[0].coords.x, y: DESTINATIONS[0].coords.y });
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              mapMode === 'standard' 
                ? 'bg-cyan-500 text-slate-950' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Standard Earth</span>
          </button>
          <button
            onClick={() => {
              setMapMode('grandline');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              mapMode === 'grandline' 
                ? 'bg-cyan-500 text-slate-950' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Grand Line View</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content - Map Visualizer + Log Pose Deck Panel */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column (Main Dynamic Cartographic Canvas Board Area) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-[16/10] w-full rounded-2xl bg-[#090d14] border border-white/[0.05] overflow-hidden group select-none shadow-inner">
            
            {/* Authentic Ancient Parchment Seachart Grid Overlay (Vector style) */}
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            {/* Real Grand Line World Map Background from One Piece (CSS High-tech Coordinate Overlay) */}
            {mapMode === 'grandline' && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_70%)] opacity-80 pointer-events-none transition-opacity duration-500">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-500/10 rounded-full animate-[ping_4s_ease-out_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-cyan-500/5 rounded-full" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060a12]/70 to-[#03060a] pointer-events-none" />
            
            {/* Draw Red Line & Grand Line guide lines in Grand Line Mode */}
            {mapMode === 'grandline' && (
              <>
                {/* Red Line block */}
                <div className="absolute left-[35%] top-0 bottom-0 w-[8%] bg-gradient-to-r from-red-950/20 via-red-900/10 to-red-950/20 border-l border-r border-red-500/15 pointer-events-none" />
                <div className="absolute left-[39%] top-[40%] transform -translate-x-1/2 -rotate-90 select-none font-mono text-[8px] font-bold text-red-500/40 uppercase tracking-[0.25em]">
                  The Red Line
                </div>

                {/* Grand Line Lane */}
                <div className="absolute top-[48%] bottom-[42%] left-0 right-0 border-t border-b border-dashed border-cyan-500/20 [background:linear-gradient(rgba(6,182,212,0.03),transparent,rgba(6,182,212,0.03))] pointer-events-none" />
                <div className="absolute right-6 top-[44%] font-mono text-[7px] font-medium text-cyan-400/50 uppercase tracking-[0.3em]">
                  The Grand Line Equator Sector
                </div>
              </>
            )}

            {/* Custom Compass Rose decorative illustration containing the Jolly Roger */}
            <div className="absolute bottom-6 right-6 w-24 h-24 opacity-50 border-2 border-dashed border-cyan-400/55 rounded-full flex items-center justify-center animate-[spin_50s_linear_infinite] pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <img 
                src={pngegg0} 
                alt="Straw Hat Jolly Roger" 
                className="w-16 h-16 object-contain opacity-90"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>

            {/* Render sailing lines from shipyard */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Dynamic trajectory trace vector line to current target location */}
              {isSailing && (
                <path
                  d={`M ${(currentShipPos.x / 100) * 100}% ${(currentShipPos.y / 100) * 100}% L ${(selectedDest.coords.x / 100) * 100}% ${(selectedDest.coords.y / 100) * 100}%`}
                  className="stroke-cyan-400/30 stroke-[1.5] stroke-dasharray-[4,4] fill-none"
                  style={{ strokeDasharray: '5,5' }}
                />
              )}
              {/* Static shipping lanes between active nodes */}
              {visibleDestinations.map((d, i) => {
                if (i === 0) return null;
                const prev = visibleDestinations[i - 1];
                return (
                  <line
                    key={d.id}
                    x1={`${prev.coords.x}%`}
                    y1={`${prev.coords.y}%`}
                    x2={`${d.coords.x}%`}
                    y2={`${d.coords.y}%`}
                    className="stroke-[#10b981]/10 stroke-[0.75] stroke-dasharray-[3,6] fill-none"
                  />
                );
              })}
            </svg>

            {/* Interactive Destination Nodes on Map */}
            {visibleDestinations.map((dest) => {
              const isActive = selectedDest.id === dest.id;
              
              return (
                <button
                  key={dest.id}
                  onClick={() => {
                    if (isSailing) return;
                    handleSetSail(dest);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center group/node transition-all duration-300 z-10 cursor-pointer"
                  style={{ left: `${dest.coords.x}%`, top: `${dest.coords.y}%` }}
                >
                  {/* Glowing core lighthouse beacon */}
                  <div className="relative flex items-center justify-center">
                    {/* Ripple pulse ring for selected target */}
                    {isActive && (
                      <span className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-cyan-400/25 opacity-75" />
                    )}
                    
                    {/* Node Dot / Island Avatar */}
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden ${
                      isActive 
                        ? 'bg-cyan-500/30 border-cyan-400 scale-125 shadow-[0_0_16px_rgba(6,182,212,0.6)]' 
                        : 'bg-slate-900/90 border-slate-700 group-hover/node:bg-cyan-500/20 group-hover/node:border-cyan-500/70 group-hover/node:scale-110 shadow-md shadow-black/50'
                    }`}>
                      <img 
                        src={dest.image}
                        alt={dest.name}
                        className="w-11 h-11 object-contain transform group-hover/node:scale-110 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
 
                    {/* Highly polished thematic anchor/lighthouse indicator tag */}
                    <div className={`absolute top-[108%] mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 border px-2 py-1 rounded-lg shadow-xl text-center transition-all duration-200 pointer-events-none select-none z-30 ${
                      isActive 
                        ? 'opacity-100 scale-105 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]' 
                        : 'opacity-0 scale-95 group-hover/node:opacity-100 group-hover/node:scale-100 border-white/[0.06] group-hover/node:border-cyan-500/40'
                    }`}>
                      <div className="font-sans text-[9px] font-extrabold text-white tracking-wide">
                        {dest.name}
                      </div>
                      <div className="font-mono text-[7px] text-cyan-400 font-bold tracking-wider uppercase mt-0.5">
                        {dest.classification}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Thousand Sunny Ship Visual Representation sailing */}
            <div
              className={`absolute transition-all duration-100 ease-linear z-20 pointer-events-none`}
              style={{
                left: `${currentShipPos.x}%`,
                top: `${currentShipPos.y}%`,
                transform: 'translate(-51%, -51%)'
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Iridescent water wake foam bubble wave */}
                <span className="absolute w-12 h-12 rounded-full bg-cyan-500/15 border border-cyan-400/30 scale-125 animate-pulse" />
                {isSailing && (
                  <span className="absolute animate-ping inline-flex h-16 w-16 rounded-full bg-[#10b981]/20 opacity-80" />
                )}

                {/* Detailed sailing ship symbol (Thousand Sunny!) */}
                <div className={`p-1.5 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] flex items-center justify-center ${
                  isSailing ? 'animate-[bounce_0.8s_infinite]' : ''
                }`}>
                  <img 
                    src={thousandSunnyImage}
                    alt="Thousand Sunny"
                    className="w-14 h-14 object-contain transform rotate-[-5deg] scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>

                {/* Speed/Direction visual indicator hook */}
                {isSailing && (
                  <div className="absolute -top-7 whitespace-nowrap font-mono text-[7px] font-bold text-cyan-400 bg-slate-950 border border-cyan-500/30 px-1.5 py-0.5 rounded leading-none select-none">
                    CRUISING SPEED: {sailProgress}%
                  </div>
                )}
              </div>
            </div>

            {/* Map metadata coordinate telemetry bar */}
            <div className="absolute bottom-3 left-4 flex gap-4 font-mono text-[7.5px] text-slate-500 font-bold tracking-widest pointer-events-none select-none">
              <span>LAT: {currentShipPos.y.toFixed(2)}\'\' N</span>
              <span>LON: {currentShipPos.x.toFixed(2)}\'\' E</span>
              <span>CALC: SHIELD_OS_{mapMode.toUpperCase()}</span>
            </div>
          </div>

          {/* Quick instructions bar for sea navigation */}
          <div className="rounded-xl border border-white/[0.04] bg-slate-900/30 px-4 py-2.5 flex items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <p className="font-sans text-[10px] text-slate-500">
                <strong className="text-slate-350">Tactical Directive:</strong> Click on any coordinate point/island on the grid to direct and sail the Thousand Sunny towards it.
              </p>
            </div>
            {isSailing && (
              <span className="font-mono text-[9px] text-[#10b981] font-bold bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/25 animate-pulse shrink-0">
                TRANSIT_ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Right Column (Dynamic Log Pose Compass + Active Destination Cabin Details) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active Log Pose Multi-Axis Compass Device Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group select-none shadow-md">
            {/* Soft grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.02),transparent_70%)]" />

            <div className="flex items-center justify-between w-full mb-3 shrink-0">
              <span className="font-mono text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                LOG POSE SENSOR
              </span>
              <button
                onClick={handleSpinLogPose}
                disabled={isSpinning}
                className="p-1 rounded bg-white/[0.02] border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 font-mono text-[8px] font-bold uppercase tracking-widest disabled:opacity-40 transition-all cursor-pointer"
              >
                Spin Globe
              </button>
            </div>

            {/* Physical-style Gyroscopic compass container */}
            <div className="relative w-36 h-36 border border-white/[0.05] rounded-full flex items-center justify-center p-3 my-2 shadow-inner bg-slate-950">
              
              {/* Outer gimbal line ring */}
              <div className="absolute inset-2 border border-cyan-500/10 rounded-full animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-4 border border-dashed border-teal-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              
              {/* Transparent glass dome frame with subtle glossy reflections */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.015] to-white/[0.08] rounded-full pointer-events-none border border-white/[0.1] z-30" />

              {/* Rotating Magnetic Compass Arrow needle */}
              <div
                className="relative w-full h-full flex items-center justify-center z-10 transition-transform duration-300 ease-out"
                style={{ transform: `rotate(${logPoseDegree}deg)` }}
              >
                {/* Pointer pointer with high contrast red and cyan anchor ends */}
                <div className="absolute top-[10%] bottom-[10%] w-0.5 bg-gradient-to-b from-red-500 via-cyan-400/60 to-cyan-500 flex items-center justify-center">
                  {/* Top needle head arrow */}
                  <div className="absolute top-0 w-2 h-2 bg-red-400 rotate-45 border border-red-600 rounded-sm -translate-y-1/2 shadow-lg" />
                  {/* Bottom balancing tip */}
                  <div className="absolute bottom-0 w-2 h-2 bg-cyan-400 rotate-45 border border-cyan-600 rounded-sm translate-y-1/2 shadow-lg" />
                </div>

                {/* Embedded pirate anchor / logpose coordinate core circle */}
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-400/40 flex items-center justify-center shadow-lg transform -rotate-45 z-20">
                  <Anchor className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              {/* Glowing active lock indicator on compass card */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className={`w-1.5 h-1.5 rounded-full ${poseClash ? 'bg-red-500 animate-ping' : 'bg-[#10b981]'} `} />
                <span className="font-mono text-[7px] text-slate-500 font-bold mt-0.5 tracking-widest">N</span>
              </div>
            </div>

            {/* Compass status telemetry reading */}
            <div className="mt-2 text-center select-none">
              <div className="font-sans text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5 justify-center">
                <Anchor className="w-3.5 h-3.5 text-[#10b981]" />
                <span>MAGNETIC LOCK LOCKED</span>
              </div>
              <p className="font-mono text-[8px] text-slate-400 mt-1 uppercase tracking-widest">
                Target Lock: {selectedDest.name}
              </p>
            </div>
          </div>

          {/* Cabin Crew Diary / Selected Target Dossier details card */}
          <div className="flex-1 rounded-2xl border border-white/[0.06] bg-slate-900/30 p-5 flex flex-col justify-between relative overflow-hidden group shadow-md min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 pb-3.5 border-b border-white/[0.05] select-none">
                <BookOpen className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
                <span className="font-mono text-[9px] font-bold tracking-wider text-[#10b981] uppercase">
                  Log Cabin Logbook
                </span>
              </div>

              <div className="mt-4">
                <span className="font-mono text-[8.5px] font-bold text-[#10b981] uppercase bg-emerald-500/10 border border-[#10b981]/15 px-2 py-0.5 rounded inline-block mb-2 select-none">
                  {selectedDest.classification}
                </span>
                
                <h3 className="font-sans text-xl font-bold text-white uppercase tracking-tight">
                  {selectedDest.name}
                </h3>

                <p className="font-sans text-xs text-slate-400 leading-relaxed mt-2.5">
                  {selectedDest.description}
                </p>
              </div>
            </div>

            {/* Call to Action anchor to visit repositories or external targets */}
            {selectedDest.hyperlink && (
              <div className="mt-6 pt-4 border-t border-white/[0.05]">
                <a
                  href={selectedDest.hyperlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playSuccess()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all duration-200 cursor-pointer hover:shadow-[0_4px_15px_rgba(6,182,212,0.3)] active:scale-95"
                >
                  <span>Sail Into Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

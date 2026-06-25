import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, RefreshCw, Bot, Sparkles, User, HelpCircle, CornerDownLeft, Volume2, VolumeX, Compass } from 'lucide-react';
import { sound } from '../utils';
import luffyImage from '@/luffy 34.jpg';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const CONVERSATION_STARTERS = [
  { label: '🤖 Tell me about DevOps Agent Platform', query: 'Tell me about your Autonomous DevOps AI Platform.' },
  { label: '🔍 Explain Patent Intelligence', query: 'What is your AI Research & Patent Intelligence Platform about?' },
  { label: '🧠 What are your core AI skills?', query: 'What are your core Machine Learning & Agentic AI skills?' },
  { label: '📰 Tell me about your IEEE paper', query: 'Tell me about your peer-reviewed published paper in IEEE.' },
  { label: '🎓 Where did you study?', query: 'Can you summarize your education history and background?' },
  { label: '💼 How can I hire or contact you?', query: 'I would like to hire or contact you. What are the best ways?' }
];

const NAMI_STARTERS = [
  { label: '🗺️ Map our next journey!', query: 'Nami, describe the travel locations on the Log Pose Map!' },
  { label: '💰 Show me the Career Treasure!', query: 'Nami, where are the secret achievements and career treasures hidden?' },
  { label: '🍊 Tell me about Anup-kun\'s bounty!', query: 'What is candidate Anup-kun\'s professional coding bounty value?' }
];

const INTERVIEW_STARTERS = [
  { label: '🔥 Why should we hire Anup?', query: 'Why should we hire Anup over other candidates?' },
  { label: '🧠 Explain Plagiarism project', query: 'Describe Anup\'s Plagiarism Detector and its advanced ML architecture.' },
  { label: '⚡ What technology has he used?', query: 'Provide a breakdown of the specific languages, databases, and AI frameworks Anup has mastered.' },
  { label: '📝 Ask a tough coding question!', query: 'Pose a technical prompt to test candidate Anup\'s understanding of agent workflows, and demonstrate his answer.' }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial friendly greeting representing Anup
    return [{
      id: 'greeting',
      role: 'assistant',
      text: "Hi there! I'm Anup's AI Representative. 🧠\n\nI built this chatbot to talk precisely like myself in the first person! You can ask me anything about my data science projects, multi-agent portfolios, machine learning certifications, or IEEE publications. What would you like to explore today?",
      timestamp: new Date()
    }];
  });
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [companionMode, setCompanionMode] = useState<'double' | 'nami' | 'interview'>('double');
  
  // Real-time Speech Synthesis Vocalization State
  const [isTtsEnabled, setIsTtsEnabled] = useState(() => {
    return localStorage.getItem('chatbot_tts_enabled') !== 'false';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  // Stop vocalizer when chatbot closes or TTS is toggled off
  useEffect(() => {
    if (!isOpen || !isTtsEnabled) {
      handleStopSpeaking();
    }
  }, [isOpen, isTtsEnabled]);

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Remove markdown symbols from speech
    const cleanedText = text
      .replace(/[#*`_-]/g, ' ')
      .replace(/\[.*?\]/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const voices = window.speechSynthesis.getVoices();
    
    // Choose professional english voice if available
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Microsoft'))) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleTts = () => {
    const nextVal = !isTtsEnabled;
    setIsTtsEnabled(nextVal);
    localStorage.setItem('chatbot_tts_enabled', String(nextVal));
    sound.playClick();
    if (!nextVal) {
      handleStopSpeaking();
    }
  };

  const handleToggleCompanion = () => {
    let nextMode: 'double' | 'nami' | 'interview' = 'double';
    if (companionMode === 'double') {
      nextMode = 'nami';
    } else if (companionMode === 'nami') {
      nextMode = 'interview';
    } else {
      nextMode = 'double';
    }
    setCompanionMode(nextMode);
    handleStopSpeaking();
    sound.playClick();
    
    // Auto populate the stream with mode-specific greeting
    if (nextMode === 'nami') {
      setMessages([{
        id: 'nami-greeting',
        role: 'assistant',
        text: "⚓ Ahoy, adventurer! I'm Nami, the Straw Hat Navigator! 👒🍊\n\nAnup-kun hired me as his cyber-navigator to map this amazing terminal portal! I have fully synchronized with his data science research, IEEE publications, and multi-agent algorithms.\n\nClick the **Log Pose Cartography** sector on the page to set sail with the Thousand Sunny, or ask me any questions about our master shipwright's credentials!",
        timestamp: new Date()
      }]);
    } else if (nextMode === 'interview') {
      setMessages([{
        id: 'interview-greeting',
        role: 'assistant',
        text: "🎙️ Welcome to Interview Me Mode! I am your Technical Interview Representative. 👔\n\nI will act as a rigorous technical recruiter or interviewer. You can test Anupkumar Koturwar's engineering fit here!\n\nClick any topic below or ask me any technical vetting question (e.g. 'How does Anup prevent data leakage?', 'Why should I hire Anup?') to begin!",
        timestamp: new Date()
      }]);
    } else {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        text: "Hi there! I'm Anup's AI Representative. 🧠\n\nI built this chatbot to talk precisely like myself in the first person! You can ask me anything about my data science projects, multi-agent portfolios, machine learning certifications, or IEEE publications. What would you like to explore today?",
        timestamp: new Date()
      }]);
    }
  };

  // Sync profile photo from local storage on load
  useEffect(() => {
    const photo = localStorage.getItem('portfolio_profile_photo');
    if (photo) setProfilePhoto(photo);

    // Show a small hovering tip after 4 seconds to invite users to chat
    const timer = setTimeout(() => {
      const hasDismissed = localStorage.getItem('chatbot_tip_dismissed');
      if (!hasDismissed) {
        setShowTip(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleChat = () => {
    sound.playClick();
    setIsOpen(!isOpen);
    if (showTip) {
      setShowTip(false);
      localStorage.setItem('chatbot_tip_dismissed', 'true');
    }
  };

  const resetConversation = () => {
    sound.playGlitch();
    setMessages([{
      id: 'greeting',
      role: 'assistant',
      text: "Conversation reset! Ask me anything about my background, agent projects (CrewAI, LangGraph), or statistics expertise. Let's start fresh!",
      timestamp: new Date()
    }]);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    sound.playClick();
    
    // Create user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      // Map message log to backend API shape
      const historyPayload = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: historyPayload,
          companion: companionMode
        })
      });

      const data = await res.json();

      if (data.success && data.text) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'assistant',
          text: data.text,
          timestamp: new Date()
        }]);
        sound.playSuccess();
        if (isTtsEnabled) {
          handleSpeakText(data.text);
        }
      } else {
        throw new Error(data.error || 'Server responded with an error');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      sound.playGlitch();
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        text: "I experienced a minor latency or network glitch while reaching my main brain node. Don't worry, feel free to try submitting that question once again!",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe markdown-like format helper
  const renderMessageText = (text: string) => {
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((para, pIdx) => {
      // Check if this paragraph is a list of bullet points
      if (para.trim().startsWith('- ') || para.trim().startsWith('* ')) {
        const items = para.split(/\n[\-*]\s+/).map(item => item.trim().replace(/^[\-*]\s+/, ''));
        return (
          <ul key={pIdx} className="list-disc pl-5 my-2 space-y-1 text-xs sm:text-sm">
            {items.map((item, iIdx) => {
              if (!item) return null;
              return <li key={iIdx} dangerouslySetInnerHTML={{ __html: parseFormattedText(item) }} />;
            })}
          </ul>
        );
      }

      // Check if it's a numbered list
      if (/^\d+\.\s+/.test(para.trim())) {
        const items = para.split(/\n\d+\.\s+/).map(item => item.trim().replace(/^\d+\.\s+/, ''));
        return (
          <ol key={pIdx} className="list-decimal pl-5 my-2 space-y-1 text-xs sm:text-sm">
            {items.map((item, iIdx) => {
              if (!item) return null;
              return <li key={iIdx} dangerouslySetInnerHTML={{ __html: parseFormattedText(item) }} />;
            })}
          </ol>
        );
      }

      const lines = para.split('\n');
      return (
        <p key={pIdx} className="mb-2 last:mb-0 leading-relaxed text-xs sm:text-sm">
          {lines.map((line, lIdx) => {
            const parsed = parseFormattedText(line);
            return (
              <span key={lIdx} className="block last:inline">
                <span dangerouslySetInnerHTML={{ __html: parsed }} />
                {lIdx < lines.length - 1 && <br />}
              </span>
            );
          })}
        </p>
      );
    });
  };

  const parseFormattedText = (text: string) => {
    // 1. Replace **bold** with strong
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 2. Wrap single `backticks` in code tag
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>');
    return formatted;
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-[60] font-sans">
      <AnimatePresence>
        {/* Hover tip invite */}
        {showTip && !isOpen && (
          <motion.div
            key="chatbot-hover-invite"
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-72 p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 text-white shadow-2xl backdrop-blur-md flex flex-col gap-2 z-40 select-none cursor-pointer"
            onClick={toggleChat}
            onMouseEnter={() => sound.playHover()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-sans font-bold text-xs uppercase tracking-wider text-cyan-300">Anup AI Representative</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  setShowTip(false);
                  localStorage.setItem('chatbot_tip_dismissed', 'true');
                }}
                className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-350 leading-relaxed">
              Hey! Have questions about my projects (CrewAI, LangGraph, LLMs), certifications, or IEEE publications? Chat with my AI digital double right here!
            </p>
          </motion.div>
        )}

        {/* Chat window panel */}
        {isOpen && (
          <motion.div
            key="chatbot-window-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[82vh] rounded-3xl bg-slate-950/95 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden backdrop-blur-xl z-40"
          >
            {/* Header section with Anup's custom layout */}
            <div className={`p-4 border-b flex items-center justify-between transition-colors ${
              companionMode === 'nami' 
                ? 'bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/40 border-amber-500/20' 
                : companionMode === 'interview'
                ? 'bg-gradient-to-r from-emerald-950/40 via-slate-950 to-emerald-950/40 border-emerald-500/20'
                : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`relative w-12 h-12 rounded-xl p-[1px] bg-gradient-to-br ${
                  companionMode === 'nami' ? 'from-amber-400 to-orange-500' : companionMode === 'interview' ? 'from-emerald-400 to-teal-400' : 'from-cyan-500 to-teal-400'
                }`}>
                  <div className="w-full h-full rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                    {companionMode === 'nami' ? (
                       <span className="text-2xl select-none leading-none">👒</span>
                    ) : companionMode === 'interview' ? (
                       <span className="text-2xl select-none leading-none">🎙️</span>
                    ) : profilePhoto ? (
                      <img src={profilePhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                    ) : (
                      <img src={luffyImage} className="w-full h-full object-cover rounded-xl scale-110" referrerPolicy="no-referrer" loading="lazy" />
                    )}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                    companionMode === 'nami' ? 'bg-amber-500 animate-pulse' : companionMode === 'interview' ? 'bg-emerald-500 animate-pulse' : 'bg-green-500'
                  }`} />
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-extrabold text-xs tracking-wider text-slate-200 uppercase">
                      {companionMode === 'nami' ? 'Nami (Straw Hat Nav)' : companionMode === 'interview' ? 'Technical Interviewer' : 'Anup AI Double'}
                    </h3>
                    {isSpeaking && (
                      <div className="flex items-center gap-0.5 h-3 px-1 select-none">
                        <span className="w-0.5 bg-green-400 animate-[pulse_0.4s_infinite_100ms] rounded-full h-2" />
                        <span className="w-0.5 bg-green-500 animate-[pulse_0.3s_infinite_200ms] rounded-full h-3" />
                        <span className="w-0.5 bg-cyan-400 animate-[pulse_0.5s_infinite_300ms] rounded-full h-1.5" />
                        <span className="w-0.5 bg-cyan-500 animate-[pulse_0.4s_infinite_400ms] rounded-full h-2.5" />
                        <span className="w-0.5 bg-emerald-400 animate-[pulse_0.3s_infinite_500ms] rounded-full h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      companionMode === 'nami' ? 'bg-amber-400' : companionMode === 'interview' ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`} />
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${
                      companionMode === 'nami' ? 'text-amber-400/80' : companionMode === 'interview' ? 'text-emerald-400/80' : 'text-cyan-400/80'
                    }`}>
                      {isSpeaking ? 'VOCAL_AUDIO_SPEAKING' : companionMode === 'nami' ? 'GRAND_LINE_NAV_LINK' : companionMode === 'interview' ? 'INTERVIEW_VETTING_ACTIVE' : 'NEURAL_LIVE_STREAM'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Companion Selector Toggle Button */}
                <button
                  onClick={handleToggleCompanion}
                  title={companionMode === 'double' ? "Switch to Nami the Navigator Mode Guide" : companionMode === 'nami' ? "Switch to Technical Interview Mode" : "Switch back to Anup's AI Double"}
                  onMouseEnter={() => sound.playHover()}
                  className={`p-2 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    companionMode === 'nami' 
                      ? 'bg-amber-500/10 border-amber-500/35 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                      : companionMode === 'interview'
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-white/[0.04] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <Compass className={`w-3.5 h-3.5 ${companionMode === 'nami' ? 'animate-[spin_4s_linear_infinite]' : companionMode === 'interview' ? 'animate-[pulse_1.5s_infinite]' : ''}`} />
                </button>

                {/* Voice Synthesis Vocal Mode Toggle */}
                <button
                  onClick={handleToggleTts}
                  title={isTtsEnabled ? "Disable Voice Reader (Mute)" : "Enable Voice Reader (Vocal Speak)"}
                  onMouseEnter={() => sound.playHover()}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isTtsEnabled 
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'bg-white/[0.04] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {isTtsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                {/* Reset button */}
                <button
                  onClick={resetConversation}
                  title="Reset Chat Stream"
                  onMouseEnter={() => sound.playHover()}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {/* Close button */}
                <button
                  onClick={toggleChat}
                  onMouseEnter={() => sound.playHover()}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat message logs container */}
            <div
              ref={listRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar tag */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${msg.role === 'user' ? 'bg-blue-600/20 border-blue-500/30' : 'bg-slate-900 border-white/10'}`}>
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className={`p-3.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 border border-blue-500 rounded-tr-none text-white'
                      : 'bg-white/[0.03] border border-white/[0.06] rounded-tl-none text-slate-300'
                  }`}>
                    {renderMessageText(msg.text)}
                    
                    <div className="flex items-center justify-between gap-4 mt-1.5 pt-1.5 border-t border-white/[0.03] select-none">
                      <span className={`block text-[8px] font-mono ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text)}
                          onMouseEnter={() => sound.playHover()}
                          className="p-1 rounded-md text-[8.5px] font-mono font-bold flex items-center gap-1 text-slate-500 hover:text-cyan-400 hover:bg-white/5 cursor-pointer select-none transition-all active:scale-95"
                          title="Click to speak this message"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>TTS Speak</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bouncing typing loading dots */}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-slate-900 border border-white/10">
                    <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-[bounce_1s_infinite_100ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-[bounce_1s_infinite_200ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-[bounce_1s_infinite_300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable quick conversion suggestions templates */}
            <div className="px-4 py-2 border-t border-white/[0.06] bg-slate-950 flex flex-col gap-1 z-10 shrink-0">
              <span className="flex items-center gap-1 font-mono text-[8px] text-slate-500 uppercase tracking-widest pl-1">
                <HelpCircle className="w-2.5 h-2.5" /> SUGGESTED TOPICS
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {(companionMode === 'nami' ? NAMI_STARTERS : companionMode === 'interview' ? INTERVIEW_STARTERS : CONVERSATION_STARTERS).map(( starter, idx ) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(starter.query)}
                    disabled={isLoading}
                    onMouseEnter={() => sound.playHover()}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-white/[0.02] hover:bg-cyan-500/5 hover:border-cyan-500/20 active:bg-cyan-500/10 border border-white/5 hover:text-cyan-300 text-slate-300 text-[10px] sm:text-xs font-sans font-medium transition-all duration-150 disabled:opacity-50 select-none cursor-pointer"
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input send message toolbar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="p-3 border-t border-white/10 bg-slate-950 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask me something about myself..."
                disabled={isLoading}
                className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                onMouseEnter={() => sound.playHover()}
                className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
              >
                <Send className="w-4 h-4 shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
              </button>
            </form>
          </motion.div>
        )}

        {/* Global floating bubble element */}
        <motion.button
          id="floating-ai-chatbot"
          onClick={toggleChat}
          onMouseEnter={() => sound.playHover()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed bottom-4 md:bottom-6 ${isOpen ? 'right-4 md:right-6 border-cyan-400 ring-4 ring-cyan-500/10 bg-slate-900' : 'right-4 md:right-6 border-white/10 bg-slate-900'} z-50 flex items-center justify-center w-12 h-12 rounded-full border text-cyan-400 font-sans shadow-[0_0_30px_rgba(0,0,0,0.5)] glow-ring-pulsing hover:text-white duration-200 select-none cursor-pointer`}
          title="Chat with Anup's AI Representative"
        >
          {isOpen ? <X className="w-5 h-5 text-cyan-300" /> : <MessageSquare className="w-5 h-5 text-cyan-400 animate-[pulse_2s_infinite]" />}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}

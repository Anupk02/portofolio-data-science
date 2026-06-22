import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { sound } from '../utils';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  id?: string;
}

export default function ThemeToggle({ theme, toggleTheme, id }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      id={id}
      onClick={() => {
        sound.playClick();
        toggleTheme();
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`w-14 h-8 rounded-full p-1 cursor-pointer relative flex items-center select-none overflow-hidden transition-all duration-300 border focus:outline-none ${
        isDark
          ? 'bg-slate-950 border-white/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.6)]'
          : 'bg-gradient-to-r from-sky-300 via-blue-200 to-sky-100 border-slate-200 shadow-[inner_0_2px_4px_rgba(15,23,42,0.06)]'
      }`}
    >
      {/* Decorative stars and rays in background of track */}
      <div className="absolute inset-x-0 inset-y-0 overflow-hidden pointer-events-none select-none">
        {/* Dark Mode Stars */}
        <motion.div
          animate={{ opacity: isDark ? 0.8 : 0, scale: isDark ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute right-2 top-1.5 flex gap-1"
        >
          <div className="w-0.5 h-0.5 bg-white rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-violet-300 rotate-45 transform scale-75 animate-bounce" />
          <div className="w-0.5 h-0.5 bg-cyan-200 rounded-full" />
        </motion.div>

        {/* Light Mode Clouds */}
        <motion.div
          animate={{ opacity: !isDark ? 0.75 : 0, x: !isDark ? 0 : -10 }}
          transition={{ duration: 0.3 }}
          className="absolute left-2.5 top-1.5 flex flex-col gap-0.5 text-sky-600/25 dark:text-transparent"
        >
          <div className="w-4 h-1.5 bg-white/70 rounded-full" />
          <div className="w-3.5 h-1.5 bg-white/60 rounded-full ml-1" />
        </motion.div>
      </div>

      {/* Sliding Active Indicator Knob node */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 shadow-lg ${
          isDark
            ? 'bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/50 text-cyan-400'
            : 'bg-white text-amber-500 border border-amber-100'
        }`}
        style={{
          marginLeft: isDark ? 'auto' : '0',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark-icon"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-3.5 h-3.5 fill-cyan-400/20" />
            </motion.div>
          ) : (
            <motion.div
              key="light-icon"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-3.5 h-3.5 fill-amber-500/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

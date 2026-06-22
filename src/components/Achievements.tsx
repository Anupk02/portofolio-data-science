import { FileText, Award, ArrowUpRight, GraduationCap } from 'lucide-react';
import { ACHIEVEMENTS } from '../data';

export default function Achievements() {
  const paper = ACHIEVEMENTS[0];

  return (
    <section id="achievements" className="py-24 border-t border-slate-100/5 dark:border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Headers */}
          <div className="text-center mb-12">
            <span className="font-mono text-xs font-semibold tracking-widest text-violet-500 dark:text-violet-400 uppercase">
              // Scientific Contributions
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-2 transition-colors">
              Peer-Reviewed Publications
            </h2>
          </div>

          {/* Academic Paper Card Layout */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-100 to-indigo-50/20 dark:from-slate-900/40 dark:to-indigo-950/10 border-2 border-indigo-500/10 dark:border-indigo-500/15 shadow-2xl overflow-hidden group">
            {/* Soft background decor */}
            <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Badge: lg:col-span-3 */}
              <div className="md:col-span-3 flex flex-col items-center text-center p-5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] shadow-sm select-none shrink-0 self-center">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500 animate-pulse mb-3">
                  <Award className="w-7 h-7" />
                </div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  IEEE OTCON 24
                </span>
                <span className="font-sans text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                  Published Author
                </span>
                <div className="h-[1px] w-12 bg-indigo-500/20 my-2" />
                <span className="font-mono text-[8px] text-slate-400 dark:text-slate-500">
                  Peer-Reviewed
                </span>
              </div>

              {/* Right Details: lg:col-span-9 */}
              <div className="md:col-span-9 flex flex-col">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[9px] font-bold text-violet-500 bg-violet-500/10 border border-violet-500/20 uppercase tracking-widest">
                    IEEE proceeding archives
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    // Nanded, India
                  </span>
                </div>

                <h3 className="font-sans font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100 group-hover:text-indigo-400 transition-colors tracking-tight select-text">
                  {paper.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed select-text">
                  {paper.description}
                </p>

                {/* Additional Metadata metrics */}
                <div className="mt-6 flex flex-wrap gap-4 sm:gap-6 items-center">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-450">
                    <FileText className="w-4.5 h-4.5 text-blue-500" />
                    <span>Indexing: IEEE Xplore Digital Library</span>
                  </div>

                  <a
                    href="https://github.com/Anupk2002/Final-PlagDetect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors group/link ml-auto"
                  >
                    <span>View Repository Context</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight, Cpu, FileText, Sparkles, Terminal } from 'lucide-react';
import { PROJECTS } from '../data';
import { ProjectData } from '../types';

interface ProjectsProps {
  onNavigate: (hash: string) => void;
}

export default function Projects({ onNavigate }: ProjectsProps) {
  const featuredProjects = PROJECTS.filter((p) => p.featured);
  const otherProjects = PROJECTS.filter((p) => !p.featured);

  const handleCardClick = (slug: string) => {
    onNavigate(`#/project/${slug}`);
  };

  return (
    <section id="projects" className="py-24 border-t border-slate-100/5 dark:border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs font-semibold tracking-widest text-blue-500 dark:text-blue-400 uppercase">
            // Technical Portfolio
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-2 transition-colors">
            Featured Systems & Applied Solutions
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-sans tracking-wide">
            Detailed engineering case-studies summarizing actual multi-agent systems, local RAG architectures, and NLP pipelines.
          </p>
        </div>

        {/* Featured Projects - Displayed first and largest */}
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-widest text-slate-400 uppercase">
              Featured Intelligence Platforms
            </span>
            <div className="flex-grow h-[1px] bg-slate-200 dark:bg-white/[0.06]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProjects.map((p, index) => {
              const borderGradient = index % 2 === 0
                ? 'from-cyan-500 to-blue-500'
                : 'from-violet-500 to-purple-500';
              const hoverBorderClass = index % 2 === 0
                ? 'hover:border-cyan-500/50'
                : 'hover:border-violet-500/50';
              const textHighlightClass = index % 2 === 0
                ? 'group-hover:text-cyan-400'
                : 'group-hover:text-violet-400';

              return (
                <div
                  key={p.slug}
                  className={`group relative flex flex-col justify-between rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden transform hover:-translate-y-1.5 transition-all duration-300 ${hoverBorderClass}`}
                >
                  {/* Geometric top balance bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${borderGradient}`} />

                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded font-mono text-[9px] font-bold ${
                          index % 2 === 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-violet-500/10 text-violet-400'
                        } uppercase tracking-widest leading-none select-none`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          Featured
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                          PROJECT 0{index + 1}
                        </span>
                      </div>

                      <h3 className={`font-sans font-bold text-xl text-slate-800 dark:text-white transition-colors ${textHighlightClass}`}>
                        {p.title}
                      </h3>

                      <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-405 mt-2.5 leading-relaxed">
                        {p.tagline}
                      </p>

                      {/* Highlights Bullet List Preview */}
                      <ul className="mt-5 space-y-2">
                        {p.description.slice(0, 3).map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans select-text">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${index % 2 === 0 ? 'bg-cyan-500' : 'bg-violet-500'}`} />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Stack + CTA Footer */}
                    <div className="mt-8 flex flex-col gap-6">
                      {/* Tech stack row */}
                      <div className="flex flex-wrap gap-1.5">
                        {p.stack.slice(0, 6).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-slate-200/50 dark:bg-white/5 rounded-md text-[9px] font-mono text-slate-650 dark:text-slate-400 uppercase"
                          >
                            {tech}
                          </span>
                        ))}
                        {p.stack.length > 6 && (
                          <span className="px-1.5 py-0.5 font-mono text-[9px] font-medium text-slate-400 uppercase leading-none self-center">
                            +{p.stack.length - 6} more
                          </span>
                        )}
                      </div>

                      <button
                        id={`projects-view-featured-${p.slug}`}
                        onClick={() => handleCardClick(p.slug)}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.03] hover:text-white border border-slate-200 dark:border-white/[0.06] font-sans text-xs font-bold leading-none select-none tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                          index % 2 === 0 
                            ? 'hover:bg-cyan-600 hover:border-cyan-505 text-cyan-600 dark:text-cyan-400' 
                            : 'hover:bg-violet-600 hover:border-violet-505 text-violet-600 dark:text-violet-400'
                        }`}
                      >
                        <span>View Case Study</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Other Projects - Plagiarism Detection, etc. */}
        <div className="flex flex-col gap-6 mt-16">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-teal-400" />
            <span className="font-mono text-xs font-bold tracking-widest text-slate-400 uppercase">
              Academic Peer-Reviewed Work
            </span>
            <div className="flex-grow h-[1px] bg-slate-200 dark:bg-white/[0.06]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {otherProjects.map((p) => (
              <div
                key={p.slug}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-slate-100/40 to-slate-100/30 dark:from-slate-900/30 dark:to-slate-900/10 border border-slate-250/20 dark:border-white/[0.03] hover:border-teal-500/40 shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 lg:col-span-1"
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[8px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 uppercase tracking-widest leading-none">
                      IEEE Published
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">// NLP + CV</span>
                  </div>

                  <h3 className="font-sans font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight">
                    {p.title}
                  </h3>

                  <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                    {p.tagline}
                  </p>

                  {/* Highlights */}
                  <ul className="mt-4 space-y-2">
                    {p.description.slice(0, 2).map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-650 dark:text-slate-400 leading-normal font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex flex-wrap gap-1">
                    {p.stack.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-slate-105-light dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.03] font-mono text-[8px] font-medium text-slate-500 dark:text-slate-400 uppercase"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <button
                    id={`projects-view-standard-${p.slug}`}
                    onClick={() => handleCardClick(p.slug)}
                    className="w-full flex items-center justify-center gap-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.02] hover:bg-teal-600 dark:hover:bg-teal-650 hover:text-white border border-slate-200 dark:border-white/[0.04] font-sans text-[11px] font-bold text-slate-700 dark:text-slate-200 active:scale-98 transition-all duration-200 cursor-pointer"
                  >
                    <span>View Case Study</span>
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

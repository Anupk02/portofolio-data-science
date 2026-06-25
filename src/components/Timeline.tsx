import { GraduationCap, Award, Calendar, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { CERTIFICATIONS, EDUCATION_HISTORY } from '../data';

export default function Timeline() {
  return (
    <section id="certifications" className="py-24 border-t border-slate-100/5 dark:border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Certifications Timeline (lg:col-span-7) */}
          <div className="lg:col-span-7">
            <span className="font-mono text-xs font-semibold tracking-widest text-blue-500 dark:text-blue-400 uppercase">
              // Training & Credentials
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-2 transition-colors">
              Professional Certifications
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-sans max-w-2xl">
              Specialized masterclasses and validated credentials building practical excellence in ML architectures, core computing optimization and agent deployment.
            </p>

            {/* Vertical timeline */}
            <div className="relative mt-12 pl-6 sm:pl-8 border-l border-slate-200 dark:border-white/[0.06] space-y-10">
              {CERTIFICATIONS.map((cert, idx) => (
                <div key={cert.title} className="relative group">
                  {/* Glowing vertical node dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-[11px] h-[11px] rounded-full bg-slate-900 border-2 border-blue-500 group-hover:bg-blue-400 group-hover:scale-125 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-300" />

                  {/* Card Container */}
                  <div className="p-5 h-full rounded-2xl bg-slate-100/40 dark:bg-slate-900/10 hover:bg-slate-100/60 dark:hover:bg-slate-900/30 border border-slate-200/50 dark:border-white/[0.03] hover:border-blue-500/20 shadow-md transform hover:-translate-x-0.5 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                      <span className="font-sans text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full w-fit">
                        {cert.issuer}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{cert.date}</span>
                      </div>
                    </div>

                    <h3 className="font-sans font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 tracking-tight transition-colors">
                      {cert.title}
                    </h3>

                    {cert.details && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {cert.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Education Grid (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-semibold tracking-widest text-teal-500 dark:text-teal-400 uppercase">
                // Timeline
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-2 transition-colors">
                Academic Background
              </h2>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-sans">
                Solid academic grounding in systems architecture, software design, mathematical statistics, and algorithms.
              </p>

              {/* Education list */}
              <div className="mt-12 space-y-6">
                {EDUCATION_HISTORY.map((edu, idx) => (
                  <div
                    key={edu.degree}
                    id={`edu-item-${idx}`}
                    className="p-5 h-full rounded-2xl bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.03] shadow-md hover:border-teal-500/20 transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.02] flex items-center justify-center border border-slate-200/50 dark:border-white/[0.04]">
                        <GraduationCap className="w-5 h-5 text-teal-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans font-bold text-sm text-slate-800 dark:text-slate-200">
                          {edu.institution}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                          {edu.period}
                        </span>
                      </div>
                    </div>

                    <div className="h-[1px] bg-slate-200 dark:bg-white/[0.06]" />

                    <div className="flex items-center justify-between gap-2.5">
                      <span className="font-sans text-xs font-medium text-slate-600 dark:text-slate-400">
                        {edu.degree}
                      </span>
                      <span className="shrink-0 font-sans text-xs font-bold text-teal-500 bg-teal-500/10 px-2.5 py-0.5 rounded-full select-none">
                        {edu.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General technical interest box at bottom */}
            <div className="mt-12 p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-teal-500/5 border border-slate-200 dark:border-white/[0.02]">
              <div className="flex items-center gap-2 text-violet-500 mb-3">
                <BookOpen className="w-4.5 h-4.5" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                  Personal Research Interests
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Kaggle Competitions', 'Competitive Programming (LeetCode)', 'Algorithmic Optimizations', 'Open Source contributions', 'Statistical analysis'].map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] text-[10px] font-medium text-slate-600 dark:text-slate-400 font-sans"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

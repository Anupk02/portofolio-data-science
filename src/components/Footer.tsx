import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import { PERSONAL_INFO } from '../data';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="portfolio-footer" className="py-12 border-t border-slate-200/50 dark:border-white/[0.03] bg-slate-50 dark:bg-slate-950/20 backdrop-blur-md select-none relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-sans text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {PERSONAL_INFO.fullName}
            </span>
            <span className="font-sans text-xs text-slate-500 mt-1">
              &copy; {new Date().getFullYear()} All Rights Reserved. Crafted with high performance paradigms.
            </span>
          </div>

          {/* Center Social Rows */}
          <div className="flex items-center gap-4">
            <a
              id="footer-social-email"
              href={`mailto:${PERSONAL_INFO.email}`}
              aria-label="Direct Email Link"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/[0.05] text-slate-650 dark:text-slate-350 hover:text-blue-500 hover:scale-105 duration-200"
            >
              <Mail className="w-4 h-4" />
            </a>

            <a
              id="footer-social-linkedin"
              href={PERSONAL_INFO.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/[0.05] text-slate-650 dark:text-slate-350 hover:text-blue-500 hover:scale-105 duration-200"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            <a
              id="footer-social-github"
              href={PERSONAL_INFO.gitHub}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/[0.05] text-slate-650 dark:text-slate-350 hover:text-blue-500 hover:scale-105 duration-200"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>

          {/* Back to top clicker */}
          <div>
            <button
              id="footer-back-to-top"
              onClick={handleScrollToTop}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-500 dark:text-slate-350 hover:text-blue-500 dark:hover:text-blue-400 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.01] hover:bg-blue-500/10 border border-slate-200/50 dark:border-white/[0.03] font-sans text-xs font-semibold active:scale-95 duration-200 cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

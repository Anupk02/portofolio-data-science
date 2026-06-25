import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import { PERSONAL_INFO } from '../data';
import luffyFooterImage from '@/luffyfooter.png';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full z-10">
      {/* Luffy Lying Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none select-none relative z-20">
        <div className="flex justify-start -mb-8 sm:-mb-12 md:-mb-16">
          <img 
            src={luffyFooterImage} 
            alt="Luffy Lying Down" 
            className="w-48 sm:w-64 md:w-80 h-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      </div>

      <footer 
        id="portfolio-footer" 
        className="pt-16 pb-36 sm:pb-28 md:py-12 border-t border-slate-200 dark:border-white/[0.05] bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md select-none relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright description */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="font-sans text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                {PERSONAL_INFO.fullName}
              </span>
              <span className="font-sans text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                &copy; {new Date().getFullYear()} All Rights Reserved. Crafted with high performance paradigms.
              </span>
            </div>

            {/* Center Social Rows */}
            <div className="flex items-center gap-4">
              <a
                id="footer-social-email"
                href={`mailto:${PERSONAL_INFO.email}`}
                aria-label="Direct Email Link"
                className="p-3 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:scale-105 duration-200 shadow-sm"
              >
                <Mail className="w-4 h-4" />
              </a>

              <a
                id="footer-social-linkedin"
                href={PERSONAL_INFO.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="p-3 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:scale-105 duration-200 shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                id="footer-social-github"
                href={PERSONAL_INFO.gitHub}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="p-3 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:scale-105 duration-200 shadow-sm"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>

            {/* Back to top clicker */}
            <div>
              <button
                id="footer-back-to-top"
                onClick={handleScrollToTop}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-cyan-400 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/[0.08] font-sans text-xs font-bold active:scale-95 duration-200 cursor-pointer shadow-sm hover:shadow"
              >
                <span>Back to Top</span>
                <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

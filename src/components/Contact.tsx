import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Send, CheckCircle2, Globe, AlertTriangle, Cpu, Terminal, Activity, HardDrive, RefreshCw } from 'lucide-react';
import { PERSONAL_INFO } from '../data';

interface GatewayMessage {
  name: string;
  email: string;
  message: string;
  timestamp: string;
  method: string;
  status: string;
  error?: string;
}

interface GatewayStatus {
  status: string;
  hasSMTP: boolean;
  smtpConfig: {
    host: string;
    user: string;
    recipient: string;
  };
  metrics: {
    totalReceived: number;
    smtpTotal: number;
    fallbackTotal: number;
  };
  messages: GatewayMessage[];
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [showStatusTerminal, setShowStatusTerminal] = useState(true);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'none' }>({
    message: '',
    type: 'none',
  });

  const fetchGatewayStatus = async (silent = false) => {
    if (!silent) setIsRefreshingStatus(true);
    try {
      const res = await fetch('/api/mail-gateway/status');
      if (res.ok) {
        const data = await res.json();
        setGatewayStatus(data);
      }
    } catch (err) {
      console.warn('Mail gateway telemetry interface is in standby database-mode.');
    } finally {
      if (!silent) setIsRefreshingStatus(false);
    }
  };

  useEffect(() => {
    fetchGatewayStatus(true);
    // Poll gateway logs every 15 seconds to sync telemetry
    const interval = setInterval(() => {
      fetchGatewayStatus(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = 'Sender name is required';
    if (!formData.message.trim()) newErrors.message = 'Please provide a small message';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email structure';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setToast({
      message: 'Dispatching handshakes with Portfolio Gateway... Synchronizing headers.',
      type: 'success',
    });

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      setIsSubmitting(false);

      if (res.ok && result.success) {
        setToast({
          message: result.message || 'Your inquiry was successfully compiled and transmitted.',
          type: 'success',
        });
        setFormData({ name: '', email: '', message: '' });
        fetchGatewayStatus(true);
      } else {
        setToast({
          message: result.error || 'Server gateway rejected message. Please check logs.',
          type: 'error',
        });
      }
    } catch (err) {
      setIsSubmitting(false);
      // Fallback on client-side mailto link when server is uncontactable
      console.warn('Direct POST failed, invoking mailto link fallback launcher.', err);
      const subject = encodeURIComponent(`Inquiry from Portfolio - ${formData.name}`);
      const body = encodeURIComponent(
        `Hello Anupkumar,\n\n${formData.message}\n\n---\nSender Details:\nName: ${formData.name}\nEmail: ${formData.email}`
      );
      const mailtoUrl = `mailto:${PERSONAL_INFO.email}?subject=${subject}&body=${body}`;
      
      window.location.href = mailtoUrl;

      setToast({
        message: 'Mail gateway interface routed. Opening local mail app client fallback!',
        type: 'success',
      });
      setFormData({ name: '', email: '', message: '' });
    }

    setTimeout(() => {
      setToast({ message: '', type: 'none' });
    }, 6000);
  };

  return (
    <section id="contact" className="py-24 border-t border-slate-100/5 dark:border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 select-none">
          <span className="font-mono text-xs font-semibold tracking-widest text-cyan-500 dark:text-cyan-400 uppercase">
            // Connectivity Suite
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-2 transition-colors">
            Have a project in mind? Let's build something great.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct details cards (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h3 className="font-sans font-bold text-lg text-slate-800 dark:text-slate-100 select-none tracking-tight">
              Direct Channels
            </h3>

            {/* Email Card */}
            <a
              id="contact-way-email"
              href={`mailto:${PERSONAL_INFO.email}`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-slate-100/40 hover:bg-slate-100/70 dark:bg-slate-900/10 dark:hover:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.03] hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Direct Email
                </span>
                <span className="font-mono text-xs sm:text-sm text-slate-880 dark:text-slate-200 truncate select-all mt-0.5 font-medium">
                  {PERSONAL_INFO.email}
                </span>
              </div>
            </a>

            {/* Phone Card */}
            <a
              id="contact-way-phone"
              href={`tel:${PERSONAL_INFO.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-slate-100/40 hover:bg-slate-100/70 dark:bg-slate-900/10 dark:hover:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.03] hover:border-teal-500/30 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Direct Phone / WhatsApp
                </span>
                <span className="font-mono text-xs sm:text-sm text-slate-880 dark:text-slate-200 mt-0.5 font-medium">
                  {PERSONAL_INFO.phone}
                </span>
              </div>
            </a>

            {/* Location Card */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-100/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-white/[0.03] select-none">
              <div className="w-11 h-11 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Location Registry
                </span>
                <span className="font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-350 mt-0.5">
                  {PERSONAL_INFO.location}
                </span>
              </div>
            </div>

            {/* Interactive Social Row */}
            <div className="h-[1px] bg-slate-200 dark:bg-white/[0.06] my-2" />

            <div className="flex items-center gap-4">
              <a
                id="contact-social-linkedin"
                href={PERSONAL_INFO.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/[0.05] font-sans text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <Linkedin className="w-4 h-4 text-cyan-500" />
                <span>LinkedIn</span>
              </a>

              <a
                id="contact-social-github"
                href={PERSONAL_INFO.gitHub}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.02] dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/[0.05] font-sans text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <Github className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive client-side mailto form (col-span-7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 shadow-lg">
            <h3 className="font-sans font-bold text-lg text-slate-800 dark:text-slate-100 mb-6 select-none tracking-tight">
              Prefilled Mail Gateway
            </h3>

            {/* Form */}
            <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name-input" className="font-sans text-xs font-bold text-slate-600 dark:text-slate-400 select-none uppercase tracking-wider">
                  Your Full Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Hiring Manager"
                  className={`w-full px-4 py-3 rounded-xl font-sans text-sm outline-none bg-white dark:bg-white/[0.02] border ${
                    errors.name
                      ? 'border-red-500/65 focus:border-red-500'
                      : 'border-slate-200 dark:border-white/[0.06] focus:border-cyan-500'
                  } text-slate-850 dark:text-slate-205 transition-all`}
                />
                {errors.name && (
                  <span className="font-mono text-[10px] text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email-input" className="font-sans text-xs font-bold text-slate-600 dark:text-slate-400 select-none uppercase tracking-wider">
                  Your Email Address
                </label>
                <input
                  id="email-input"
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. manager@startup.ai"
                  className={`w-full px-4 py-3 rounded-xl font-sans text-sm outline-none bg-white dark:bg-white/[0.02] border ${
                    errors.email
                      ? 'border-red-500/65 focus:border-red-500'
                      : 'border-slate-200 dark:border-white/[0.06] focus:border-cyan-500'
                  } text-slate-850 dark:text-slate-205 transition-all`}
                />
                {errors.email && (
                  <span className="font-mono text-[10px] text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message-input" className="font-sans text-xs font-bold text-slate-600 dark:text-slate-400 select-none uppercase tracking-wider">
                  Message Details
                </label>
                <textarea
                  id="message-input"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your role requirements, contract, or general alignment notes..."
                  className={`w-full px-4 py-3 rounded-xl font-sans text-sm outline-none bg-white dark:bg-white/[0.02] border resize-none ${
                    errors.message
                      ? 'border-red-500/65 focus:border-red-500'
                      : 'border-slate-200 dark:border-white/[0.06] focus:border-cyan-500'
                  } text-slate-850 dark:text-slate-205 transition-all`}
                />
                {errors.message && (
                  <span className="font-mono text-[10px] text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.message}
                  </span>
                )}
              </div>

              {/* Submit trigger */}
              <button
                id="contact-submit"
                disabled={isSubmitting}
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-teal-500 hover:opacity-90 disabled:opacity-50 text-white font-sans text-sm font-bold uppercase tracking-widest leading-none shadow-lg shadow-cyan-500/10 active:scale-98 transition-all duration-200 cursor-pointer"
              >
                <span>{isSubmitting ? 'TRANSMITTING COGNITIVE ENVELOPE...' : 'SEND DIRECT MESSAGE'}</span>
                <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
              </button>
            </form>

            {/* Client feedback Toast */}
            {toast.type !== 'none' && (
              <div
                id="contact-toast"
                className={`mt-6 p-4 rounded-xl flex items-start gap-2.5 border animate-in fade-in duration-250 ${
                  toast.type === 'error'
                    ? 'bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-sans text-xs sm:text-sm leading-normal">
                  {toast.message}
                </span>
              </div>
            )}

            {/* Live Gateway Ledger / Status Monitor */}
            <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-800 p-5 font-mono text-[11px] text-slate-300 shadow-xl overflow-hidden relative select-none">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.15))] bg-[size:100%_4px] pointer-events-none opacity-10" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold tracking-tight text-white uppercase text-[11px]">sys_mail_gateway v1.2</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[10px]">
                    <span className={`w-1.5 h-1.5 rounded-full ${gatewayStatus?.hasSMTP ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400 animate-pulse'} inline-block`} />
                    <span className="text-slate-400 text-[9px] font-semibold">{gatewayStatus?.hasSMTP ? 'SMTP_TUNNEL' : 'LOCAL_LEDGER'}</span>
                  </span>
                  
                  <button 
                    type="button"
                    onClick={() => fetchGatewayStatus(false)}
                    className="p-1 text-slate-500 hover:text-white transition-all rounded hover:bg-slate-800/60 cursor-pointer"
                    title="Poll Node Gateway State"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Grid metrics */}
              <div className="grid grid-cols-3 gap-2.5 mb-4 text-[10px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
                <div>
                  <span className="block text-slate-500 text-[8px] uppercase font-bold">NODE_STATE</span>
                  <span className="font-bold text-emerald-400">CONNECT_OK</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[8px] uppercase font-bold font-mono">STATION</span>
                  <span className="font-semibold text-cyan-400">{gatewayStatus?.hasSMTP ? 'SMTP_ACTIVE' : 'DB_STANDBY'}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[8px] uppercase font-bold font-mono">SENT_COUNT</span>
                  <span className="font-bold text-fuchsia-400">{gatewayStatus ? gatewayStatus.metrics.totalReceived : 0} MSGS</span>
                </div>
              </div>

              {/* Message Streams Console */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">
                  <span>Received Streams Logs</span>
                  {gatewayStatus && gatewayStatus.messages.length > 0 && (
                    <button 
                      type="button"
                      onClick={async () => {
                        try {
                          await fetch('/api/mail-gateway/clear', { method: 'POST' });
                          fetchGatewayStatus(true);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="hover:text-red-400 text-[8px] tracking-tight uppercase cursor-pointer"
                    >
                      [purge_logs]
                    </button>
                  )}
                </div>

                <div className="bg-slate-950 rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-2 border border-slate-800/40 text-[10px]">
                  {gatewayStatus && gatewayStatus.messages.length > 0 ? (
                    gatewayStatus.messages.map((m: GatewayMessage, idx: number) => (
                      <div key={idx} className="border-b border-slate-900/50 pb-1.5 last:border-0 last:pb-0 font-mono">
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5 font-bold">
                          <span className="text-cyan-400 truncate max-w-[120px]">{m.name} &lt;{m.email}&gt;</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 leading-normal break-words pl-1.5 border-l border-slate-800">{m.message}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[8px]">
                          <span className="text-slate-600 font-semibold text-[8px]">STATUS:</span>
                          <span className={m.status.includes('Sent') ? 'text-emerald-400/80 font-bold' : 'text-amber-400/80 font-bold'}>
                            {m.status}
                          </span>
                          <span className="text-slate-700">|</span>
                          <span className="text-slate-600 font-semibold text-[8px]">ROUTER:</span>
                          <span className="text-violet-400/80 font-semibold lowercase font-mono">{m.method}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-600 font-medium">
                      &lt; No message streams captured on server database. Submit contact form above to test direct gateway dispatch. &gt;
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

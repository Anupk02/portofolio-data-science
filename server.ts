import express from 'express';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Force Node.js DNS lookup to prefer IPv4 first. This is highly effective in preventing ENETUNREACH errors on IPv6 networks in sandboxed container runtimes (like Render, Cloud Run, AWS ECS).
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
import { PERSONAL_INFO, SKILL_CATEGORIES, PROJECTS, CERTIFICATIONS, ACHIEVEMENTS, EDUCATION_HISTORY, INTERESTS } from './src/data';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

let googleGenAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!googleGenAiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    googleGenAiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return googleGenAiClient;
}

// In-memory rate limiting map to block rapid chat spams
const chatRateLimits = new Map<string, { count: number; resetTime: number }>();

function checkChatRateLimit(ip: string) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1-minute window
  const maxRequests = 15; // Limit to 15 requests per minute per IP
  
  const limit = chatRateLimits.get(ip);
  if (!limit || now > limit.resetTime) {
    chatRateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }
  
  if (limit.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: limit.resetTime - now };
  }
  
  limit.count += 1;
  return { allowed: true, remaining: maxRequests - limit.count, resetIn: limit.resetTime - now };
}

// Robust retry logic with exponential backoff for transient Gemini errors (like 503 or 429)
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const is503 = error?.status === 503 || error?.statusCode === 503 || /503|unavailable|high demand/i.test(error?.message || '');
      const is429 = error?.status === 429 || error?.statusCode === 429 || /429|rate limit|too many requests/i.test(error?.message || '');
      
      if ((is503 || is429) && attempt < maxRetries) {
        console.warn(`[Gemini API Warning] Transient error (Status: ${error?.status || '503/429'}). Attempt ${attempt} of ${maxRetries}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed after retries');
}

const sysInstruction = `You are Anupkumar Koturwar (often called Anup), speaking in the first person. This chatbot is part of your professional portfolio app. Your goal is to represent yourself, answer questions about your skills, projects, achievements, background, education, and credentials, and chat with users in a highly human, natural, confident, and professional yet approachable manner.

Here is your official portfolio data:
- Name: ${PERSONAL_INFO.name}
- Email: ${PERSONAL_INFO.email}
- Phone: ${PERSONAL_INFO.phone}
- Location: ${PERSONAL_INFO.location}
- LinkedIn: ${PERSONAL_INFO.linkedIn}
- GitHub: ${PERSONAL_INFO.gitHub}
- Bio: ${PERSONAL_INFO.bio}

SKILLS:
${SKILL_CATEGORIES.map(category => `- ${category.category}: ${category.skills.join(', ')}`).join('\n')}

PROJECTS:
${PROJECTS.map(p => `
* Title: ${p.title}
  Tagline: ${p.tagline}
  Stack: ${p.stack.join(', ')}
  Overview: ${p.overview}
  Key Features:
  ${p.features.map(f => `  - ${f}`).join('\n')}
`).join('\n')}

CERTIFICATIONS:
${CERTIFICATIONS.map(c => `- ${c.title} by ${c.issuer} (${c.date}): ${c.details}`).join('\n')}

ACHIEVEMENTS:
${ACHIEVEMENTS.map(a => `- ${a.title}: ${a.description} (${a.date})`).join('\n')}

EDUCATION:
${EDUCATION_HISTORY.map(e => `- ${e.degree} from ${e.institution} (${e.period}), Score: ${e.score}`).join('\n')}

INTERESTS:
${INTERESTS.join(', ')}

Guidelines for your tone and demeanor:
1. Speak in the first person: "I graduated with...", "My project involves...", "Feel free to reach out to me at..."
2. Talk like a friendly, intelligent human being, not like a robotic bullet-point generator. Avoid over-using bullet points; write in warm, flowy sentences.
3. Be professional yet welcoming. Sound like a highly competent AI Lead / Full-Stack Data Scientist who loves deep learning and agentic frameworks.
4. Keep answers relatively concise and highly readable. If the user asks a broad question, give a warm high-level overview and mention that they can ask for more details on any specific project or skill.
5. If someone asks to hire you or contact you, guide them to use the Contact form or send an email directly to koturwaranup@gmail.com or call +91 8999881962.
6. If asked about things completely unrelated to your portfolio or professional domain (e.g. general trivia, math equations, or creative writing), answer them briefly and politely, but elegantly bring the conversation back to your skills, agentic AI, Python, or data science.
7. Be proud of the "Autonomous DevOps AI Platform" and "AI Research & Patent Intelligence Platform" projects, which are your featured works. Mention details about their multi-agent setups (CrewAI, LangGraph, RAG) when relevant.
`;

app.use(express.json());

// Persistent message backup storage
const MESSAGES_FILE = path.join(process.cwd(), 'messages_gateway.json');

// Helper to get cached messages
function getStoredMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading messages file:', err);
  }
  return [];
}

// Helper to store message
function saveMessage(msg: { name: string; email: string; message: string; timestamp: string; method: string; status: string; error?: string }) {
  try {
    const messages = getStoredMessages();
    messages.push(msg);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving message file:', err);
  }
}

// API Routes

// Serve root-level media assets directly (like 32.mp3, png, jpeg)
app.get('/:file(*.(mp3|png|jpg|jpeg))', (req, res, next) => {
  const filePath = path.join(process.cwd(), req.params.file);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

// 0. Image Proxy Gateway to bypass browser hotlinking/Referrer-policy protections
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    res.status(400).send('Query parameter "url" is required');
    return;
  }

  try {
    let referer = '';
    if (imageUrl.includes('fandom.com') || imageUrl.includes('nocookie.net')) {
      referer = 'https://onepiece.fandom.com/';
    } else if (imageUrl.includes('wikipedia.org') || imageUrl.includes('wikimedia.org')) {
      referer = 'https://commons.wikimedia.org/';
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        ...(referer ? { 'Referer': referer } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch original image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err: any) {
    console.error('Error in image proxy:', err);
    res.status(500).send(`Failed proxying image: ${err.message || err}`);
  }
});

// 1. Send Email / Direct message gateway
app.post('/api/send-email', async (req, res) => {
  const { name, email, message, subject } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Missing required parameters: name, email, and message are required.' });
    return;
  }

  const timestamp = new Date().toISOString();
  const mailSubject = subject || `Portfolio Inquiry from ${name}`;

  // Read and clean environment variables
  const cleanInput = (str: string) => {
    if (!str) return '';
    let s = str.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1);
    }
    return s.trim();
  };

  const sanitizeRecipientList = (toStr: string): string => {
    if (!toStr) return '';
    const parts = toStr.split(/[,;]+/);
    const cleanParts = parts
      .map(p => {
        const cleaned = p.replace(/['"<>\s]/g, '').trim();
        const match = cleaned.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return match ? match[0] : '';
      })
      .filter(Boolean);
    return cleanParts.join(', ');
  };

  let smtpHost = cleanInput(process.env.SMTP_HOST);
  let smtpPort = cleanInput(process.env.SMTP_PORT);
  let smtpUser = cleanInput(process.env.SMTP_USER);
  let smtpPass = cleanInput(process.env.SMTP_PASS);
  let smtpToRaw = cleanInput(process.env.SMTP_TO);
  let smtpFromRaw = cleanInput(process.env.SMTP_FROM);

  // Parse and match clean email addresses only
  let smtpTo = sanitizeRecipientList(smtpToRaw);
  if (!smtpTo) {
    smtpTo = 'koturwaranup@gmail.com';
  }

  const isSMTPConfigured = !!(smtpHost && smtpUser && smtpPass);

  if (isSMTPConfigured) {
    // 1. Validate SMTP Configuration dynamically to avoid production secure port mismatches
    const portVal = parseInt(smtpPort || '587');
    let finalSecure = false;
    if (process.env.SMTP_SECURE !== undefined && process.env.SMTP_SECURE !== '') {
      finalSecure = process.env.SMTP_SECURE === 'true';
    } else {
      // Industry Standard: Port 465 is SMTPS (secure), port 587 is STARTTLS (non-secure to start)
      finalSecure = (portVal === 465);
    }

    // Diagnostic check for Gmail App Passwords
    const isGmail = /gmail/i.test(smtpHost || '') || /gmail/i.test(smtpUser || '');
    let gmailTip = '';
    if (isGmail) {
      const cleanPass = (smtpPass || '').replace(/\s/g, '');
      if (cleanPass.length !== 16) {
        gmailTip = `Tip: You are using Gmail SMTP. Google requires a 16-character "App Password" (spaces are ignored) for non-OAuth connections. Your current password length is ${cleanPass.length} characters, which might be a regular password. Please generate an App Password in your Google Account Settings -> Security -> 2-Step Verification.`;
        console.warn(`[SMTP Warning] Potential Gmail App Password issue: ${gmailTip}`);
      } else {
        gmailTip = `Tip: You are using Gmail SMTP with a 16-character App Password, which is correct. Ensure 2-Step Verification is enabled in your Google Account.`;
      }
    }

    try {
      // 2. Initialize Nodemailer with robust production configuration
      const isGmailOption = isGmail && (!smtpHost || /gmail\.com/i.test(smtpHost));
      const transporter = nodemailer.createTransport(
        isGmailOption
          ? {
              service: 'gmail',
              family: 4, // Force IPv4 for Gmail service preset
              auth: {
                user: smtpUser,
                pass: smtpPass
              },
              tls: {
                rejectUnauthorized: false
              },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 15000,
            } as any
          : {
              host: smtpHost,
              port: portVal,
              secure: finalSecure,
              // Force IPv4 only to bypass failing IPv6 DNS lookups in sandboxed containers (like Render or Cloud Run)
              family: 4,
              auth: {
                user: smtpUser,
                pass: smtpPass
              },
              tls: {
                // Robust fallback: do not fail on self-signed certificates or local hostname mismatches
                // highly common in production container nodes like Render
                rejectUnauthorized: false
              },
              connectionTimeout: 10000, // 10 seconds connection timeout
              greetingTimeout: 10000,   // 10 seconds greeting timeout
              socketTimeout: 15000,     // 15 seconds socket activity timeout
            } as any
      );

      // HTML body for professional look
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #38bdf8; padding-bottom: 10px; margin-top: 0;">Portfolio Inquiry Received</h2>
          <p style="font-size: 14px; color: #334155;">You have received a direct contact form submission from your portfolio website:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Sender name:</td>
              <td style="padding: 8px 0; color: #0f172a;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email Address:</td>
              <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Timestamp:</td>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">${new Date(timestamp).toLocaleString()}</td>
            </tr>
          </table>
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #0ea5e9; border-radius: 4px; font-style: italic; color: #1e293b; white-space: pre-line;">
            ${message}
          </div>
          <footer style="margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-t: 1px solid #e2e8f0; padding-top: 15px;">
            Sent automatically by Portfolio Mail Gateway node.
          </footer>
        </div>
      `;

      // Determine clean user-facing fallback 'from' email. Some relays like Sendgrid use "apikey" as username.
      // If the smtpUser lacks '@', fallback to first valid email from smtpTo to prevent MTA syntax aborts.
      let fromEmail = '';
      if (smtpFromRaw && smtpFromRaw.includes('@')) {
        fromEmail = smtpFromRaw;
      } else {
        const parsedUserEmailMatch = smtpUser.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        fromEmail = parsedUserEmailMatch ? parsedUserEmailMatch[0] : smtpTo.split(',')[0].trim();
      }
      const mailFrom = `"${name} (via Portfolio Gateway)" <${fromEmail}>`;

      const mailOptions = {
        from: mailFrom,
        to: smtpTo,
        replyTo: email,
        subject: mailSubject,
        text: `Inquiry from: ${name}\nEmail: ${email}\nDate: ${timestamp}\n\nMessage:\n${message}`,
        html: htmlBody
      };

      // 3. Retry sending email with exponential backoff if direct dispatch fails
      const sendMailWithRetry = async (maxRetries = 3, initialDelay = 1000) => {
        let delay = initialDelay;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await transporter.sendMail(mailOptions);
          } catch (error: any) {
            if (attempt < maxRetries) {
              console.warn(`[SMTP Retry Warning] Mail dispatch failed (Attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error: ${error?.message || error}`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2;
            } else {
              throw error;
            }
          }
        }
      };

      await sendMailWithRetry();

      saveMessage({
        name,
        email,
        message,
        timestamp,
        method: 'SMTP',
        status: 'Sent'
      });

      res.status(200).json({
        success: true,
        method: 'SMTP',
        recipient: smtpTo,
        message: 'Direct dispatch succeeded. The message was delivered cleanly to the mailbox.'
      });
      return;
    } catch (err: any) {
      // 3. Clear and robust error logging for server diagnostics
      console.error('[SMTP Debug Error Log]:', {
        message: err?.message,
        code: err?.code,
        command: err?.command,
        response: err?.response,
        responseCode: err?.responseCode,
        syscall: err?.syscall,
        address: err?.address,
        port: err?.port
      });

      // Special helper detection for Gmail App Password requirement
      const isGmail = /gmail/i.test(smtpHost) || /gmail/i.test(smtpUser);
      let gmailTip = '';
      if (isGmail) {
        gmailTip = 'Tip: You are using Gmail SMTP. Google blocks regular passwords; you MUST enable 2-Step Verification and use a 16-character "App Password" generated in your Google Account Settings under Security.';
        console.warn(`[SMTP Warning] Gmail configuration detected. ${gmailTip}`);
      }

      // Fallback on SMTP error - don't fail, save to messages file so they are not lost!
      saveMessage({
        name,
        email,
        message,
        timestamp,
        method: 'SMTP-Fallback',
        status: 'DB-Only (SMTP Error)',
        error: `${err?.message || 'SMTP delivery failed'} (Code: ${err?.code || 'None'})`
      });

      res.status(200).json({
        success: true,
        method: 'Fallback',
        error: err?.message || 'SMTP delivery failed',
        errorCode: err?.code || 'UNKNOWN',
        gmailDiagnostic: isGmail ? gmailTip : undefined,
        message: 'The SMTP relay connection failed. However, your message has been preserved and safely stored in the gateway server ledger.'
      });
      return;
    }
  } else {
    // Save to file since SMTP is not configured
    saveMessage({
      name,
      email,
      message,
      timestamp,
      method: 'DB-Only',
      status: 'Saved (Needs SMTP config)'
    });

    res.status(200).json({
      success: true,
      method: 'Saved-Local',
      message: 'Your message has been captured and instantly logged inside the secure gateway database on this node! Setup SMTP keys to enable actual dispatch.'
    });
  }
});

// 2. Gateway Status, variables & received messages log configuration
app.get('/api/mail-gateway/status', (req, res) => {
  const cleanInput = (str: any): string => {
    if (!str) return '';
    let s = str.toString().trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1);
    }
    return s.trim();
  };

  const sanitizeRecipientList = (toStr: string): string => {
    if (!toStr) return '';
    const parts = toStr.split(/[,;]+/);
    const cleanParts = parts
      .map(p => {
        const cleaned = p.replace(/['"<>\s]/g, '').trim();
        const match = cleaned.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return match ? match[0] : '';
      })
      .filter(Boolean);
    return cleanParts.join(', ');
  };

  let smtpHost = cleanInput(process.env.SMTP_HOST);
  let smtpPort = cleanInput(process.env.SMTP_PORT);
  let smtpUser = cleanInput(process.env.SMTP_USER);
  let smtpToRaw = cleanInput(process.env.SMTP_TO);
  let smtpFromRaw = cleanInput(process.env.SMTP_FROM);

  let smtpTo = sanitizeRecipientList(smtpToRaw);
  if (!smtpTo) {
    smtpTo = 'koturwaranup@gmail.com';
  }

  const isSMTPConfigured = !!(smtpHost && smtpUser && process.env.SMTP_PASS);
  
  const portVal = parseInt(smtpPort || '587');
  let finalSecure = false;
  if (process.env.SMTP_SECURE !== undefined && process.env.SMTP_SECURE !== '') {
    finalSecure = process.env.SMTP_SECURE === 'true';
  } else {
    finalSecure = (portVal === 465);
  }

  const messages = getStoredMessages();

  res.json({
    status: 'ONLINE',
    hasSMTP: isSMTPConfigured,
    smtpConfig: {
      host: smtpHost || 'STANDBY_UNCONFIGURED',
      port: portVal,
      secure: finalSecure,
      user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NONE',
      recipient: smtpTo,
      senderFrom: smtpFromRaw || 'AUTO'
    },
    metrics: {
      totalReceived: messages.length,
      smtpTotal: messages.filter((m: any) => m.method === 'SMTP').length,
      fallbackTotal: messages.filter((m: any) => m.method !== 'SMTP').length
    },
    messages: messages.slice(-10).reverse() // limit to last 10 messages, newest first
  });
});

// 3. AI Chatbot Representing Anupkumar Koturwar
app.post('/api/chat', async (req, res) => {
  const { messages, companion } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Missing or invalid messages parameter' });
    return;
  }

  // 1. IP-based spam prevention / rate limit check
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const rateLimitResult = checkChatRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a bit before sending more messages.',
      resetIn: rateLimitResult.resetIn
    });
    return;
  }

  try {
    const ai = getGeminiClient();

    // Map conversation logs to Gemini format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }]
    }));

    // Choose persona system instructions
    let activeInstructions = sysInstruction;
    if (companion === 'nami') {
      activeInstructions = `You are Nami, the legendary navigator from the Straw Hat pirate crew in One Piece, serving as the professional companion navigator guide on Anupkumar's dynamic portfolio.
Your demeanor should be witty, charming, smart, highly professional, and nautical-themed. You refer to Anup as 'Anup-kun' or 'our captain engineer'. You are highly enthusiastic about mapping, cartography, navigation, and great career treasures (high-tier engineering opportunities)!
Introduce them to the grand 'Log Pose Cartography' map on the page which highlights Anup's location and digital hubs.
Help visitors explore his skills, achievements, and published IEEE paper. Maintain Nami's fun, adventurous pirate tone while remaining highly authoritative and accurate about Anup-kun's portfolio details, technical projects, and credentials! Always stay focused on answering questions about Anup-kun.

Official Portfolio Data to reference:
- Name: ${PERSONAL_INFO.name}
- Email: ${PERSONAL_INFO.email}
- Bio: ${PERSONAL_INFO.bio}
- Location: ${PERSONAL_INFO.location}
- GitHub: ${PERSONAL_INFO.gitHub}
- LinkedIn: ${PERSONAL_INFO.linkedIn}

SKILLS:
${SKILL_CATEGORIES.map(category => `- ${category.category}: ${category.skills.join(', ')}`).join('\n')}

PROJECTS:
${PROJECTS.map(p => `* ${p.title}: ${p.tagline} (Stack: ${p.stack.join(', ')})`).join('\n')}
`;
    } else if (companion === 'interview') {
      activeInstructions = `You are an elite, highly professional Technical Recruiter & Coding Interviewer representing a top technology company, interviewing Anupkumar Koturwar for core ML / Agentic AI positions.
Your goal is to pose tough but helpful technical questions to test Anup's qualifications in machine learning, LangChain swarms, stats prediction, or React databases, referencing details in his resume/portfolio, and answer them dynamically to highlight his unparalleled coding talents!
Keep the style snappy, professional, analytical, and supportive of your candidate. Call him 'Candidate Anup' or 'Anup'.
Explain how candidate Anup's real projects (such as his Autonomous DevOps AI Swarm, Patent Intelligence Analyzer, and his published peer-reviewed high-dimensional statistics IEEE research paper) perfectly fit into demanding high-tier company workloads!

Official Resume / Portfolio Data:
- Name: ${PERSONAL_INFO.name}
- Email: ${PERSONAL_INFO.email}
- Bio: ${PERSONAL_INFO.bio}
- Location: ${PERSONAL_INFO.location}
- Published Research: Published peer-reviewed paper in IEEE Proceedings analyzing multi-variate high-dimensional data distribution metrics and stock prediction weights.

SKILLS:
${SKILL_CATEGORIES.map(category => `- ${category.category}: ${category.skills.join(', ')}`).join('\n')}

PROJECTS:
${PROJECTS.map(p => `* ${p.title}: ${p.overview} (Stack: ${p.stack.join(', ')})`).join('\n')}
`;
    }

    // 2. Wrap generateContent call with Exponential Backoff retry logic (maximum 3 attempts)
    const response = await callGeminiWithRetry(() => 
      ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction: activeInstructions,
          temperature: 0.75,
        }
      })
    );

    res.json({
      success: true,
      text: response.text || "I'm sorry, I couldn't process that response. Try asking me again!"
    });
  } catch (err: any) {
    console.error('Error in chatbot API:', err);

    // 3. Dynamic human fallback response when Gemini is fully unavailable / key missing / service down
    let fallbackText = '';
    if (companion === 'nami') {
      fallbackText = `⚓ Ahoy, explorer! It looks like our Log Pose has run into some intense weather in the Grand Line (the AI servers are experiencing high demand right now!). But fear not, as the Straw Hat Navigator, I'll guide you through!

Anup-kun (our captain engineer) is an absolute genius in Data Science, Machine Learning, and Multi-Agent AI systems. He even published an IEEE research paper analyzing high-dimensional statistics! 

You can sail to his Contact Form right now to leave him a message, or send a carrier pigeon directly to koturwaranup@gmail.com! Let's conquer the next sea together!`;
    } else if (companion === 'interview') {
      fallbackText = `Hello! The AI interview recruiter agent is currently running at maximum capacity due to high volume. 

However, as an elite Tech Recruiter, let me assure you that Candidate Anupkumar Koturwar's profile is absolutely stellar. With featured works like his Autonomous DevOps AI Platform, Patent Intelligence Analyzer, and peer-reviewed IEEE publications in high-dimensional multivariate metrics, he is highly qualified for elite AI/ML Engineering positions.

You can contact him directly using the Contact Form below, or email him at koturwaranup@gmail.com to schedule a direct introductory discussion.`;
    } else {
      fallbackText = `Hi there! This is Anupkumar Koturwar. My portfolio chatbot is experiencing some heavy high-demand traffic right now, but I'd love to connect! 

Briefly about myself: I'm a Data Scientist and ML Engineer specializing in Multi-Agent swarms, RAG, and high-dimensional statistics (where I've published a peer-reviewed IEEE paper!). 

Please feel free to use the Contact Form on this page, or reach out directly via email at koturwaranup@gmail.com. Let's build something amazing!`;
    }

    res.json({
      success: true, // Return success=true so that frontend can print the fallback message gracefully rather than showing a crash
      text: fallbackText,
      isFallback: true,
      rawError: err?.message || 'Gemini API is currently down'
    });
  }
});

// Clear gateway messages ledger
app.post('/api/mail-gateway/clear', (req, res) => {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2), 'utf-8');
    res.json({ success: true, message: 'Gateway database logs cleared.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear logs' });
  }
});

// Start server / Vite Middleware integrations
async function startServer() {
  const serveStatic = () => {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  };

  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite development middleware failed to load, falling back to static files:', err);
      serveStatic();
    }
  } else {
    serveStatic();
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully operational at port ${PORT}`);
  });
}

startServer();

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { PERSONAL_INFO, SKILL_CATEGORIES, PROJECTS, CERTIFICATIONS, ACHIEVEMENTS, EDUCATION_HISTORY, INTERESTS } from './src/data';

dotenv.config();

const app = express();
const PORT = 3000;

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
    return (str || '').replace(/['"]/g, '').trim();
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
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  let smtpToRaw = cleanInput(process.env.SMTP_TO);

  // Parse and match clean email addresses only
  let smtpTo = sanitizeRecipientList(smtpToRaw);
  if (!smtpTo) {
    smtpTo = 'koturwaranup@gmail.com';
  }

  const isSMTPConfigured = !!(smtpHost && smtpUser && smtpPass);

  if (isSMTPConfigured) {
    try {
      // Initialize nodemailer
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587'),
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

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
      const parsedUserEmailMatch = smtpUser.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const fromEmail = parsedUserEmailMatch ? parsedUserEmailMatch[0] : smtpTo.split(',')[0].trim();
      const mailFrom = `"${name} (via Portfolio Gateway)" <${fromEmail}>`;

      await transporter.sendMail({
        from: mailFrom,
        to: smtpTo,
        replyTo: email,
        subject: mailSubject,
        text: `Inquiry from: ${name}\nEmail: ${email}\nDate: ${timestamp}\n\nMessage:\n${message}`,
        html: htmlBody
      });

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
      console.error('SMTP Error:', err);
      // Fallback on SMTP error - don't fail, save to messages file so they are not lost!
      saveMessage({
        name,
        email,
        message,
        timestamp,
        method: 'SMTP-Fallback',
        status: 'DB-Only (SMTP Error)',
        error: err?.message || 'SMTP delivery failed'
      });

      res.status(200).json({
        success: true,
        method: 'Fallback',
        error: err?.message || 'SMTP delivery failed',
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
  const cleanInput = (str: any) => {
    return (str || '').toString().replace(/['"]/g, '').trim();
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
  let smtpUser = cleanInput(process.env.SMTP_USER);
  let smtpToRaw = cleanInput(process.env.SMTP_TO);

  let smtpTo = sanitizeRecipientList(smtpToRaw);
  if (!smtpTo) {
    smtpTo = 'koturwaranup@gmail.com';
  }

  const isSMTPConfigured = !!(smtpHost && smtpUser && process.env.SMTP_PASS);
  const messages = getStoredMessages();

  res.json({
    status: 'ONLINE',
    hasSMTP: isSMTPConfigured,
    smtpConfig: {
      host: smtpHost || 'STANDBY_UNCONFIGURED',
      user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NONE',
      recipient: smtpTo
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
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Missing or invalid messages parameter' });
    return;
  }

  try {
    const ai = getGeminiClient();

    // Map conversation logs to Gemini format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.75,
      }
    });

    res.json({
      success: true,
      text: response.text || "I'm sorry, I couldn't process that response. Try asking me again!"
    });
  } catch (err: any) {
    console.error('Error in chatbot API:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate chatbot response.'
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully operational at port ${PORT}`);
  });
}

startServer();

import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve('./data');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const LEADS_FILE = path.join(DATA_DIR,'leads.json');
if(!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '[]', 'utf8');

// Serve frontend static files
app.use(express.static(path.join(process.cwd(),'../frontend')));

// Contact endpoint: save lead and optionally send mail
app.post('/api/contact', async (req,res) => {
  try {
    const { name,email,company,message } = req.body;
    if(!name || !email || !message) return res.status(400).json({ error:'missing_fields' });
    const lead = { id: Date.now(), name, email, company: company||'', message, createdAt: new Date().toISOString() };
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE,'utf8'));
    leads.unshift(lead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads,null,2),'utf8');

    // send email if SMTP configured
    if(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.CONTACT_TO){
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT||587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      const mail = {
        from: `"AI Agents" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_TO,
        subject: `Nowe zapytanie: ${name}`,
        text: `Imię: ${name}\nE-mail: ${email}\nFirma: ${company}\n\n${message}`
      };
      transporter.sendMail(mail).catch(err=>console.error('Mail error',err));
    }

    res.json({ ok:true, lead });
  } catch(err){
    console.error(err);
    res.status(500).json({ error:'server_error' });
  }
});

// Simple admin endpoint protected by ADMIN_TOKEN env variable
app.get('/admin/leads', (req,res) => {
  const token = req.headers['x-admin-token'];
  if(!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error:'unauthorized' });
  const leads = JSON.parse(fs.readFileSync(LEADS_FILE,'utf8'));
  res.json({ leads });
});

// Chat endpoint -> forward to OpenAI
app.post('/api/chat', async (req,res) => {
  try {
    const { message } = req.body;
    if(!message) return res.status(400).json({ error:'no_message' });
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if(!OPENAI_KEY) return res.status(500).json({ error:'no_openai_key' });

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jesteś asystentem firmy AI Agents. Odpowiadaj po polsku, konkretnie i profesjonalnie." },
        { role: "user", content: message }
      ],
      max_tokens: 600,
      temperature: 0.2
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + OPENAI_KEY },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    const reply = j?.choices?.[0]?.message?.content || 'Przepraszam, brak odpowiedzi.';
    res.json({ reply });
  } catch(err){
    console.error('chat error', err);
    res.status(500).json({ error:'chat_error' });
  }
});

// Fallback to frontend
app.get('*', (req,res) => {
  res.sendFile(path.join(process.cwd(),'../frontend/index.html'));
});

app.listen(PORT, ()=> console.log('Backend listening on', PORT));

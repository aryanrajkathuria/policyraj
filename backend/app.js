const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const websitePath = path.join(__dirname, '../website');

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS – only allow your own domain (and localhost for development)
const allowedOrigins = [
  'https://policyraj.in',
  'https://www.policyraj.in',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(websitePath));

// Rate limiting – max 20 API calls per IP per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', apiLimiter);

// Email transporter (AWS SES SMTP or any SMTP provider)
// Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS as environment variables
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendLeadEmail(subject, body) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@policyraj.in',
      to: process.env.EMAIL_TO || 'sachin@policyraj.in',
      subject,
      text: body
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'PolicyRaj backend is healthy' });
});

app.post('/api/contact', async (req, res) => {
  const { name, phone, email, insurance_type, message } = req.body;

  if (!name || !phone || !insurance_type) {
    return res.status(400).json({ success: false, message: 'Name, phone and insurance type are required.' });
  }

  console.log('New contact lead:', { name, phone, email, insurance_type, message });

  await sendLeadEmail(
    `New Lead: ${name} — ${insurance_type}`,
    `Name: ${name}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nInsurance Type: ${insurance_type}\nMessage: ${message || 'None'}`
  );

  return res.json({ success: true, message: 'Contact request received. We will reach out shortly.' });
});

app.post('/api/quote', async (req, res) => {
  const { name, phone, insurance_type, source } = req.body;

  if (!name || !phone || !insurance_type) {
    return res.status(400).json({ success: false, message: 'Name, phone and insurance type are required.' });
  }

  console.log('New quote request:', { name, phone, insurance_type, source });

  await sendLeadEmail(
    `Quote Request: ${name} — ${insurance_type}`,
    `Name: ${name}\nPhone: ${phone}\nInsurance Type: ${insurance_type}\nSource: ${source || 'Website'}`
  );

  return res.json({ success: true, message: 'Quote request received. Our advisor will contact you soon.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(websitePath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PolicyRaj backend listening on port ${PORT}`);
});

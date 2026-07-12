/**
 * PolicyRaj — Quote Lead Handler (v3 — email-only, no database)
 * Runtime : Node.js 20.x (ESM) — paste into Lambda console as index.mjs
 * Region  : ap-south-1
 * Trigger : Lambda Function URL (Auth: NONE, CORS: leave OFF — this code handles it)
 *
 * Flow: POST → validate → SES email to Sachin. That's it.
 *
 * Env vars (optional — defaults shown):
 *   FROM_EMAIL     sachin@policyraj.com     (must be SES-verified)
 *   NOTIFY_EMAIL   sachin@policyraj.com     (must be SES-verified while in sandbox)
 *   TWILIO_SID / TWILIO_TOKEN / TWILIO_WA_FROM / TWILIO_WA_TO
 *                  (optional — WhatsApp alerts; skipped silently if unset)
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const FROM   = process.env.FROM_EMAIL   || 'sachin@policyraj.com';
const NOTIFY = process.env.NOTIFY_EMAIL || 'sachin@policyraj.com';

const ses = new SESClient({ region: REGION });

const ALLOWED_ORIGINS = [
  'https://www.policyraj.com',
  'https://policyraj.com',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

/* ── CORS: echo the origin if allowed; '*' for console tests / curl ── */
function corsHeaders(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  return {
    'Access-Control-Allow-Origin':  ALLOWED_ORIGINS.includes(origin) ? origin : '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/* ── Body parsing: Function URL / API Gateway / direct console test ── */
function parseBody(event) {
  if (event.body) {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch { return null; }
  }
  // Direct console test with fields at top level
  if (event.name || event.mobile || event.type) return event;
  return null;
}

export const handler = async (event) => {
  const CORS = corsHeaders(event);
  const respond = (status, body) => ({
    statusCode: status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const data = parseBody(event);
  if (!data) return respond(400, { success: false, error: 'Invalid JSON body' });

  const { type, name, email, mobile, ...rest } = data;

  /* ── Validation — matches what the website forms actually send ── */
  const errors = {};
  if (!type) errors.type = 'Lead type is required (health / motor / life / contact).';
  if (!name || String(name).trim().length < 2) errors.name = 'Name must be at least 2 characters.';

  const digits = String(mobile || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) errors.mobile = 'Enter a valid 10-digit mobile number.';

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (Object.keys(errors).length) return respond(400, { success: false, errors });

  const id        = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();

  /* ── Email the lead to Sachin via SES ── */
  try {
    await ses.send(new SendEmailCommand({
      Source:      `PolicyRaj <${FROM}>`,
      Destination: { ToAddresses: [NOTIFY] },
      Message: {
        Subject: { Data: `New ${typeLabel(type)} Lead — ${name} (${digits})` },
        Body:    { Html: { Data: buildEmailHtml({ type, name, email, mobile: digits, timestamp, ...rest }) } },
      },
    }));
  } catch (err) {
    console.error('SES error:', err);
    return respond(500, { success: false, error: 'Could not send lead email: ' + (err.message || err.name) });
  }

  /* ── WhatsApp via Twilio (optional, never blocks success) ── */
  try { await sendTwilioWhatsApp(buildWhatsAppMsg({ type, name, email, mobile: digits, ...rest })); }
  catch (err) { console.error('Twilio error:', err); }

  return respond(200, { success: true, leadId: id });
};

/* ── WhatsApp via Twilio REST API (no-op unless all env vars set) ── */
async function sendTwilioWhatsApp(message) {
  const sid   = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from  = process.env.TWILIO_WA_FROM;
  const to    = process.env.TWILIO_WA_TO;
  if (!sid || !token || !from || !to) return;

  const creds = Buffer.from(`${sid}:${token}`).toString('base64');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: message }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Twilio failed');
  return json;
}

function buildWhatsAppMsg({ type, name, email, mobile, ...rest }) {
  const lines = [
    `🔔 *New ${typeLabel(type)} Lead — PolicyRaj*`,
    `━━━━━━━━━━━━━━━━━━━`,
    `👤 *Name:* ${name}`,
    `📱 *Mobile:* ${mobile}`,
    email ? `📧 *Email:* ${email}` : null,
    `━━━━━━━━━━━━━━━━━━━`,
  ];
  Object.entries(rest).forEach(([k, v]) => {
    if (v && k !== 'timestamp') lines.push(`• *${formatKey(k)}:* ${v}`);
  });
  lines.push(`━━━━━━━━━━━━━━━━━━━`);
  lines.push(`⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  lines.push(`💼 Reply to start conversation`);
  return lines.filter(Boolean).join('\n');
}

function buildEmailHtml({ type, name, email, mobile, timestamp, ...rest }) {
  const rows = Object.entries(rest)
    .filter(([k, v]) => v && k !== 'timestamp')
    .map(([k, v]) => `
      <tr>
        <td style="padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;font-size:13px;white-space:nowrap">${formatKey(k)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px">${escapeHtml(String(v))}</td>
      </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <tr><td style="background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:28px 32px">
    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">New ${typeLabel(type)} Lead</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,.7);font-size:13px">PolicyRaj · ${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
  </td></tr>
  <tr><td style="padding:24px 32px 0">
    <table cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:10px;padding:16px;width:100%">
      <tr>
        <td style="padding:0 16px 0 0">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8">Customer</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#0f172a">${escapeHtml(name)}</p>
        </td>
        <td style="padding:0 16px">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8">Mobile</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#0f172a">${mobile}</p>
        </td>
        ${email ? `<td><p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8">Email</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#0f172a">${escapeHtml(email)}</p></td>` : ''}
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 32px">
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b">Form Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      ${rows || '<tr><td style="padding:8px 12px;color:#94a3b8;font-size:13px">No extra fields</td></tr>'}
    </table>
  </td></tr>
  <tr><td style="padding:0 32px 28px">
    <a href="https://wa.me/91${mobile}?text=${encodeURIComponent(`Hi ${name}, this is Sachin from PolicyRaj. I received your ${typeLabel(type)} enquiry.`)}"
       style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
      💬 Reply on WhatsApp
    </a>
    &nbsp;
    <a href="tel:${mobile}" style="display:inline-block;background:#1E3A8A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
      📞 Call Now
    </a>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0">
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">PolicyRaj™ · www.policyraj.com · sachin@policyraj.in</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ── Helpers ── */
function typeLabel(t) {
  return { health: 'Health Insurance', life: 'Life Insurance', motor: 'Motor Insurance', home: 'Home Insurance', contact: 'General' }[t] || t;
}

function formatKey(k) {
  return k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

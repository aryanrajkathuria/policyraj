/**
 * PolicyRaj — Quote Lead Handler
 * Triggered by API Gateway POST /quote
 *
 * Env vars required:
 *   DYNAMO_TABLE       = policyraj-leads
 *   FROM_EMAIL         = sachin@policyraj.com  (SES verified)
 *   NOTIFY_EMAIL       = sachin@policyraj.com
 *   TWILIO_SID         = ACxxxxxxxxxxxxxxxx
 *   TWILIO_TOKEN       = your_auth_token
 *   TWILIO_WA_FROM     = whatsapp:+14155238886  (sandbox) or your registered number
 *   TWILIO_WA_TO       = whatsapp:+919013976999
 *   ALLOWED_ORIGIN     = https://policyraj.in
 */

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SESClient, SendEmailCommand }     from '@aws-sdk/client-ses';

const db  = new DynamoDBClient({ region: process.env.AWS_REGION });
const ses = new SESClient({ region: process.env.AWS_REGION });

const CORS = {
  'Access-Control-Allow-Origin':  process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { error: 'Invalid JSON' }); }

  const { type, name, email, mobile, ...rest } = body;

  if (!type || !name || !mobile) {
    return respond(400, { error: 'Missing required fields: type, name, mobile' });
  }

  const id        = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();

  // ── 1. Save to DynamoDB ───────────────────────────────────────────────────
  await db.send(new PutItemCommand({
    TableName: process.env.DYNAMO_TABLE || 'policyraj-leads',
    Item: {
      leadId:    { S: id },
      type:      { S: type },
      name:      { S: name },
      mobile:    { S: mobile },
      email:     { S: email || '' },
      data:      { S: JSON.stringify(rest) },
      createdAt: { S: timestamp },
      status:    { S: 'new' },
    },
  })).catch(err => console.error('DynamoDB error:', err));

  // ── 2. Send Email via SES ─────────────────────────────────────────────────
  const emailHtml = buildEmailHtml({ type, name, email, mobile, ...rest, timestamp });
  await ses.send(new SendEmailCommand({
    Source:      process.env.FROM_EMAIL,
    Destination: { ToAddresses: [process.env.NOTIFY_EMAIL] },
    Message: {
      Subject: { Data: `New ${typeLabel(type)} Quote — ${name} (${mobile})` },
      Body:    { Html: { Data: emailHtml } },
    },
  })).catch(err => console.error('SES error:', err));

  // ── 3. Send WhatsApp via Twilio ───────────────────────────────────────────
  const waMsg = buildWhatsAppMsg({ type, name, email, mobile, ...rest });
  await sendTwilioWhatsApp(waMsg).catch(err => console.error('Twilio error:', err));

  return respond(200, { success: true, leadId: id });
};

// ── WhatsApp via Twilio REST API ─────────────────────────────────────────────
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

// ── WhatsApp message text ─────────────────────────────────────────────────────
function buildWhatsAppMsg({ type, name, email, mobile, ...rest }) {
  const lines = [
    `🔔 *New ${typeLabel(type)} Quote — PolicyRaj*`,
    `━━━━━━━━━━━━━━━━━━━`,
    `👤 *Name:* ${name}`,
    `📱 *Mobile:* ${mobile}`,
    email ? `📧 *Email:* ${email}` : null,
    `━━━━━━━━━━━━━━━━━━━`,
  ];

  // Add all extra fields
  Object.entries(rest).forEach(([k, v]) => {
    if (v && k !== 'timestamp') {
      lines.push(`• *${formatKey(k)}:* ${v}`);
    }
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━`);
  lines.push(`⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  lines.push(`💼 Reply to start conversation`);

  return lines.filter(Boolean).join('\n');
}

// ── Email HTML ────────────────────────────────────────────────────────────────
function buildEmailHtml({ type, name, email, mobile, timestamp, ...rest }) {
  const rows = Object.entries(rest)
    .filter(([k, v]) => v && k !== 'timestamp')
    .map(([k, v]) => `
      <tr>
        <td style="padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;font-size:13px;white-space:nowrap">${formatKey(k)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px">${v}</td>
      </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:28px 32px">
    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">New ${typeLabel(type)} Quote Request</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,.7);font-size:13px">PolicyRaj · ${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
  </td></tr>
  <!-- Lead summary -->
  <tr><td style="padding:24px 32px 0">
    <table cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:10px;padding:16px;width:100%">
      <tr>
        <td style="padding:0 16px 0 0">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8">Customer</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#0f172a">${name}</p>
        </td>
        <td style="padding:0 16px">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8">Mobile</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#0f172a">${mobile}</p>
        </td>
        ${email ? `<td><p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8">Email</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#0f172a">${email}</p></td>` : ''}
      </tr>
    </table>
  </td></tr>
  <!-- Details table -->
  <tr><td style="padding:20px 32px">
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b">Form Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      ${rows}
    </table>
  </td></tr>
  <!-- CTA -->
  <tr><td style="padding:0 32px 28px">
    <a href="https://wa.me/919013976999?text=Hi+${encodeURIComponent(name)}%2C+I+received+your+quote+request+for+${typeLabel(type)}."
       style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
      💬 Reply on WhatsApp
    </a>
    &nbsp;
    <a href="tel:${mobile}" style="display:inline-block;background:#1E3A8A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
      📞 Call Now
    </a>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0">
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">PolicyRaj™ · Lead Management System · sachin@policyraj.com</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function respond(status, body) {
  return { statusCode: status, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function typeLabel(t) {
  return { health: 'Health Insurance', life: 'Life Insurance', motor: 'Motor Insurance', contact: 'General' }[t] || t;
}

function formatKey(k) {
  return k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim();
}

/**
 * PolicyRaj — Newsletter Subscription Lambda
 * Runtime : Node.js 20.x  (ESM)
 * Region  : ap-south-1
 *
 * Flow: POST /newsletter  →  DynamoDB (store) + SES (welcome + notify Sachin)
 *
 * Required env vars (set in Lambda console or via CLI):
 *   DYNAMO_TABLE   policyraj-newsletter          (DynamoDB table name)
 *   FROM_EMAIL     sachin@policyraj.com           (SES verified sender)
 *   NOTIFY_EMAIL   sachin@policyraj.com           (who gets new-subscriber alerts)
 *   ALLOWED_ORIGIN https://policyraj.in          (CORS origin)
 */

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand }     from "@aws-sdk/client-ses";

const REGION  = process.env.AWS_REGION  || "ap-south-1";
const TABLE   = process.env.DYNAMO_TABLE   || "policyraj-newsletter";
const FROM    = process.env.FROM_EMAIL     || "sachin@policyraj.com";
const NOTIFY  = process.env.NOTIFY_EMAIL   || "sachin@policyraj.com";
const ORIGIN  = process.env.ALLOWED_ORIGIN || "https://policyraj.in";

const db  = new DynamoDBClient({ region: REGION });
const ses = new SESClient({ region: REGION });

/* ── CORS helper ── */
const respond = (status, body) => ({
  statusCode: status,
  headers: {
    "Access-Control-Allow-Origin":  ORIGIN,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  },
  body: body ? JSON.stringify(body) : "",
});

/* ── Main handler ── */
export const handler = async (event) => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === "OPTIONS") {
    return respond(204, null);
  }

  // Parse body
  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid request body" });
  }

  const email = (parsed.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(400, { error: "Please enter a valid email address" });
  }

  const now = new Date().toISOString();

  // ── 1. Store in DynamoDB ──────────────────────────────────────────────────
  try {
    await db.send(new PutItemCommand({
      TableName: TABLE,
      Item: {
        email:        { S: email },
        subscribedAt: { S: now },
        source:       { S: "blog-newsletter" },
        status:       { S: "active" },
      },
      // Silently succeed if already subscribed — no duplicate entries
      ConditionExpression: "attribute_not_exists(email)",
    }));
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      // Already in the table — treat as success
      return respond(200, { message: "Already subscribed" });
    }
    console.error("DynamoDB error:", err);
    return respond(500, { error: "Could not save subscription. Please try again." });
  }

  // ── 2. Welcome email to subscriber ────────────────────────────────────────
  try {
    await ses.send(new SendEmailCommand({
      Source:      `PolicyRaj <${FROM}>`,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "Welcome to PolicyRaj Insights! 🎉" },
        Body: {
          Html: { Data: welcomeEmailHtml(email) },
          Text: { Data: welcomeEmailText() },
        },
      },
    }));
  } catch (err) {
    // Log but don't fail — subscriber is already saved in DynamoDB
    console.error("SES welcome email error:", err);
  }

  // ── 3. Notify Sachin (email — WhatsApp requires Meta WABA / Twilio) ───────
  try {
    await ses.send(new SendEmailCommand({
      Source:      `PolicyRaj <${FROM}>`,
      Destination: { ToAddresses: [NOTIFY] },
      Message: {
        Subject: { Data: `📧 New Newsletter Subscriber — ${email}` },
        Body: {
          Html: {
            Data: `
              <p style="font-family:sans-serif">
                <strong>New newsletter subscriber on PolicyRaj blog</strong><br><br>
                📧 <strong>Email:</strong> ${email}<br>
                🕐 <strong>Time:</strong> ${new Date(now).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST<br>
                📍 <strong>Source:</strong> Blog newsletter form
              </p>
            `,
          },
        },
      },
    }));
  } catch (err) {
    console.error("SES notify error:", err);
  }

  return respond(200, { message: "Subscribed successfully" });
};

/* ── Email templates ── */
function welcomeEmailHtml(email) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'IBM Plex Sans',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,138,0.10);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:1.5rem;font-weight:800;letter-spacing:-0.01em;">
        Welcome to PolicyRaj Insights
      </h1>
      <p style="color:rgba(255,255,255,0.75);margin:10px 0 0;font-size:0.92rem;">
        Your trusted insurance knowledge partner
      </p>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px;">
      <p style="color:#0F172A;font-size:0.97rem;line-height:1.75;margin-top:0;">
        Hi there,
      </p>
      <p style="color:#475569;font-size:0.95rem;line-height:1.75;">
        Thank you for subscribing to <strong>PolicyRaj Insights</strong>!
        You're now part of a community that gets practical, jargon-free
        insurance guidance straight to their inbox.
      </p>
      <p style="color:#475569;font-size:0.95rem;line-height:1.75;">Here's what you can expect:</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#374151;font-size:0.93rem;">💡 Weekly insurance tips you can act on</td></tr>
        <tr><td style="padding:8px 0;color:#374151;font-size:0.93rem;">📋 Claim process guides &amp; alerts</td></tr>
        <tr><td style="padding:8px 0;color:#374151;font-size:0.93rem;">💰 Tax-saving strategies under 80C &amp; 80D</td></tr>
        <tr><td style="padding:8px 0;color:#374151;font-size:0.93rem;">🏥 Health cover comparisons &amp; latest news</td></tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0 24px;">
        <a href="https://policyraj.in"
           style="background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;text-decoration:none;
                  padding:14px 36px;border-radius:50px;font-weight:700;font-size:0.93rem;
                  display:inline-block;letter-spacing:0.02em;">
          Visit PolicyRaj →
        </a>
      </div>

      <!-- Footer note -->
      <p style="color:#8896a5;font-size:0.8rem;text-align:center;
                border-top:1px solid #e8ecf3;padding-top:20px;margin-bottom:0;line-height:1.7;">
        Questions? WhatsApp Sachin at
        <a href="https://wa.me/919013976999" style="color:#1E3A8A;text-decoration:none;">+91 9013976999</a><br>
        PolicyRaj · Magnum Towers, Sector 58, Gurugram – 122098<br>
        <span style="font-size:0.75rem;color:#b0bac4;">
          You received this because you subscribed at policyraj.in —
          reply UNSUBSCRIBE to remove yourself.
        </span>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function welcomeEmailText() {
  return `Welcome to PolicyRaj Insights!

Thank you for subscribing. Here's what you can expect:
- Weekly insurance tips you can act on
- Claim process guides & alerts
- Tax-saving strategies under 80C & 80D
- Health cover comparisons & latest news

Visit us at https://policyraj.in
Questions? WhatsApp Sachin at +91 9013976999

PolicyRaj · Magnum Towers, Sector 58, Gurugram – 122098
Reply UNSUBSCRIBE to remove yourself from this list.
`;
}

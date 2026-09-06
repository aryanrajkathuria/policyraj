// Daily renewal reminder sweep.
//
// Invoked by EventBridge once a day. Finds active policies whose renewal date is
// exactly 30, 15 or 3 days out, where the customer has opted in, and emails them.
//
// Dry run: invoke with {"dryRun": true}. It scans and logs every match, and
// sends nothing and writes no marker. A scheduled EventBridge event carries no
// such flag, so the schedule always runs live.
//
// This function never touches the SES identity configuration. It calls
// ses:SendEmail as the configured From address and nothing else.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, paginateScan, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const FROM = process.env.REMINDER_FROM;
const SENDER_NAME = process.env.REMINDER_SENDER_NAME || "PolicyRaj";

const ADVISOR_PHONE = "9013976999";
const WHATSAPP = "https://wa.me/919013976999";
const DASHBOARD_URL = "https://www.policyraj.com/dashboard";

const MAX_SCAN_ITEMS = 20000;

// One marker attribute per window, so each fires independently. The stored value
// is the renewalDate the reminder went out for, not the send date — when a policy
// renews and its date rolls forward, the stored value stops matching and the next
// cycle fires again. Three keys, bounded forever.
const WINDOWS = [
  { days: 30, attr: "reminderSent30" },
  { days: 15, attr: "reminderSent15" },
  { days: 3, attr: "reminderSent03" },
];

const log = (event, fields) => console.log(JSON.stringify({ event, ...fields }));

// The schedule fires at 03:30 UTC, which is the same calendar day in IST, but the
// date is pinned to Asia/Kolkata anyway so the window can never slip by one.
const todayInIndia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const addDays = (isoDate, days) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const formatDate = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

const money = (n) =>
  typeof n === "number" && n > 0
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : null;

// A FilterExpression is applied after the read, so the RCU cost is the whole
// table either way. Pulling the opted-in profiles in the same pass therefore
// costs nothing extra, where a follow-up BatchGetItem would add real reads.
const scanCandidates = async (targets) => {
  const profiles = new Map();
  const policies = [];
  let scanned = 0;

  const params = {
    TableName: TABLE_NAME,
    FilterExpression:
      "(#sk = :profileSk AND #opt = :true) OR " +
      "(begins_with(#sk, :policyPrefix) AND #status = :active AND #renewal IN (:d0, :d1, :d2))",
    ExpressionAttributeNames: {
      "#sk": "SK",
      "#opt": "reminderOptIn",
      "#status": "status",
      "#renewal": "renewalDate",
      "#email": "email",
    },
    ExpressionAttributeValues: {
      ":profileSk": "PROFILE",
      ":true": true,
      ":policyPrefix": "POLICY#",
      ":active": "active",
      ":d0": targets[0].date,
      ":d1": targets[1].date,
      ":d2": targets[2].date,
    },
    ProjectionExpression:
      "PK, #sk, #email, fullName, insurer, policyNumber, policyType, #renewal, #status, " +
      "reminderSent30, reminderSent15, reminderSent03",
  };

  for await (const page of paginateScan({ client: ddb }, params)) {
    scanned += page.ScannedCount || 0;
    for (const item of page.Items || []) {
      if (item.SK === "PROFILE") profiles.set(item.PK, item);
      else policies.push(item);
    }
    if (scanned >= MAX_SCAN_ITEMS) {
      console.warn("reminder scan hit item cap", { cap: MAX_SCAN_ITEMS });
      break;
    }
  }

  return { profiles, policies, scanned };
};

const buildEmail = ({ profile, policy, window }) => {
  const name = (profile.fullName || "").trim().split(/\s+/)[0] || "there";
  const insurer = policy.insurer || "your insurer";
  const kind = policy.policyType ? `${policy.policyType} policy` : "policy";
  const due = formatDate(policy.renewalDate);
  const sum = money(policy.sumAssured);

  const when =
    window.days === 30 ? "in 30 days" : window.days === 15 ? "in 15 days" : "in just 3 days";

  const subject = `Your ${insurer} ${kind} renews ${when} — ${due}`;

  const rows = [
    ["Insurer", insurer],
    ["Policy number", policy.policyNumber || "—"],
    ["Type", policy.policyType || "—"],
    ["Renewal date", due],
    sum ? ["Sum assured", sum] : null,
  ].filter(Boolean);

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f5f7;font-family:'IBM Plex Sans',Arial,sans-serif;color:#0F172A">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
    <p style="margin:0 0 4px;color:#B45309;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Renewal reminder</p>
    <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">Hello ${name}, your cover renews ${when}.</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6">
      Renewing on time keeps your cover continuous. A lapse can reset waiting periods and no-claim benefits.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 0;color:#8896a5;border-bottom:1px solid #dde3ee">${k}</td>` +
            `<td style="padding:8px 0;text-align:right;font-weight:600;border-bottom:1px solid #dde3ee">${v}</td></tr>`
        )
        .join("")}
    </table>
    <a href="${DASHBOARD_URL}" style="display:inline-block;background:#1E3A8A;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600">View my policies</a>
    <p style="margin:24px 0 0;color:#475569;font-size:14px;line-height:1.6">
      Questions about this renewal? Call Sachin Kathuria on
      <a href="tel:${ADVISOR_PHONE}" style="color:#1E3A8A">${ADVISOR_PHONE}</a>
      or message on <a href="${WHATSAPP}" style="color:#1E3A8A">WhatsApp</a>.
    </p>
    <p style="margin:20px 0 0;color:#8896a5;font-size:12px;line-height:1.5">
      You are receiving this because renewal reminders are switched on in your PolicyRaj dashboard.
      You can turn them off any time under Profile &amp; nominee.
    </p>
  </div>
</body></html>`;

  const text = [
    `Hello ${name}, your cover renews ${when}.`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `View your policies: ${DASHBOARD_URL}`,
    `Questions? Call Sachin Kathuria on ${ADVISOR_PHONE} or WhatsApp ${WHATSAPP}.`,
    "",
    "You are receiving this because renewal reminders are switched on in your",
    "PolicyRaj dashboard. You can turn them off under Profile & nominee.",
  ].join("\n");

  return { subject, html, text };
};

// The marker is claimed before the send, not after. A crash between the two
// loses one reminder; the other order risks emailing the same customer twice,
// which is the failure the marker exists to prevent. On a send failure the claim
// is rolled back so the next day retries.
const claimWindow = async (policy, window) => {
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: policy.PK, SK: policy.SK },
        UpdateExpression: "SET #w = :rd",
        ConditionExpression: "attribute_not_exists(#w) OR #w <> :rd",
        ExpressionAttributeNames: { "#w": window.attr },
        ExpressionAttributeValues: { ":rd": policy.renewalDate },
      })
    );
    return true;
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") return false;
    throw err;
  }
};

const releaseWindow = async (policy, window) => {
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: policy.PK, SK: policy.SK },
        UpdateExpression: "REMOVE #w",
        ConditionExpression: "#w = :rd",
        ExpressionAttributeNames: { "#w": window.attr },
        ExpressionAttributeValues: { ":rd": policy.renewalDate },
      })
    );
  } catch (err) {
    console.error("could not roll back reminder marker", {
      pk: policy.PK,
      sk: policy.SK,
      attr: window.attr,
      error: err.name,
    });
  }
};

export const handler = async (event) => {
  const dryRun = event?.dryRun === true;
  const today = todayInIndia();
  const targets = WINDOWS.map((w) => ({ ...w, date: addDays(today, w.days) }));

  log("sweep_start", {
    dryRun,
    today,
    windows: targets.map((t) => ({ days: t.days, renewalDate: t.date })),
  });

  const { profiles, policies, scanned } = await scanCandidates(targets);
  log("scan_complete", {
    itemsScanned: scanned,
    optedInProfiles: profiles.size,
    policiesInWindow: policies.length,
  });

  const summary = { dryRun, today, matched: 0, sent: 0, skippedAlreadySent: 0, skippedNoProfile: 0, failed: 0 };

  for (const policy of policies) {
    const window = targets.find((t) => t.date === policy.renewalDate);
    if (!window) continue;

    const profile = profiles.get(policy.PK);
    if (!profile || !profile.email) {
      // Should not happen: reminderOptIn and email are written by the same call.
      summary.skippedNoProfile += 1;
      log("skip_no_profile", { pk: policy.PK, sk: policy.SK, window: window.days });
      continue;
    }

    summary.matched += 1;

    const alreadySent = policy[window.attr] === policy.renewalDate;
    const detail = {
      email: profile.email,
      name: profile.fullName || "",
      insurer: policy.insurer || "",
      policyNumber: policy.policyNumber || "",
      policyType: policy.policyType || "",
      renewalDate: policy.renewalDate,
      window: window.days,
      marker: window.attr,
      alreadySent,
    };

    if (dryRun) {
      log("dry_run_match", { ...detail, wouldSend: !alreadySent });
      if (alreadySent) summary.skippedAlreadySent += 1;
      continue;
    }

    if (alreadySent) {
      summary.skippedAlreadySent += 1;
      log("skip_already_sent", detail);
      continue;
    }

    if (!(await claimWindow(policy, window))) {
      summary.skippedAlreadySent += 1;
      log("skip_claimed_concurrently", detail);
      continue;
    }

    try {
      const { subject, html, text } = buildEmail({ profile, policy, window });
      await ses.send(
        new SendEmailCommand({
          Source: `${SENDER_NAME} <${FROM}>`,
          Destination: { ToAddresses: [profile.email] },
          Message: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
              Html: { Data: html, Charset: "UTF-8" },
              Text: { Data: text, Charset: "UTF-8" },
            },
          },
        })
      );
      summary.sent += 1;
      log("sent", detail);
    } catch (err) {
      summary.failed += 1;
      console.error("send failed, rolling back marker", { ...detail, error: err.name, message: err.message });
      await releaseWindow(policy, window);
    }
  }

  log("sweep_complete", summary);
  return summary;
};

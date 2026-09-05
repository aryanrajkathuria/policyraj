// Copied into each function's build directory by 06-lambdas.sh — single source, no Lambda layer.
import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  tokenUse: "id",
  clientId: process.env.APP_CLIENT_ID,
});

export const TABLE_NAME = process.env.TABLE_NAME;
export const BUCKET_NAME = process.env.BUCKET_NAME;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (v) => typeof v === "string" && UUID_RE.test(v);

// CORS headers are emitted by the Function URL's own CORS config, not here —
// returning them from code too would duplicate the header and browsers reject that.
export const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const unauthorized = () => json(401, { error: "unauthorized" });
export const forbidden = () => json(403, { error: "forbidden" });
export const notFound = () => json(404, { error: "not_found" });
export const badRequest = (message = "bad_request") => json(400, { error: message });

export const authenticate = async (event) => {
  const token = (event.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return { error: unauthorized() };
  try {
    return { claims: await verifier.verify(token) };
  } catch {
    return { error: unauthorized() };
  }
};

export const parseBody = (event) => {
  if (!event.body) return {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const method = (event) => event.requestContext?.http?.method || "";

// Keeps only whitelisted keys with defined values. This is what stops a client
// smuggling fields like isAdmin or cognito:groups into an update expression.
export const pick = (source, allowed) => {
  const out = {};
  if (!source || typeof source !== "object") return out;
  for (const key of allowed) {
    if (source[key] !== undefined && source[key] !== null) out[key] = source[key];
  }
  return out;
};

export const buildUpdate = (fields) => {
  const names = {};
  const values = {};
  const sets = [];
  let i = 0;
  for (const [key, value] of Object.entries(fields)) {
    const n = `#f${i}`;
    const v = `:v${i}`;
    names[n] = key;
    values[v] = value;
    sets.push(`${n} = ${v}`);
    i += 1;
  }
  return { names, values, sets };
};

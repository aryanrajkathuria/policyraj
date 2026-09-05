import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand, paginateScan } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  TABLE_NAME,
  BUCKET_NAME,
  authenticate,
  parseBody,
  method,
  json,
  notFound,
  forbidden,
  badRequest,
  isUuid,
} from "./common.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const DOWNLOAD_EXPIRY = 600;
const CACHE_MS = 60_000;
const MAX_SCAN_ITEMS = 20000;
const DEFAULT_FEED_LIMIT = 50;
const MAX_FEED_LIMIT = 200;

const USER_PREFIX = "USER#";
const subOf = (pk) => pk.slice(USER_PREFIX.length);

let cache = { at: 0, items: null };

// One unfiltered Scan feeds both listCustomers and getActivityFeed. A Scan reads
// every item before a FilterExpression is applied, so filtering server-side would
// cost the same and still leave policyCount uncomputable from PROFILE items alone.
const scanAll = async () => {
  if (cache.items && Date.now() - cache.at < CACHE_MS) return cache.items;

  const items = [];
  for await (const page of paginateScan({ client: ddb }, { TableName: TABLE_NAME })) {
    items.push(...(page.Items || []));
    if (items.length >= MAX_SCAN_ITEMS) {
      console.warn("admin scan hit item cap", { cap: MAX_SCAN_ITEMS });
      break;
    }
  }

  cache = { at: Date.now(), items };
  return items;
};

const listCustomers = async () => {
  const items = await scanAll();
  const profiles = new Map();
  const policyCounts = new Map();
  const lastActivity = new Map();

  for (const item of items) {
    const sub = subOf(item.PK);
    if (item.SK === "PROFILE") {
      profiles.set(sub, item);
    } else if (item.SK.startsWith("POLICY#")) {
      policyCounts.set(sub, (policyCounts.get(sub) || 0) + 1);
    } else if (item.SK.startsWith("ACTIVITY#")) {
      const at = item.createdAt || "";
      if (at > (lastActivity.get(sub) || "")) lastActivity.set(sub, at);
    }
  }

  const customers = [...profiles.entries()].map(([userId, profile]) => ({
    userId,
    fullName: profile.fullName || "",
    email: profile.email || "",
    phone: profile.phone || "",
    policyCount: policyCounts.get(userId) || 0,
    lastActivityAt: lastActivity.get(userId) || null,
  }));

  customers.sort((a, b) => (b.lastActivityAt || "").localeCompare(a.lastActivityAt || ""));
  return json(200, { customers });
};

const getCustomer = async (body) => {
  const { userId } = body;
  if (!isUuid(userId)) return badRequest("invalid userId");

  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": `${USER_PREFIX}${userId}` },
    })
  );

  if (Items.length === 0) return notFound();

  let profile = null;
  const policies = [];
  const activity = [];

  for (const item of Items) {
    const { PK, SK, ...rest } = item;
    if (SK === "PROFILE") profile = rest;
    else if (SK.startsWith("POLICY#")) {
      policies.push({ ...rest, policyId: SK.slice("POLICY#".length) });
    } else if (SK.startsWith("ACTIVITY#")) {
      activity.push({ ...rest, timestamp: rest.createdAt || "" });
    }
  }

  activity.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return json(200, { profile, policies, activity });
};

const getActivityFeed = async (body) => {
  const requested = Number(body.limit);
  const limit = Math.min(
    Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : DEFAULT_FEED_LIMIT,
    MAX_FEED_LIMIT
  );

  const items = await scanAll();
  const activity = items
    .filter((item) => item.SK.startsWith("ACTIVITY#"))
    .map((item) => ({
      timestamp: item.createdAt || "",
      type: item.type || "",
      summary: item.summary || "",
      customerName: item.customerName || "",
      customerEmail: item.customerEmail || "",
      userId: subOf(item.PK),
      policyId: item.policyId || null,
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);

  return json(200, { activity });
};

const getDocumentUrl = async (claims, body) => {
  const { userId, policyId } = body;
  if (!isUuid(userId) || !isUuid(policyId)) return badRequest("invalid userId or policyId");

  const { Item } = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `${USER_PREFIX}${userId}`, SK: `POLICY#${policyId}` },
    })
  );

  if (!Item || !Item.s3Key) return notFound();

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: Item.s3Key }),
    { expiresIn: DOWNLOAD_EXPIRY }
  );

  // Audit trail: the owner opening a customer's document is a recorded event.
  console.log(
    JSON.stringify({
      audit: "admin_document_access",
      adminSub: claims.sub,
      targetUserId: userId,
      policyId,
      timestamp: new Date().toISOString(),
    })
  );

  return json(200, { url, expiresIn: DOWNLOAD_EXPIRY });
};

export const handler = async (event) => {
  if (method(event) !== "POST") return json(405, { error: "method_not_allowed" });

  const { claims, error } = await authenticate(event);
  if (error) return error;

  const groups = claims["cognito:groups"] || [];
  if (!groups.includes("admin")) {
    return forbidden();
  }

  const body = parseBody(event);
  const action = body.action;

  try {
    switch (action) {
      case "listCustomers":
        return await listCustomers();
      case "getCustomer":
        return await getCustomer(body);
      case "getActivityFeed":
        return await getActivityFeed(body);
      case "getDocumentUrl":
        return await getDocumentUrl(claims, body);
      default:
        return badRequest("unknown_action");
    }
  } catch (err) {
    console.error("admin handler failed", { action, name: err.name, message: err.message });
    return json(500, { error: "internal_error" });
  }
};

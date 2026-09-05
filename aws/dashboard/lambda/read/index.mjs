import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
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
  badRequest,
} from "./common.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const DOWNLOAD_EXPIRY = 600;

const stripKeys = ({ PK, SK, ...rest }) => rest;

const getDashboard = async (userId) => {
  // SK range starts at "POLICY#" so ACTIVITY# items sort below it and are never read.
  // Activity is admin-feed data; the customer pays no read cost for it.
  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND SK >= :from",
      ExpressionAttributeValues: { ":pk": `USER#${userId}`, ":from": "POLICY#" },
    })
  );

  let profile = null;
  const policies = [];
  for (const item of Items) {
    if (item.SK === "PROFILE") profile = stripKeys(item);
    else if (item.SK.startsWith("POLICY#")) {
      policies.push({ ...stripKeys(item), policyId: item.SK.slice("POLICY#".length) });
    }
  }

  return json(200, { profile, policies });
};

const getDownloadUrl = async (userId, body) => {
  const { policyId } = body;
  if (typeof policyId !== "string" || !policyId) return badRequest("policyId required");

  const { Item } = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `POLICY#${policyId}` },
    })
  );

  // 404 rather than 403 — a policy belonging to someone else must be
  // indistinguishable from one that does not exist.
  if (!Item || !Item.s3Key) return notFound();

  const prefix = `users/${userId}/`;
  if (!Item.s3Key.startsWith(prefix)) {
    console.error("s3Key outside caller prefix", { policyId });
    return notFound();
  }

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: Item.s3Key }),
    { expiresIn: DOWNLOAD_EXPIRY }
  );

  return json(200, { url, expiresIn: DOWNLOAD_EXPIRY });
};

export const handler = async (event) => {
  if (method(event) !== "POST") return json(405, { error: "method_not_allowed" });

  const { claims, error } = await authenticate(event);
  if (error) return error;

  const userId = claims.sub;
  const body = parseBody(event);
  const action = body.action;

  try {
    switch (action) {
      case "getDashboard":
        return await getDashboard(userId);
      case "getDownloadUrl":
        return await getDownloadUrl(userId, body);
      default:
        return badRequest("unknown_action");
    }
  } catch (err) {
    console.error("read handler failed", { action, name: err.name, message: err.message });
    return json(500, { error: "internal_error" });
  }
};

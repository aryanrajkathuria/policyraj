import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
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
  pick,
  buildUpdate,
  isUuid,
} from "./common.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const s3 = new S3Client({});

const UPLOAD_EXPIRY = 300;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACTIVITY_TTL_DAYS = 180;

const PROFILE_FIELDS = [
  "fullName",
  "phone",
  "address",
  "city",
  "pincode",
  "nomineeName",
  "nomineeRelation",
  "nomineeDob",
  "reminderOptIn",
];

// s3Key, fileName, fileSizeBytes and uploadedAt are deliberately absent —
// only confirmUpload may set those, and only from a server-built key.
const POLICY_FIELDS = [
  "insurer",
  "policyNumber",
  "policyType",
  "sumAssured",
  "premium",
  "premiumFrequency",
  "startDate",
  "renewalDate",
  "status",
];

const writeActivity = async (claims, { type, summary, policyId }) => {
  const now = new Date();
  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${claims.sub}`,
          SK: `ACTIVITY#${now.toISOString()}#${randomUUID().slice(0, 8)}`,
          type,
          summary,
          policyId,
          customerEmail: claims.email || "",
          customerName: claims.name || "",
          createdAt: now.toISOString(),
          expiresAt: Math.floor(now.getTime() / 1000) + ACTIVITY_TTL_DAYS * 86400,
        },
      })
    );
  } catch (err) {
    // The feed is a convenience. It must never fail a customer's action.
    console.error("activity write failed", { type, name: err.name, message: err.message });
  }
};

const sanitizeFileName = (raw) => {
  const cleaned = String(raw || "")
    .replace(/[\\/]/g, "")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .replace(/^\.+/, "");
  const stem = cleaned.replace(/\.pdf$/i, "") || "document";
  return `${stem.slice(0, 96)}.pdf`;
};

const requirePolicy = async (userId, policyId) => {
  if (!isUuid(policyId)) return null;
  const { Item } = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `POLICY#${policyId}` },
    })
  );
  return Item || null;
};

const updateProfile = async (claims, body) => {
  const fields = pick(body.data, PROFILE_FIELDS);
  // email is taken from the verified token, never from the request body, so a
  // customer cannot present a different address to the owner's admin screens.
  fields.email = claims.email || "";

  const { names, values, sets } = buildUpdate(fields);
  const now = new Date().toISOString();

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${claims.sub}`, SK: "PROFILE" },
      UpdateExpression: `SET ${[...sets, "updatedAt = :now", "createdAt = if_not_exists(createdAt, :now)"].join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ":now": now },
    })
  );

  await writeActivity(claims, { type: "profile_updated", summary: "Updated profile details" });
  return json(200, { ok: true });
};

const createPolicy = async (claims, body) => {
  const policyId = randomUUID();
  const now = new Date().toISOString();
  const data = pick(body.data, POLICY_FIELDS);

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${claims.sub}`,
        SK: `POLICY#${policyId}`,
        ...data,
        status: data.status || "active",
        createdAt: now,
        updatedAt: now,
      },
    })
  );

  await writeActivity(claims, {
    type: "policy_created",
    summary: `Added ${data.insurer || "a"} policy ${data.policyNumber || ""}`.trim(),
    policyId,
  });

  return json(201, { policyId });
};

const updatePolicy = async (claims, body) => {
  const { policyId } = body;
  if (!isUuid(policyId)) return notFound();

  const fields = pick(body.data, POLICY_FIELDS);
  const { names, values, sets } = buildUpdate(fields);

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${claims.sub}`, SK: `POLICY#${policyId}` },
        UpdateExpression: `SET ${[...sets, "updatedAt = :now"].join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: { ...values, ":now": new Date().toISOString() },
        ConditionExpression: "attribute_exists(PK)",
      })
    );
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") return notFound();
    throw err;
  }

  await writeActivity(claims, {
    type: "policy_updated",
    summary: `Updated policy ${fields.policyNumber || policyId.slice(0, 8)}`,
    policyId,
  });

  return json(200, { ok: true });
};

const getUploadUrl = async (claims, body) => {
  const { policyId, fileName, contentType } = body;

  if (contentType !== "application/pdf") return badRequest("only application/pdf is accepted");

  const policy = await requirePolicy(claims.sub, policyId);
  if (!policy) return notFound();

  const safeName = sanitizeFileName(fileName);
  const s3Key = `users/${claims.sub}/policies/${policyId}/${safeName}`;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key, ContentType: "application/pdf" }),
    { expiresIn: UPLOAD_EXPIRY }
  );

  return json(200, { url, s3Key, expiresIn: UPLOAD_EXPIRY });
};

const confirmUpload = async (claims, body) => {
  const { policyId, s3Key } = body;
  const prefix = `users/${claims.sub}/`;

  if (typeof s3Key !== "string" || !s3Key.startsWith(prefix)) return forbidden();

  const policy = await requirePolicy(claims.sub, policyId);
  if (!policy) return notFound();

  let head;
  try {
    head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));
  } catch {
    return badRequest("upload not found");
  }

  const fileSizeBytes = head.ContentLength ?? 0;
  if (fileSizeBytes > MAX_UPLOAD_BYTES) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key })).catch(() => {});
    return badRequest("file exceeds 10 MB");
  }

  const fileName = s3Key.split("/").pop();
  const now = new Date().toISOString();

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${claims.sub}`, SK: `POLICY#${policyId}` },
      UpdateExpression:
        "SET s3Key = :k, fileName = :f, fileSizeBytes = :s, uploadedAt = :now, updatedAt = :now",
      ExpressionAttributeValues: {
        ":k": s3Key,
        ":f": fileName,
        ":s": fileSizeBytes,
        ":now": now,
      },
      ConditionExpression: "attribute_exists(PK)",
    })
  );

  await writeActivity(claims, {
    type: "document_uploaded",
    summary: `Uploaded ${fileName}`,
    policyId,
  });

  return json(200, { ok: true });
};

const deletePolicy = async (claims, body) => {
  const { policyId } = body;
  const policy = await requirePolicy(claims.sub, policyId);
  if (!policy) return notFound();

  await ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${claims.sub}`, SK: `POLICY#${policyId}` },
    })
  );

  if (policy.s3Key && policy.s3Key.startsWith(`users/${claims.sub}/`)) {
    await s3
      .send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: policy.s3Key }))
      .catch((err) => console.error("s3 delete failed", { name: err.name }));
  }

  await writeActivity(claims, {
    type: "policy_deleted",
    summary: `Deleted policy ${policy.policyNumber || policyId.slice(0, 8)}`,
    policyId,
  });

  return json(200, { ok: true });
};

export const handler = async (event) => {
  if (method(event) !== "POST") return json(405, { error: "method_not_allowed" });

  const { claims, error } = await authenticate(event);
  if (error) return error;

  const body = parseBody(event);
  const action = body.action;

  try {
    switch (action) {
      case "updateProfile":
        return await updateProfile(claims, body);
      case "createPolicy":
        return await createPolicy(claims, body);
      case "updatePolicy":
        return await updatePolicy(claims, body);
      case "getUploadUrl":
        return await getUploadUrl(claims, body);
      case "confirmUpload":
        return await confirmUpload(claims, body);
      case "deletePolicy":
        return await deletePolicy(claims, body);
      default:
        return badRequest("unknown_action");
    }
  } catch (err) {
    console.error("save handler failed", { action, name: err.name, message: err.message });
    return json(500, { error: "internal_error" });
  }
};

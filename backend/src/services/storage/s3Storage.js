/**
 * Real S3 storage for private artwork uploads — follows the old backend's
 * pattern (primelinor-bulk/backend/src/services/s3.js) for client setup,
 * but PutObjectCommand has no ACL (artwork is private by design, unlike
 * that backend's public product images) and reads go through a signed URL
 * (getSignedReadUrl) rather than a public S3_BASE_URL. Not exercised by
 * tests in this sandbox (no AWS credentials available) — see
 * src/services/storage/index.js for how this is selected only when
 * AWS_S3_BUCKET + credentials are actually configured.
 */
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const S3_BUCKET = process.env.AWS_S3_BUCKET;
const S3_REGION = process.env.AWS_REGION || "ap-south-1";

const s3Client = new S3Client({
  region: S3_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

async function putObject({ buffer, contentType, key }) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return key;
}

async function getSignedReadUrl(key, { expiresInSeconds = 900 } = {}) {
  return getSignedUrl(s3Client, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), {
    expiresIn: expiresInSeconds,
  });
}

async function deleteObject(key) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

module.exports = { putObject, getSignedReadUrl, deleteObject };

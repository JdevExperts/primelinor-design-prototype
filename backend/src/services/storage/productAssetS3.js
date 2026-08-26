/**
 * Product images are catalogue content and generally public (Phase 5 §27),
 * unlike private customer artwork (s3Storage.js) — so reads here return a
 * plain, permanent public URL instead of a short-lived signed one. This
 * deliberately does not set an object ACL: modern S3 buckets commonly have
 * ACLs disabled entirely (Object Ownership: bucket-owner-enforced), so an
 * explicit `public-read` ACL would fail on exactly the buckets a real
 * deployment is likely to use. Making the `products/` prefix publicly
 * readable is a bucket-policy/CloudFront concern for deployment, same as
 * how the existing production S3 bucket's own access story is already
 * documented as out of this codebase's control (see backend/README.md).
 */
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

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

function buildPublicUrl(key) {
  if (process.env.S3_BASE_URL) {
    return `${process.env.S3_BASE_URL.replace(/\/+$/, "")}/${key}`;
  }
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

async function deleteObject(key) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

module.exports = { putObject, buildPublicUrl, deleteObject };

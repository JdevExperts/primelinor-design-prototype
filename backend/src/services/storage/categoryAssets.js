/**
 * Selector module for category-image storage — deliberately reuses
 * productAssetS3.js/productAssetLocal.js's `putObject`/`buildPublicUrl`/
 * `deleteObject` directly rather than standing up a second AWS client:
 * those functions are generic (bucket/region from env, key supplied by
 * the caller) and were never actually product-specific despite the file
 * name — only the key *convention* differs, which is exactly what
 * `generateCategoryAssetKey` (categoryAssetKeys.js) supplies. Category
 * images are public, permanent catalogue content, same storage class as
 * product images — the same production fail-fast guard applies.
 */
const { hasObjectStorageConfigured } = require("../../startup/validateConfig");
const s3 = require("./productAssetS3");
const local = require("./productAssetLocal");
const { generateCategoryAssetKey } = require("./categoryAssetKeys");

const USE_S3 = hasObjectStorageConfigured(process.env);

if (!USE_S3 && process.env.NODE_ENV === "production") {
  throw new Error(
    "Refusing to use local-disk category-image storage in production. Configure AWS_S3_BUCKET, " +
      "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY — see .env.example.",
  );
}

const impl = USE_S3 ? s3 : local;

module.exports = {
  isS3: USE_S3,
  generateCategoryAssetKey,
  putObject: impl.putObject,
  buildPublicUrl: impl.buildPublicUrl,
  deleteObject: impl.deleteObject,
};

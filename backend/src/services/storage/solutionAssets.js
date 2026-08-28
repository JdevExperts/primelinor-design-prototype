/**
 * Selector module for Solution hero-image storage — reuses
 * productAssetS3.js/productAssetLocal.js's `putObject`/`buildPublicUrl`/
 * `deleteObject` directly, same as categoryAssets.js, rather than standing
 * up a third AWS client. Only the key convention differs (solutionAssetKeys.js).
 */
const { hasObjectStorageConfigured } = require("../../startup/validateConfig");
const s3 = require("./productAssetS3");
const local = require("./productAssetLocal");
const { generateSolutionAssetKey } = require("./solutionAssetKeys");

const USE_S3 = hasObjectStorageConfigured(process.env);

if (!USE_S3 && process.env.NODE_ENV === "production") {
  throw new Error(
    "Refusing to use local-disk solution-image storage in production. Configure AWS_S3_BUCKET, " +
      "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY — see .env.example.",
  );
}

const impl = USE_S3 ? s3 : local;

module.exports = {
  isS3: USE_S3,
  generateSolutionAssetKey,
  putObject: impl.putObject,
  buildPublicUrl: impl.buildPublicUrl,
  deleteObject: impl.deleteObject,
};

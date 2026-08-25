/**
 * Storage abstraction: real S3 in any environment with AWS credentials
 * configured, local disk otherwise. Every caller (artwork upload/attach
 * controllers, the cleanup script) imports from here — never from
 * s3Storage.js/localStorage.js directly — so the choice is made in exactly
 * one place.
 *
 * Production Hardening Patch §7: server.js's centralized startup
 * validation (src/startup/validateConfig.js) already refuses to boot the
 * HTTP server when NODE_ENV=production has no S3 configured — this
 * module-level guard is the second, independent layer for any other
 * entry point that loads storage without going through that validated
 * boot sequence (e.g. a one-off script). LocalStorage silently "working"
 * in production is exactly the failure mode being closed: on most hosts
 * its disk is ephemeral, so artwork would appear to upload successfully
 * and then vanish on the next deploy.
 */
const { hasObjectStorageConfigured } = require("../../startup/validateConfig");
const s3Storage = require("./s3Storage");
const localStorage = require("./localStorage");
const { generateArtworkKey } = require("./keys");

const USE_S3 = hasObjectStorageConfigured(process.env);

if (!USE_S3 && process.env.NODE_ENV === "production") {
  throw new Error(
    "Refusing to use local-disk artwork storage in production. Configure AWS_S3_BUCKET, " +
      "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY — see .env.example.",
  );
}

const impl = USE_S3 ? s3Storage : localStorage;

module.exports = {
  isS3: USE_S3,
  generateArtworkKey,
  putObject: impl.putObject,
  getSignedReadUrl: impl.getSignedReadUrl,
  deleteObject: impl.deleteObject,
};

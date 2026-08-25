/**
 * Storage abstraction: real S3 in any environment with AWS credentials
 * configured, local disk otherwise. Every caller (artwork upload/attach
 * controllers, the cleanup script) imports from here — never from
 * s3Storage.js/localStorage.js directly — so the choice is made in exactly
 * one place.
 */
const s3Storage = require("./s3Storage");
const localStorage = require("./localStorage");
const { generateArtworkKey } = require("./keys");

const USE_S3 = Boolean(
  process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
);

const impl = USE_S3 ? s3Storage : localStorage;

module.exports = {
  isS3: USE_S3,
  generateArtworkKey,
  putObject: impl.putObject,
  getSignedReadUrl: impl.getSignedReadUrl,
  deleteObject: impl.deleteObject,
};

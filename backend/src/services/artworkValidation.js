/**
 * Server-side artwork validation — the frontend's validateArtworkFile()
 * (src/utils/artworkValidation.js) is a UX nicety only; a client-reported
 * MIME type is never trusted here. Two checks, deliberately dependency-free:
 *
 *  1. Magic-byte sniffing — the actual file content must match one of the
 *     three accepted formats, regardless of what Content-Type/extension it
 *     arrived with.
 *  2. SVG sanitization — SVG is XML and can carry <script>, event-handler
 *     attributes, or javascript: URIs. A full sanitizer library (DOMPurify)
 *     is deliberately not pulled in for one upload endpoint; this strips
 *     the specific known-dangerous constructs via regex, which is
 *     sufficient for a case where the worst outcome of a miss is "an
 *     internal reviewer later opens a malicious SVG," not "a public page
 *     renders user SVG to arbitrary visitors."
 */
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

function looksLikePng(buffer) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return sig.every((byte, i) => buffer[i] === byte);
}

function looksLikeJpeg(buffer) {
  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function looksLikeSvg(buffer) {
  // SVGs are plain text — sniff the first ~1KB for an <svg tag, allowing a
  // leading BOM, XML declaration, doctype, or comments before it.
  const head = buffer.subarray(0, 1024).toString("utf8").replace(/^﻿/, "").trimStart();
  return /^(<\?xml[^>]*>\s*)?(<!DOCTYPE[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head);
}

/** Returns the sniffed MIME type, or null if the content matches none of the accepted formats. */
function detectMimeType(buffer) {
  if (looksLikePng(buffer)) return "image/png";
  if (looksLikeJpeg(buffer)) return "image/jpeg";
  if (looksLikeSvg(buffer)) return "image/svg+xml";
  return null;
}

/** Validates size + sniffed content type. Does NOT trust file.mimetype. */
function validateUploadedFile(file) {
  if (!file || !file.buffer?.length) {
    return { ok: false, message: "No file was received." };
  }
  if (file.size > MAX_SIZE_BYTES || file.buffer.length > MAX_SIZE_BYTES) {
    return { ok: false, message: "File is too large — please keep it under 10 MB." };
  }
  const detected = detectMimeType(file.buffer);
  if (!detected || !ACCEPTED_TYPES.includes(detected)) {
    return { ok: false, message: "Please upload a PNG, JPG or SVG file." };
  }
  return { ok: true, mimeType: detected };
}

const DANGEROUS_TAG_RE = /<\s*(script|foreignObject|iframe|embed|object)[\s\S]*?<\s*\/\s*\1\s*>/gi;
const SELF_CLOSING_DANGEROUS_RE = /<\s*(script|foreignObject|iframe|embed|object)[^>]*\/?>/gi;
const EVENT_HANDLER_ATTR_RE = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URI_RE = /(href|xlink:href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi;

/**
 * Strips script tags, embedded foreign content, event-handler attributes,
 * and javascript: URIs from an SVG's source text. Operates on raw text
 * (no XML parser dependency) — safe because it only ever removes content,
 * never rewrites structure, so a false-negative match leaves markup intact
 * rather than corrupting valid SVG.
 */
function sanitizeSvg(svgText) {
  return svgText
    .replace(DANGEROUS_TAG_RE, "")
    .replace(SELF_CLOSING_DANGEROUS_RE, "")
    .replace(EVENT_HANDLER_ATTR_RE, "")
    .replace(JS_URI_RE, "$1=$2#$2");
}

module.exports = { MAX_SIZE_BYTES, ACCEPTED_TYPES, detectMimeType, validateUploadedFile, sanitizeSvg };

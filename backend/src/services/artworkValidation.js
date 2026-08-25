/**
 * Server-side artwork validation — the frontend's validateArtworkFile()
 * (src/utils/artworkValidation.js) is a UX nicety only; a client-reported
 * MIME type is never trusted here.
 *
 *  1. Magic-byte sniffing — the actual file content must match one of the
 *     three accepted formats, regardless of what Content-Type/extension it
 *     arrived with.
 *  2. SVG sanitization — real parser-based sanitization via DOMPurify +
 *     jsdom (Production Hardening Patch §2). The original regex-only
 *     approach was explicitly flagged in the Post-Phase-4 audit as not
 *     production-safe: SVG is XML, and regex substitution over arbitrary
 *     nesting/encoding tricks (obfuscated tag casing, entity encoding,
 *     namespace confusion) is exactly the class of bypass a real parser
 *     closes. DOMPurify is the de-facto standard sanitizer maintained by
 *     the Cure53 security team; jsdom is its recommended server-side DOM.
 *     Sanitization is now the primary defense, but is *not* the only one —
 *     see artworkPreview.controller.js / admin PDF-adjacent download
 *     routes, which additionally force Content-Disposition: attachment so
 *     a sanitizer bypass still can't execute inline from the app origin.
 */
const { JSDOM } = require("jsdom");

// One jsdom window for the process — sanitizing is a pure, synchronous,
// side-effect-free operation per call, so there's no reason to spin up a
// fresh JSDOM instance (relatively expensive) per upload. This installed
// version of dompurify's CJS build calls its own environment auto-detect
// at require()-time, which throws unless a global `window`/`document`
// already exists — so, unlike its README example, jsdom must be created
// and installed as globals *before* requiring dompurify, not after.
//
// That global `window`/`document` is only needed for this one require()
// call — createDOMPurify(purifyWindow) closes over purifyWindow directly,
// so the returned DOMPurify instance keeps working correctly afterward.
// Leaving global.window/global.document set for the rest of the process
// is not just unnecessary, it's actively dangerous: pdfkit (loaded
// elsewhere for quotePdf.js) feature-detects a browser environment via
// `typeof document !== 'undefined'` and, once tricked into thinking it's
// in a browser, tries to resolve its own asset URLs relative to
// `document.baseURI` — which jsdom defaults to "about:blank", crashing
// pdfkit's require with `TypeError: Invalid URL`. So these globals are
// restored to whatever they were (almost always undefined) immediately
// after DOMPurify is constructed.
const purifyWindow = new JSDOM("").window;
const hadGlobalWindow = Object.prototype.hasOwnProperty.call(global, "window");
const hadGlobalDocument = Object.prototype.hasOwnProperty.call(global, "document");
const previousGlobalWindow = global.window;
const previousGlobalDocument = global.document;
if (!global.window) global.window = purifyWindow;
if (!global.document) global.document = purifyWindow.document;
const createDOMPurify = require("dompurify");
const DOMPurify = createDOMPurify(purifyWindow);
if (global.window === purifyWindow) {
  if (hadGlobalWindow) global.window = previousGlobalWindow;
  else delete global.window;
}
if (global.document === purifyWindow.document) {
  if (hadGlobalDocument) global.document = previousGlobalDocument;
  else delete global.document;
}

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

// Tags that can carry or load executable/foreign content, forbidden
// outright regardless of DOMPurify's own SVG profile defaults — explicit
// rather than relied-upon-implicitly, so this list is the one place that
// answers "what's blocked" without reading DOMPurify's source.
const FORBIDDEN_SVG_TAGS = ["script", "foreignObject", "iframe", "embed", "object"];

/**
 * Real parser-based SVG sanitization (DOMPurify, configured for SVG).
 * Parses the actual DOM tree rather than pattern-matching text, so
 * obfuscation tricks that defeat regex (mixed casing, HTML entities,
 * duplicate/nested attributes, namespace confusion) don't help an
 * attacker — DOMPurify normalizes the tree before applying its
 * allow/forbid rules. Removes <script>, event-handler attributes (on*),
 * javascript:/data: URIs in href-like attributes, and foreign/embedded
 * content (foreignObject, iframe, embed, object). A structurally invalid
 * SVG is handled gracefully by the underlying parser (auto-corrected, not
 * thrown) — the file was already confirmed to start with a real <svg> tag
 * by detectMimeType() before this ever runs.
 */
function sanitizeSvg(svgText) {
  return DOMPurify.sanitize(svgText, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: FORBIDDEN_SVG_TAGS,
  });
}

module.exports = { MAX_SIZE_BYTES, ACCEPTED_TYPES, detectMimeType, validateUploadedFile, sanitizeSvg };

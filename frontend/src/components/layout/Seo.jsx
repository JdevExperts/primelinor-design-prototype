import { useEffect } from "react";

/**
 * Per-route document <head> metadata for this client-rendered SPA (Phase
 * 6B §30/§31/§33) — title, meta description, canonical, Open Graph and
 * Twitter Card tags, plus an explicit noindex escape hatch for
 * customer-private (quote token) and workflow-only (Studio) routes.
 *
 * No dependency added (no react-helmet-async) — every tag is upserted
 * directly into document.head via a stable `data-seo` marker, matching
 * this codebase's existing `useEffect(() => { document.title = ... })`
 * convention (already used by every page) rather than introducing a new
 * pattern. Canonical/OG URLs are built from `window.location` rather than
 * a hardcoded production domain, since none has been chosen yet — this
 * self-corrects the moment the app is deployed to its real domain.
 *
 * `ogImage`, when given, should be an absolute URL (a real product/
 * solution photo already is, via its S3 URL) — no site-wide default image
 * exists yet (nothing suitable to fabricate), so pages without a real
 * photo simply omit og:image/twitter:image rather than point at something
 * unsuitable.
 */
function upsertMeta(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"][data-seo]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    tag.setAttribute("data-seo", "true");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"][data-seo]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    tag.setAttribute("data-seo", "true");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function removeMeta(attr, key) {
  document.head.querySelector(`meta[${attr}="${key}"][data-seo]`)?.remove();
}

export default function Seo({ title, description, ogType = "website", ogImage, noindex = false }) {
  useEffect(() => {
    if (title) document.title = title;

    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    upsertLink("canonical", canonicalUrl);

    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", canonicalUrl);
    if (ogImage) {
      upsertMeta("property", "og:image", ogImage);
      upsertMeta("name", "twitter:card", "summary_large_image");
      upsertMeta("name", "twitter:image", ogImage);
    } else {
      removeMeta("property", "og:image");
      upsertMeta("name", "twitter:card", "summary");
      removeMeta("name", "twitter:image");
    }
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    if (noindex) {
      upsertMeta("name", "robots", "noindex, nofollow");
    } else {
      removeMeta("name", "robots");
    }
  }, [title, description, ogType, ogImage, noindex]);

  return null;
}

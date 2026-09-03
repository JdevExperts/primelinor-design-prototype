import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import Footer from "./Footer";
import Header from "./Header";
import { socialLinks } from "../../data/siteConfig";
import { trust } from "../../data/homeData";

/**
 * Conservative, site-wide Organization JSON-LD (Phase 6B §39) — mounted
 * once, not per-page. Deliberately no LocalBusiness (no confirmed
 * production address yet) and no AggregateRating/Review (self-hosted
 * rating markup doesn't meet Google's rich-result eligibility rules
 * without a compliant third-party aggregator; the real 4.8/28-review
 * figure is shown to customers in the homepage trust section instead,
 * linking out to the real Google listing rather than asserted as schema
 * here). `url` is built from window.location.origin rather than a
 * hardcoded domain — no production domain has been chosen yet.
 */
function injectOrganizationJsonLd() {
  const existing = document.head.querySelector('script[data-seo="org-jsonld"]');
  if (existing) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo", "org-jsonld");
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PrimeLinor",
    url: window.location.origin,
    description: "Custom apparel, corporate gifts, promotional products and kits for businesses.",
    sameAs: [...socialLinks.map((s) => s.url), trust.rating.url],
  });
  document.head.appendChild(script);
}

function scrollToHash(hash) {
  const id = hash.replace(/^#/, "");
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default function SiteLayout() {
  const location = useLocation();

  useEffect(() => {
    injectOrganizationJsonLd();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const frame = requestAnimationFrame(() => {
        if (!scrollToHash(location.hash)) {
          window.setTimeout(() => scrollToHash(location.hash), 50);
        }
      });
      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo(0, 0);
    return undefined;
  }, [location.pathname, location.hash, location.key]);

  return (
    <div id="top">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <AnnouncementBar />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

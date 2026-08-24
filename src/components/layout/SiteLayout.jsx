import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import Footer from "./Footer";
import Header from "./Header";

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

  /**
   * Every route's page component sets its own document.title, except these
   * two — Home has no page-level effect for it, and the listing page has
   * no per-item variation to justify one. Every other route is left alone
   * here rather than maintained as a growing list of exceptions.
   */
  useEffect(() => {
    if (location.pathname === "/") {
      document.title = "PrimeLinor — Custom Products for Your Brand";
      return;
    }
    if (location.pathname === "/products") {
      document.title = "Products — PrimeLinor";
    }
  }, [location.pathname]);

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

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

  useEffect(() => {
    if (location.pathname.startsWith("/customize")) {
      return;
    }
    if (location.pathname === "/products") {
      document.title = "Products — PrimeLinor";
      return;
    }
    if (location.pathname.startsWith("/products/")) {
      return;
    }
    document.title = "PrimeLinor — Custom Products for Your Brand";
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

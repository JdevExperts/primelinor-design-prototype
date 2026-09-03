import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "./track";

/**
 * Fires one PAGE_VIEW per public route change. Mounted inside SiteLayout
 * only, so the admin console and token quote pages are never counted.
 * Renders nothing.
 */
export default function RouteAnalytics() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    track("PAGE_VIEW");
    // search included so ?utm params on the same path still register once
  }, [pathname, search]);
  return null;
}

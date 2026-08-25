/**
 * CSRF defense-in-depth for cookie-authenticated admin writes (Phase 3
 * §43). The SameSite=Strict cookie (see services/auth.js) already blocks
 * the browser from attaching it to a cross-site request in the first
 * place, which is the primary defense. This middleware is the second
 * layer: for any state-changing request, the Origin header (sent by every
 * browser on cross-origin fetch/XHR, and on same-origin POSTs by most
 * modern browsers) must match one of the allowed frontend origins already
 * used for CORS. A request with no Origin header at all (some same-origin
 * navigations, non-browser API clients) is allowed through — GET-only
 * session cookies aren't the attack this guards against, and blocking all
 * headerless requests would break legitimate non-browser admin tooling
 * later without adding real protection today.
 */
const ApiError = require("../utils/ApiError");

function requireTrustedOrigin(allowedOrigins) {
  return (req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") return next();
    const origin = req.get("origin");
    if (!origin) return next();
    if (!allowedOrigins.includes(origin)) {
      return next(new ApiError(403, "Request origin not allowed."));
    }
    next();
  };
}

module.exports = requireTrustedOrigin;

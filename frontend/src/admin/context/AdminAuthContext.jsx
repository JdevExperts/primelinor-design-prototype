import { useCallback, useEffect, useState } from "react";
import * as authApi from "../api/auth";
import { AdminAuthContext } from "./adminAuthContextObject";

/**
 * Holds the signed-in staff identity for the whole /admin subtree. Checks
 * GET /admin/auth/me once on mount (the cookie, if any, is sent
 * automatically) — this is a UX convenience only; every real
 * authorization decision is enforced server-side (Phase 3 §7), this
 * context just decides what the frontend shows.
 */
export function AdminAuthProvider({ children }) {
  const [staffUser, setStaffUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | signedIn | signedOut

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then(({ staffUser: user }) => {
        if (cancelled) return;
        setStaffUser(user);
        setStatus("signedIn");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("signedOut");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { staffUser: user } = await authApi.login(email, password);
    setStaffUser(user);
    setStatus("signedIn");
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setStaffUser(null);
    setStatus("signedOut");
  }, []);

  return (
    <AdminAuthContext.Provider value={{ staffUser, status, login, logout }}>{children}</AdminAuthContext.Provider>
  );
}

import { adminGet, adminPost } from "./adminClient";

export const login = (email, password) => adminPost("/admin/auth/login", { email, password });
export const logout = () => adminPost("/admin/auth/logout");
export const me = () => adminGet("/admin/auth/me");

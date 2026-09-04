import { adminGet } from "./adminClient";

const q = (period) => (period ? { period } : undefined);

export const getOverview = (period) => adminGet("/admin/dashboard/overview", q(period));
export const getWebsite = (period) => adminGet("/admin/dashboard/website", q(period));
export const getSales = (period) => adminGet("/admin/dashboard/sales", q(period));
export const getProducts = (period) => adminGet("/admin/dashboard/products", q(period));
export const getCatalogueHealth = () => adminGet("/admin/dashboard/catalogue-health");

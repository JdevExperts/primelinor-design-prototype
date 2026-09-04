import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as dashboardApi from "../../api/dashboard";
import styles from "./dashboard.module.css";
import OverviewTab from "./OverviewTab";
import WebsiteTab from "./WebsiteTab";
import SalesTab from "./SalesTab";
import ProductsTab from "./ProductsTab";
import CatalogueHealthTab from "./CatalogueHealthTab";

const TABS = [
  { key: "overview", label: "Overview", to: "/admin/dashboard" },
  { key: "website", label: "Website", to: "/admin/dashboard/website" },
  { key: "sales", label: "Sales", to: "/admin/dashboard/sales" },
  { key: "products", label: "Products", to: "/admin/dashboard/products" },
  { key: "catalogue-health", label: "Catalogue Health", to: "/admin/dashboard/catalogue-health" },
];

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
];

function tabFromPath(pathname) {
  const seg = pathname.replace(/^\/admin\/dashboard\/?/, "").split("/")[0];
  return TABS.find((t) => t.key === seg)?.key || "overview";
}

export default function Dashboard() {
  const { pathname } = useLocation();
  const tab = tabFromPath(pathname);
  const showsPeriod = tab !== "catalogue-health";
  const [period, setPeriod] = useState(tab === "products" || tab === "sales" ? "30d" : "7d");
  // `loadedTab` guards against a one-frame mismatch: switching tabs re-renders
  // with the new `tab` before the refetch effect replaces `data`, so without
  // this the new section would briefly get the previous tab's payload.
  const [state, setState] = useState({ status: "loading", data: null, error: null, loadedTab: null });

  const fetcher = useMemo(
    () => ({
      overview: dashboardApi.getOverview,
      website: dashboardApi.getWebsite,
      sales: dashboardApi.getSales,
      products: dashboardApi.getProducts,
      "catalogue-health": () => dashboardApi.getCatalogueHealth(),
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: "loading" }));
    fetcher[tab](showsPeriod ? period : undefined)
      .then((data) => !cancelled && setState({ status: "ready", data, error: null, loadedTab: tab }))
      .catch((err) => !cancelled && setState({ status: "error", data: null, error: err.message, loadedTab: tab }));
    return () => {
      cancelled = true;
    };
  }, [tab, period, showsPeriod, fetcher]);

  const ready = state.status === "ready" && state.loadedTab === tab && state.data;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        {showsPeriod ? (
          <div className={styles.periods}>
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`${styles.period} ${period === p.key ? styles.periodActive : ""}`}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <nav className={styles.tabs}>
        {TABS.map((t) => (
          <Link key={t.key} to={t.to} className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {state.status === "error" && state.loadedTab === tab ? (
        <p className={styles.error}>Couldn&rsquo;t load this section. {state.error}</p>
      ) : !ready ? (
        <p className={styles.loading}>Loading…</p>
      ) : tab === "overview" ? (
        <OverviewTab data={state.data} />
      ) : tab === "website" ? (
        <WebsiteTab data={state.data} />
      ) : tab === "sales" ? (
        <SalesTab data={state.data} />
      ) : tab === "products" ? (
        <ProductsTab data={state.data} />
      ) : (
        <CatalogueHealthTab data={state.data} />
      )}
    </div>
  );
}

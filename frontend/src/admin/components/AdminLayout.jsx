import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/useAdminAuth";
import styles from "./AdminLayout.module.css";

const NAV_ITEMS = [
  { to: "/admin/rfqs", label: "RFQs" },
  { to: "/admin/leads", label: "Leads" },
];

const CATALOGUE_NAV_ITEMS = [
  { to: "/admin/catalog/products", label: "Products" },
  { to: "/admin/catalog/categories", label: "Categories" },
  { to: "/admin/catalog/colors", label: "Colors" },
];

export default function AdminLayout() {
  const { staffUser, logout } = useAdminAuth();

  useEffect(() => {
    document.title = "PrimeLinor Admin";
  }, []);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>PrimeLinor Admin</div>
        <nav className={styles.nav} aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <nav className={styles.nav} aria-label="Catalogue navigation">
          <div className={styles.navSectionLabel}>Catalogue</div>
          {CATALOGUE_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div />
          <div className={styles.identity}>
            <span className={styles.identityName}>{staffUser?.name}</span>
            <span className={styles.identityRole}>{staffUser?.role}</span>
            <button type="button" className={styles.logoutBtn} onClick={logout}>
              Log out
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

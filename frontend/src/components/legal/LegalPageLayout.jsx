import Seo from "../layout/Seo";
import styles from "./LegalPage.module.css";

/**
 * Shared layout for the four legal pages (Privacy Policy, Terms &
 * Conditions, Shipping Policy, Return & Replacement Policy) — Phase 6B
 * owner-input closure. One typography/container treatment reused across
 * all four rather than duplicated per page. Renders inside the normal
 * SiteLayout (Header/Outlet/Footer already wrap every public route), so
 * this only needs to own the page's own content column.
 */
export default function LegalPageLayout({ title, lastUpdated, description, children }) {
  return (
    <main id="main" className={styles.page}>
      <Seo title={`${title} | PrimeLinor Bulk`} description={description} />
      <div className={`container ${styles.container}`}>
        <p className="eyebrow">PrimeLinor Bulk</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Last Updated: {lastUpdated}</p>
        <div className={styles.body}>{children}</div>
      </div>
    </main>
  );
}

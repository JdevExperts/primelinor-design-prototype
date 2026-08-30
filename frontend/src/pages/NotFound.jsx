import { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Seo from "../components/layout/Seo";
import styles from "./NotFound.module.css";

/**
 * Site-wide catch-all (App.jsx's `path="*"`) — mirrors the existing
 * per-page "not found" pattern already used by ProductDetail/SolutionDetail
 * (same page/missing/lede/actions shape) rather than inventing a new one.
 */
export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found — PrimeLinor";
  }, []);

  return (
    <main id="main" className={styles.page}>
      <Seo title="Page not found — PrimeLinor" noindex />
      <div className={`container ${styles.missing}`}>
        <p className="eyebrow">404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.lede}>
          That page doesn&rsquo;t exist or may have moved. Try browsing our
          products or head back to the homepage.
        </p>
        <div className={styles.missingActions}>
          <Button as={Link} to="/products" variant="primary" size="md">
            Browse Products
          </Button>
          <Button as={Link} to="/" variant="secondary" size="md">
            Home
          </Button>
        </div>
      </div>
    </main>
  );
}

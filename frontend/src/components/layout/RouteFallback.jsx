import styles from "./RouteFallback.module.css";

/** Small, consistent fallback for lazy-loaded routes — no bespoke skeletons per page. */
export default function RouteFallback() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}

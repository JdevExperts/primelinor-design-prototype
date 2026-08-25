import styles from "./Logo.module.css";

/**
 * Placeholder wordmark. The abstract mark stands in for real PrimeLinor
 * brand artwork and can be replaced with an SVG asset later.
 */
export default function Logo({ tone = "light", size = 36 }) {
  return (
    <span className={`${styles.logo} ${tone === "dark" ? styles.onDark : ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        aria-hidden="true"
        focusable="false"
        className={styles.mark}
      >
        <rect width="36" height="36" rx="9" fill="currentColor" />
        <rect x="9" y="10" width="18" height="4" rx="2" fill="#ffffff" />
        <rect
          x="9"
          y="17"
          width="13"
          height="4"
          rx="2"
          fill="#ffffff"
          opacity="0.72"
        />
        <rect x="9" y="24" width="8" height="4" rx="2" fill="#f59e0b" />
      </svg>
      <span className={styles.wordmark}>PrimeLinor</span>
    </span>
  );
}

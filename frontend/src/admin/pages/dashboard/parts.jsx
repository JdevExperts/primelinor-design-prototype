import { Link } from "react-router-dom";
import styles from "./dashboard.module.css";

export const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-IN"));
export const fmtInr = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
export const fmtPct = (n) => (n == null ? "—" : `${n}%`);

export function Delta({ pct }) {
  if (pct == null) return <span className={`${styles.delta} ${styles.deltaFlat}`}>New</span>;
  if (pct === 0) return <span className={`${styles.delta} ${styles.deltaFlat}`}>±0%</span>;
  const up = pct > 0;
  return (
    <span className={`${styles.delta} ${up ? styles.deltaUp : styles.deltaDown}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

/**
 * A dashboard stat. When `href` is given it becomes a real, keyboard-
 * focusable link to a filtered admin list (subtle hover + a chevron, not
 * a button). `accent` = "mustard" | "green" | "blue" | "red" | "grey"
 * adds a coloured top border.
 */
export function MetricCard({ label, value, prev, changePct, money, href, accent = "grey" }) {
  const inner = (
    <>
      <span className={styles.cardLabel}>
        {label}
        {href ? <span className={styles.goChevron} aria-hidden="true"> →</span> : null}
      </span>
      <span className={styles.cardValue}>{money ? fmtInr(value) : fmt(value)}</span>
      {changePct !== undefined ? (
        <span>
          <Delta pct={changePct} />{" "}
          {prev != null ? <span className={styles.muted} style={{ fontSize: 11 }}>vs {money ? fmtInr(prev) : fmt(prev)}</span> : null}
        </span>
      ) : null}
    </>
  );
  const cls = `${styles.card} ${styles[`accent_${accent}`] || ""}`;
  return href ? (
    <Link to={href} className={`${cls} ${styles.cardLink}`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** Small stat used inside a panel; links when `href` is set. */
export function Stat({ label, value, money, href, accent }) {
  const inner = (
    <>
      <span className={styles.cardLabel}>
        {label}
        {href ? <span className={styles.goChevron} aria-hidden="true"> →</span> : null}
      </span>
      <span className={styles.cardValueSm}>{money ? fmtInr(value) : fmt(value)}</span>
    </>
  );
  const cls = `${styles.card} ${accent ? styles[`accent_${accent}`] || "" : ""}`;
  return href ? (
    <Link to={href} className={`${cls} ${styles.cardLink}`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function StatRow({ items }) {
  return (
    <div className={styles.cardGrid3}>
      {items.map((it) => (
        <Stat key={it.label} {...it} />
      ))}
    </div>
  );
}

export function AttnCard({ label, value, href }) {
  const zero = !value;
  const inner = (
    <>
      <span style={{ fontSize: 12, color: "#475467" }}>
        {label}
        {href && href.startsWith("/admin") ? <span className={styles.goChevron} aria-hidden="true"> →</span> : null}
      </span>
      <span className={styles.attnValue}>{fmt(value)}</span>
    </>
  );
  if (href && href.startsWith("/admin")) {
    return (
      <Link className={`${styles.attnCard} ${zero ? styles.attnZero : ""}`} to={href}>
        {inner}
      </Link>
    );
  }
  return <div className={`${styles.attnCard} ${zero ? styles.attnZero : ""}`}>{inner}</div>;
}

export function Panel({ title, note, children, style }) {
  return (
    <section className={styles.panel} style={style}>
      {title ? <p className={styles.panelTitle}>{title}</p> : null}
      {note ? <p className={styles.panelNote}>{note}</p> : null}
      {children}
    </section>
  );
}

/** A two-column "label → count" table where each row links to a filter. */
export function LinkTable({ rows }) {
  return (
    <table className={styles.table}>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td>
              {r.href ? (
                <Link to={r.href} className={styles.rowLink}>
                  {r.label} <span className={styles.goChevron} aria-hidden="true">→</span>
                </Link>
              ) : (
                r.label
              )}
            </td>
            <td className={styles.num}>{r.money ? fmtInr(r.value) : fmt(r.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

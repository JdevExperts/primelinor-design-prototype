import { Panel, fmt, fmtInr, fmtPct } from "./parts";
import styles from "./dashboard.module.css";

// The public site is served from the same origin as the admin app in dev
// and from the configured public URL in production.
const PUBLIC_ORIGIN =
  import.meta.env.VITE_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

function pdpHref(slug) {
  return slug ? `${PUBLIC_ORIGIN}/products/${slug}` : null;
}

/** Product Code + Name as one accessible link to the public PDP (new tab). */
function ProductLink({ code, name, slug }) {
  const href = pdpHref(slug);
  if (!href) {
    return (
      <span>
        <span className={styles.pill}>{code}</span> {name}
      </span>
    );
  }
  return (
    <a
      className={styles.rowLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open the public page for ${code} in a new tab`}
    >
      <span className={styles.pill}>{code}</span> {name}{" "}
      <span className={styles.goChevron} aria-hidden="true">↗</span>
    </a>
  );
}

function PerfTable({ rows }) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th className={styles.num}>Views</th>
            <th className={styles.num}>Quote CTA</th>
            <th className={styles.num}>RFQs</th>
            <th className={styles.num}>Threads</th>
            <th className={styles.num}>Accepted</th>
            <th className={styles.num}>Quoted ₹</th>
            <th className={styles.num}>Accepted ₹</th>
            <th className={styles.num}>View→RFQ</th>
            <th className={styles.num}>RFQ→Acc.</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r) => (
              <tr key={r.productId}>
                <td>
                  <ProductLink code={r.productCode} name={r.name} slug={r.slug} />
                </td>
                <td className={styles.num}>{fmt(r.views)}</td>
                <td className={styles.num}>{fmt(r.quoteCtaClicks)}</td>
                <td className={styles.num}>{fmt(r.rfqs)}</td>
                <td className={styles.num}>{fmt(r.quotationThreads)}</td>
                <td className={styles.num}>{fmt(r.acceptedQuotations)}</td>
                <td className={styles.num}>{fmtInr(r.quotedValue)}</td>
                <td className={styles.num}>{fmtInr(r.acceptedValue)}</td>
                <td className={styles.num}>{r.viewToRfqPct == null ? "—" : fmtPct(r.viewToRfqPct)}</td>
                <td className={styles.num}>{r.rfqToAcceptedPct == null ? "—" : fmtPct(r.rfqToAcceptedPct)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className={styles.muted}>
                No product activity in this period yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RankList({ title, rows, valueKey, money, suffix }) {
  return (
    <Panel title={title}>
      <table className={styles.table}>
        <tbody>
          {rows.length ? (
            rows.slice(0, 8).map((r) => (
              <tr key={r.productId}>
                <td>
                  <ProductLink code={r.productCode} name={r.name} slug={r.slug} />
                </td>
                <td className={styles.num}>
                  {money ? fmtInr(r[valueKey]) : fmt(r[valueKey])}
                  {suffix || ""}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.muted}>—</td>
            </tr>
          )}
        </tbody>
      </table>
    </Panel>
  );
}

export default function ProductsTab({ data }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Panel title="Product performance" note={`${data.note} Product name opens the public PDP in a new tab.`}>
        <PerfTable rows={data.products || []} />
      </Panel>
      <div className={styles.two}>
        <RankList title="Most viewed" rows={data.rankings.mostViewed} valueKey="views" />
        <RankList title="Most RFQ'd" rows={data.rankings.mostRfqd} valueKey="rfqs" />
        <RankList title="Most accepted" rows={data.rankings.mostAccepted} valueKey="acceptedQuotations" />
        <RankList title="Highest accepted value" rows={data.rankings.highestAcceptedValue} valueKey="acceptedValue" money />
        <RankList
          title={`Best view→RFQ (≥${data.minViewsForConversion} views)`}
          rows={data.rankings.bestViewToRfq}
          valueKey="viewToRfqPct"
          suffix="%"
        />
      </div>
    </div>
  );
}

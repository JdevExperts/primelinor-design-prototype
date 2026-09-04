import { Link } from "react-router-dom";
import { MetricCard, Stat, AttnCard, Panel, StatRow, fmt, fmtPct } from "./parts";
import { Funnel } from "../../components/charts/MiniCharts";
import styles from "./dashboard.module.css";

const TOP_ACCENT = {
  "Website Visitors": "blue",
  "Product Views": "blue",
  RFQs: "mustard",
  "Accepted Quotations": "green",
};
const STATUS_ACCENT = { DRAFT: "grey", SENT: "blue", VIEWED: "blue", ACCEPTED: "green" };

export default function OverviewTab({ data }) {
  const q = data.quotations;
  const links = q.links || {};
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className={styles.cardGrid}>
        {data.topCards.map((c) => (
          <MetricCard key={c.label} {...c} money={c.label.includes("Value")} accent={TOP_ACCENT[c.label] || "grey"} />
        ))}
      </div>

      <Panel title="Needs attention">
        <div className={styles.cardGrid}>
          {data.attentionRow.map((a) => (
            <AttnCard key={a.label} label={a.label} value={a.value} href={a.href} />
          ))}
        </div>
        {data.needsAttention?.items?.length ? (
          <div className={styles.defnList}>
            {data.needsAttention.items.map((it) => (
              <div className={styles.defnRow} key={it.key}>
                <span className={`${styles.defnCount} ${it.count ? "" : styles.defnCountZero}`}>{it.count}</span>
                <span className={styles.defnLabel}>{it.label}</span>
                <Link className={styles.rowLink} style={{ fontSize: 12 }} to={it.href}>
                  Open →
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </Panel>

      <Panel title="Quotation threads" note="Counts commercial threads (quotationGroupId), never V1/V2/V3 separately.">
        <StatRow
          items={[
            { label: "Active threads", value: q.activeThreads, href: links.active, accent: "blue" },
            {
              label: "Pending revision requests",
              value: q.pendingRevisionRequests,
              href: links.pendingRevision,
              accent: "mustard",
            },
            { label: "Expired", value: q.expired, href: links.expired, accent: "red" },
          ]}
        />
        <div className={styles.cardGrid}>
          {["DRAFT", "SENT", "VIEWED", "ACCEPTED"].map((s) => (
            <Stat key={s} label={s} value={q.byStatus[s]} href={links.byStatus?.[s]} accent={STATUS_ACCENT[s]} />
          ))}
        </div>
        <div className={styles.cardGrid3}>
          <Stat label="Total Quoted Value" value={q.totalQuotedValue} money />
          <Stat label="Accepted Value" value={q.acceptedValue} money accent="green" />
          <div className={styles.card}>
            <span className={styles.cardLabel}>Acceptance Rate</span>
            <span className={styles.cardValueSm}>{q.acceptanceRate == null ? "—" : fmtPct(q.acceptanceRate)}</span>
          </div>
        </div>
      </Panel>

      <Panel title={data.funnel.label} note={data.funnel.note}>
        <Funnel stages={data.funnel.stages} />
      </Panel>

      <Panel title="Catalogue health">
        <p style={{ margin: 0, fontSize: 13, color: "#475467" }}>
          <strong>{fmt(data.catalogueHealthSummary.totalIssues)}</strong> issues across{" "}
          <strong>{fmt(data.catalogueHealthSummary.productsWithIssues)}</strong> products ·{" "}
          {fmt(data.catalogueHealthSummary.totals.activeProducts)} active products,{" "}
          {fmt(data.catalogueHealthSummary.totals.activeCategories)} categories,{" "}
          {fmt(data.catalogueHealthSummary.totals.activeSolutions)} solutions.
        </p>
        {data.catalogueHealthSummary.review ? (
          <p style={{ margin: 0, fontSize: 13, color: "#475467" }}>
            Catalogue review:{" "}
            <strong>
              {fmt(data.catalogueHealthSummary.review.reviewed)} / {fmt(data.catalogueHealthSummary.review.totalProducts)}
            </strong>{" "}
            reviewed ({data.catalogueHealthSummary.review.progressPct}%)
          </p>
        ) : null}
        <Link to="/admin/dashboard/catalogue-health" className={styles.rowLink} style={{ fontSize: 12 }}>
          Open Catalogue Health →
        </Link>
      </Panel>
    </div>
  );
}

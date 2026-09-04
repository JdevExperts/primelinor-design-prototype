import { Panel, Stat, StatRow, AttnCard, LinkTable, fmtPct } from "./parts";
import { GroupedBarChart, CHART_COLORS } from "../../components/charts/MiniCharts";
import styles from "./dashboard.module.css";

const RFQ_ORDER = ["NEW", "IN_PROGRESS", "QUOTED", "NEGOTIATING", "WON", "LOST", "CANCELLED"];
const LEAD_ORDER = ["NEW", "IN_REVIEW", "CONVERTED", "CLOSED"];
const STATUS_ACCENT = {
  DRAFT: "grey",
  SENT: "blue",
  VIEWED: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
  CANCELLED: "red",
};

export default function SalesTab({ data }) {
  const { rfq, lead, quotations: q, needsAttention, trend, trendSemantics } = data;
  const trendDates = (trend || []).map((d) => d.date);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className={styles.two}>
        <Panel title="RFQs">
          <StatRow
            items={[
              { label: "Today", value: rfq.today, href: rfq.links?.today },
              { label: "This week", value: rfq.week, href: rfq.links?.week },
              { label: "This month", value: rfq.month, href: rfq.links?.month },
            ]}
          />
        </Panel>
        <Panel title="Leads">
          <StatRow
            items={[
              { label: "Today", value: lead.today, href: lead.links?.today },
              { label: "This week", value: lead.week, href: lead.links?.week },
              { label: "This month", value: lead.month, href: lead.links?.month },
            ]}
          />
        </Panel>
      </div>

      <div className={styles.two}>
        <Panel title="RFQ by status">
          <LinkTable
            rows={RFQ_ORDER.map((s) => ({ label: s, value: rfq.byStatus[s], href: rfq.links?.byStatus?.[s] }))}
          />
        </Panel>
        <Panel title="Leads by status">
          <LinkTable
            rows={LEAD_ORDER.map((s) => ({ label: s, value: lead.byStatus[s], href: lead.links?.byStatus?.[s] }))}
          />
        </Panel>
      </div>

      <Panel
        title="Quotation thread metrics"
        note="Every figure counts commercial THREADS (quotationGroupId). A thread with any accepted version counts as ACCEPTED."
      >
        <div className={styles.cardGrid}>
          <Stat label="Active threads" value={q.activeThreads} href={q.links?.active} accent="blue" />
          <Stat label="Pending revision" value={q.pendingRevisionRequests} href={q.links?.pendingRevision} accent="mustard" />
          <Stat label="Expired" value={q.expired} href={q.links?.expired} accent="red" />
          <Stat label="Total threads" value={q.totalThreads} />
        </div>
        <div className={styles.cardGrid}>
          {["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "CANCELLED"].map((s) => (
            <Stat
              key={s}
              label={s}
              value={q.byStatus[s]}
              href={q.links?.byStatus?.[s]}
              accent={STATUS_ACCENT[s]}
            />
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

      <Panel
        title="Needs attention"
        note={`Thresholds — unopened >${needsAttention.thresholds.sentNotViewedDays}d, no reply >${needsAttention.thresholds.viewedNoResponseDays}d, stalled RFQ >${needsAttention.thresholds.staleRfqDays}d, expiring ≤${needsAttention.thresholds.nearExpiryDays}d.`}
      >
        <div className={styles.cardGrid}>
          {needsAttention.items.map((it) => (
            <AttnCard key={it.key} label={it.label} value={it.count} href={it.href} />
          ))}
        </div>
      </Panel>

      <Panel title="Daily trend" note={trendSemantics}>
        <GroupedBarChart
          dates={trendDates}
          series={[
            { label: "Leads created", color: CHART_COLORS.LEADS, data: (trend || []).map((d) => d.leads) },
            { label: "RFQs created", color: CHART_COLORS.MUSTARD, data: (trend || []).map((d) => d.rfqs) },
            { label: "Quotes sent (threads)", color: CHART_COLORS.NAVY, data: (trend || []).map((d) => d.quotesSent) },
          ]}
        />
      </Panel>
    </div>
  );
}

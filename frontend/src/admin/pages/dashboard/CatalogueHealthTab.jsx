import { Link } from "react-router-dom";
import { Panel, fmt } from "./parts";
import styles from "./dashboard.module.css";

const SEV_LABEL = { error: "Error", attention: "Attention", info: "Info" };
const SEV_ROW = { error: styles.defnRowError, attention: styles.defnRowAttention, info: styles.defnRowInfo };
const SEV_CHIP = { error: styles.sev_error, attention: styles.sev_attention, info: styles.sev_info };

function IssueRow({ iss }) {
  const sev = iss.severity || "attention";
  return (
    <div className={`${styles.defnRow} ${SEV_ROW[sev] || ""}`}>
      <span className={`${styles.defnCount} ${iss.count ? "" : styles.defnCountZero}`}>{iss.count}</span>
      <span>
        <span className={styles.defnLabel}>{iss.label}</span>{" "}
        <span className={`${styles.sev} ${SEV_CHIP[sev] || ""}`}>{SEV_LABEL[sev] || sev}</span>
        <br />
        <span className={styles.defnText}>{iss.definition}</span>
      </span>
      <Link className={styles.rowLink} style={{ fontSize: 12 }} to={iss.href}>
        Open →
      </Link>
    </div>
  );
}

export default function CatalogueHealthTab({ data }) {
  const t = data?.totals || {};
  const issues = data?.issues || [];
  const commercial = data?.commercial || [];
  const review = data?.review;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className={styles.cardGrid3}>
        <div className={`${styles.card} ${styles.accent_grey}`}>
          <span className={styles.cardLabel}>Active products</span>
          <span className={styles.cardValue}>{fmt(t.activeProducts)}</span>
        </div>
        <div className={`${styles.card} ${styles.accent_grey}`}>
          <span className={styles.cardLabel}>Categories</span>
          <span className={styles.cardValue}>{fmt(t.activeCategories)}</span>
          <span className={styles.muted} style={{ fontSize: 11 }}>{fmt(t.categories)} total</span>
        </div>
        <div className={`${styles.card} ${styles.accent_grey}`}>
          <span className={styles.cardLabel}>Solutions</span>
          <span className={styles.cardValue}>{fmt(t.activeSolutions)}</span>
          <span className={styles.muted} style={{ fontSize: 11 }}>{fmt(t.solutions)} total</span>
        </div>
      </div>

      {review ? (
        <Panel title="Catalogue review" note="Temporary launch-review pass — derived from the PRODUCT_REVIEW_PENDING flag, no stored status.">
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy, #0f1b2d)" }}>
            Reviewed {fmt(review.reviewed)} / {fmt(review.totalProducts)}{" "}
            <span className={styles.muted} style={{ fontWeight: 400 }}>· {review.progressPct}%</span>
          </div>
          <div style={{ height: 8, background: "#eef2f6", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${review.progressPct}%`, height: "100%", background: "#e1ad01" }} />
          </div>
          <div className={styles.cardGrid3}>
            <Link className={`${styles.card} ${styles.cardLink} ${styles.accent_mustard}`} to={review.pendingHref}>
              <span className={styles.cardLabel}>Pending review <span className={styles.goChevron} aria-hidden="true">→</span></span>
              <span className={styles.cardValueSm}>{fmt(review.pendingReview)}</span>
            </Link>
            <Link className={`${styles.card} ${styles.cardLink} ${styles.accent_green}`} to={review.completeHref}>
              <span className={styles.cardLabel}>Review complete <span className={styles.goChevron} aria-hidden="true">→</span></span>
              <span className={styles.cardValueSm}>{fmt(review.reviewed)}</span>
            </Link>
          </div>
        </Panel>
      ) : null}

      <Panel
        title="Catalogue issues"
        note={`${fmt(data.totalIssues)} issues across ${fmt(data.productsWithIssues)} products. Colour = severity; each row also carries a text label. Click a row to open the relevant admin list.`}
      >
        <div className={styles.defnList}>
          {issues.map((iss) => (
            <IssueRow key={iss.key} iss={iss} />
          ))}
        </div>
      </Panel>

      {commercial.length ? (
        <Panel
          title="Commercial attention"
          note="Not defects — intentional configuration the sales team should be aware of."
        >
          <div className={styles.defnList}>
            {commercial.map((iss) => (
              <IssueRow key={iss.key} iss={iss} />
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

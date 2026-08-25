import styles from "./StatusBadge.module.css";

const TONE_BY_STATUS = {
  // Lead
  NEW: "blue",
  IN_REVIEW: "amber",
  CONVERTED: "green",
  CLOSED: "grey",
  // RFQ
  IN_PROGRESS: "amber",
  QUOTED: "blue",
  NEGOTIATING: "amber",
  WON: "green",
  LOST: "red",
  CANCELLED: "grey",
  // Quotation
  DRAFT: "grey",
  SENT: "blue",
  VIEWED: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
  SUPERSEDED: "grey",
};

export default function StatusBadge({ status }) {
  const tone = TONE_BY_STATUS[status] || "grey";
  return <span className={`${styles.badge} ${styles[tone]}`}>{status}</span>;
}

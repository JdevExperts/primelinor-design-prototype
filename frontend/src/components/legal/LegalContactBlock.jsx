import { businessConfig } from "../../data/siteConfig";
import styles from "./LegalPage.module.css";

/**
 * The consistent customer-support/contact block reused at the bottom of
 * every legal page (Phase 6B owner-input closure §10). A named Grievance
 * Officer is deliberately not invented — flagged instead as an explicit
 * open item in the Phase 6B completion report for the owner to confirm
 * whether one is required.
 */
export default function LegalContactBlock({ heading = "Contact" }) {
  return (
    <div className={styles.contactBlock}>
      <h2>{heading}</h2>
      <address>
        {businessConfig.businessName}
        <br />
        {businessConfig.addressLines.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
        Email: <a href={`mailto:${businessConfig.supportEmail}`}>{businessConfig.supportEmail}</a>
        <br />
        Phone / WhatsApp:{" "}
        <a href={`tel:${businessConfig.phoneE164}`}>{businessConfig.phoneDisplay}</a>
      </address>
    </div>
  );
}

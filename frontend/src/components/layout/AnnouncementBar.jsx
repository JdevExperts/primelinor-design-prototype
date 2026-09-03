import { Link } from "react-router-dom";
import { announcementBar, businessConfig } from "../../data/siteConfig";
import { buildWhatsAppUrl } from "../../utils/whatsapp";
import styles from "./AnnouncementBar.module.css";

const CONTACT_MESSAGE = "Hi PrimeLinor, I'd like to know more about bulk/custom orders.";
const whatsappUrl = buildWhatsAppUrl(businessConfig.whatsappNumber, CONTACT_MESSAGE);

export default function AnnouncementBar() {
  return (
    <div className={styles.bar}>
      <div className={`container ${styles.inner}`}>
        <span className={`${styles.item} ${styles.bulk}`}>{announcementBar.bulkLabel}</span>

        <span className={`${styles.divider} ${styles.dividerBulk}`} aria-hidden="true" />

        <a
          className={`${styles.item} ${styles.contact}`}
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Call or WhatsApp PrimeLinor at ${businessConfig.phoneDisplay}`}
        >
          Call / WhatsApp: {businessConfig.phoneDisplay}
        </a>

        <span className={styles.divider} aria-hidden="true" />

        <Link className={`${styles.item} ${styles.sample}`} to={announcementBar.sampleCta.to}>
          <span className={styles.sampleFull}>{announcementBar.sampleCta.label}</span>
          <span className={styles.sampleShort}>{announcementBar.sampleCta.labelShort}</span>
        </Link>
      </div>
    </div>
  );
}

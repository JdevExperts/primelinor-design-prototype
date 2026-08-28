import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import Logo from "./Logo";
import {
  footerColumns,
  footerContact,
  footerLinkRoutes,
  footerPolicies,
  socialLinks,
} from "../../data/mockData";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.footer} on-dark`} id="about">
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo tone="dark" />
            <p className={styles.summary}>
              PrimeLinor helps businesses create custom products with their
              own branding — apparel, corporate gifts, promotional products
              and curated kits, at quantities that suit the team.
            </p>
            <div className={styles.contact}>
              <a className={styles.contactLink} href={`mailto:${footerContact.email}`}>
                {footerContact.email}
              </a>
              <a className={styles.contactLink} href={`tel:${footerContact.phone.replace(/\s/g, "")}`}>
                {footerContact.phone}
              </a>
              <span className={styles.contactMeta}>{footerContact.location}</span>
            </div>
            <button type="button" className={styles.chat}>
              <Icon name="chat" size={18} />
              Chat with an expert on WhatsApp
            </button>
          </div>

          <nav className={styles.columns} aria-label="Footer">
            {footerColumns.map((column) => (
              <div key={column.id} className={styles.column}>
                <h2 className={styles.columnTitle}>{column.title}</h2>
                <ul className={styles.columnList}>
                  {column.links.map((link) => {
                    const to = footerLinkRoutes[link];
                    return (
                      <li key={link}>
                        {to ? (
                          <Link className={styles.columnLink} to={to}>
                            {link}
                          </Link>
                        ) : (
                          <a className={styles.columnLink} href="#top">
                            {link}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} PrimeLinor. Design prototype — content
            and pricing are placeholders.
          </p>

          <ul className={styles.policies}>
            {footerPolicies.map((policy) => (
              <li key={policy}>
                <a className={styles.policyLink} href="#top">
                  {policy}
                </a>
              </li>
            ))}
          </ul>

          <ul className={styles.social} aria-label="Social media">
            {socialLinks.map((social) => (
              <li key={social.name}>
                <a
                  className={styles.socialLink}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                >
                  <Icon name={social.icon} size={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

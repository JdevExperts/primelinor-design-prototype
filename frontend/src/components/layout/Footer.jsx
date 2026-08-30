import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import Logo from "./Logo";
import WhatsAppDialog from "../common/WhatsAppDialog";
import {
  businessConfig,
  footerColumns,
  footerLinkRoutes,
  footerPolicies,
  socialLinks,
} from "../../data/siteConfig";
import styles from "./Footer.module.css";

export default function Footer() {
  const [waOpen, setWaOpen] = useState(false);

  return (
    <>
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
                <p className={styles.contactHeading}>Contacts:</p>
                <p className={styles.contactRow}>
                  <strong className={styles.contactLabel}>Email:</strong>{" "}
                  <a className={styles.contactLink} href={`mailto:${businessConfig.supportEmail}`}>
                    {businessConfig.supportEmail}
                  </a>
                </p>
                <p className={styles.contactRow}>
                  <strong className={styles.contactLabel}>Call:</strong>{" "}
                  <a className={styles.contactLink} href={`tel:${businessConfig.phoneE164}`}>
                    {businessConfig.phoneDisplay}
                  </a>
                </p>
                <p className={styles.contactRow}>
                  <strong className={styles.contactLabel}>Official Address:</strong>{" "}
                  <span className={styles.contactMeta}>{businessConfig.addressLines.join(", ")}</span>
                </p>
              </div>
              <button type="button" className={styles.chat} onClick={() => setWaOpen(true)}>
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
              © {new Date().getFullYear()} {businessConfig.businessName}. All rights reserved.
            </p>

            <ul className={styles.policies}>
              {footerPolicies.map((policy) => (
                <li key={policy.to}>
                  <Link className={styles.policyLink} to={policy.to}>
                    {policy.label}
                  </Link>
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
      {/* Rendered outside the .on-dark footer — nested inside it, the
          dialog's white panel would inherit the dark section's inverted
          text-color tokens and render invisible white-on-white text. */}
      <WhatsAppDialog open={waOpen} onClose={() => setWaOpen(false)} />
    </>
  );
}

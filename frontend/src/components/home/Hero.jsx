import CampaignBanner from "./CampaignBanner";
import { heroCampaigns } from "../../data/mockData";
import styles from "./Hero.module.css";

const PRIMARY = "hero_primary";
const SECONDARIES = ["hero_secondary_1", "hero_secondary_2"];

/**
 * Homepage campaign wall. Layout is driven by `heroCampaigns` in mockData —
 * swapping creatives, hrefs or active flags is a data change, not a layout
 * rewrite. Inactive records are omitted; missing secondaries do not collapse
 * the primary into a broken grid.
 */
export default function Hero() {
  const active = heroCampaigns
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const primary = active.find((item) => item.placement === PRIMARY);
  const secondaries = SECONDARIES.map((placement) =>
    active.find((item) => item.placement === placement)
  ).filter(Boolean);

  if (!primary && secondaries.length === 0) return null;

  const layout = !primary
    ? styles.noPrimary
    : secondaries.length === 0
      ? styles.solo
      : secondaries.length === 1
        ? styles.oneSecondary
        : "";

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className="visually-hidden">
        Custom Products for Your Brand
      </h1>

      <div className={`container ${styles.inner}`}>
        <div className={`${styles.grid} ${layout}`}>
          {primary ? (
            <div className={styles.primary}>
              <CampaignBanner banner={primary} priority />
            </div>
          ) : null}

          {secondaries.map((banner) => (
            <div key={banner.id} className={styles.secondary}>
              <CampaignBanner banner={banner} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

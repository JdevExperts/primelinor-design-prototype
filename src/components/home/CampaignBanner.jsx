import Icon from "../ui/Icon";
import styles from "./CampaignBanner.module.css";

/**
 * One admin-managed campaign tile. The creative is the campaign — this
 * component does not overlay headlines or CTAs. When both image fields are
 * null it renders a labelled studio placeholder so the slot is obvious.
 *
 * Image swap is a data change: set desktopImage / mobileImage on the banner
 * record. mobileImage, when present, is selected below 768px via <picture>.
 */

const SLOT = {
  hero_primary: {
    kicker: "Primary campaign banner",
    hint: "Desktop campaign creative",
    surface: "primary",
  },
  hero_secondary_1: {
    kicker: "Secondary homepage banner",
    hint: "Supporting campaign",
    surface: "secondaryA",
  },
  hero_secondary_2: {
    kicker: "Secondary homepage banner",
    hint: "Supporting campaign",
    surface: "secondaryB",
  },
};

export default function CampaignBanner({ banner, priority = false }) {
  const {
    title,
    altText,
    desktopImage,
    mobileImage,
    href,
    placement,
    objectPosition = "center",
  } = banner;

  const slot = SLOT[placement] || SLOT.hero_secondary_1;
  const src = desktopImage || mobileImage;
  const hasImage = Boolean(src);
  const label = altText || title;

  const media = hasImage ? (
    <picture className={styles.picture}>
      {mobileImage ? (
        <source media="(max-width: 767px)" srcSet={mobileImage} />
      ) : null}
      {desktopImage && mobileImage ? (
        <source media="(min-width: 768px)" srcSet={desktopImage} />
      ) : null}
      <img
        className={styles.image}
        src={src}
        alt=""
        style={{ objectPosition }}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  ) : (
    <span className={`${styles.placeholder} ${styles[slot.surface]}`} aria-hidden="true">
      <span className={styles.placeholderKicker}>{slot.kicker}</span>
      <span className={styles.placeholderTitle}>{title}</span>
      <span className={styles.placeholderHint}>
        {slot.hint}
        <span className={styles.placeholderDot} aria-hidden="true">
          ·
        </span>
        Admin-managed image
      </span>
    </span>
  );

  const className = `${styles.banner} ${hasImage ? styles.hasImage : ""}`;

  const body = (
    <>
      {media}
      <span className={styles.affordance} aria-hidden="true">
        <Icon name="arrowRight" size={16} />
      </span>
    </>
  );

  if (href) {
    return (
      <a className={className} href={href} aria-label={label}>
        {body}
      </a>
    );
  }

  return (
    <div className={className} role="img" aria-label={label}>
      {body}
    </div>
  );
}

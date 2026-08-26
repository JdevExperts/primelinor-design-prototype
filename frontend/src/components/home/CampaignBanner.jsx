import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import styles from "./CampaignBanner.module.css";

/**
 * One admin-managed campaign tile. When both image fields are null it
 * renders a labelled studio placeholder so the slot is obvious. Once an
 * image is set, real eyebrow/headline/subtitle/CTA copy (never baked into
 * the creative) renders over the left-side negative space the campaign
 * photography is shot with — UNLESS the banner is `renderMode:
 * "image-only"`, meaning the creative is a finished design with its own
 * copy already baked in, in which case no HTML text is overlaid at all and
 * the image's `altText` carries the accessible description instead.
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
    eyebrow,
    subtitle,
    ctaLabel,
    altText,
    desktopImage,
    mobileImage,
    href,
    placement,
    renderMode,
    objectPosition = "center",
  } = banner;

  const slot = SLOT[placement] || SLOT.hero_secondary_1;
  const isPrimary = placement === "hero_primary";
  const isImageOnly = renderMode === "image-only";
  const src = desktopImage || mobileImage;
  const hasImage = Boolean(src);
  const label = altText || title;
  // Real visible copy (added once an image exists) already gives the link
  // an accurate accessible name via its content, so alt stays "" (the
  // image is decorative background behind that text) and aria-label only
  // covers the no-copy fallback case. image-only creatives flip this: the
  // image IS the content (its own baked-in copy), so alt carries the
  // description instead, and no HTML copy is rendered at all.
  const hasCopy = hasImage && !isImageOnly && Boolean(title);

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
        alt={isImageOnly ? label : ""}
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

  // Secondary tiles stay minimal on purpose — a single headline line and
  // nothing else, so the photography carries the campaign. Only the
  // primary banner gets the fuller eyebrow/subtitle/CTA treatment.
  const showsInlineCta = isPrimary && Boolean(ctaLabel);

  const copy = hasCopy ? (
    <span className={`${styles.copy} ${isPrimary ? styles.copyPrimary : styles.copySecondary}`}>
      {isPrimary && eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <span className={styles.headline}>{title}</span>
      {isPrimary && subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
      {showsInlineCta ? (
        <span className={styles.cta}>
          {ctaLabel}
          <Icon name="arrowRight" size={14} />
        </span>
      ) : null}
    </span>
  ) : null;

  const className = `${styles.banner} ${hasImage ? styles.hasImage : ""}`;

  const body = (
    <>
      {media}
      {copy}
      {/* The inline CTA already carries its own arrow — the hover-corner
          affordance is only needed when there's no visible CTA to do that job. */}
      {showsInlineCta ? null : (
        <span className={styles.affordance} aria-hidden="true">
          <Icon name="arrowRight" size={16} />
        </span>
      )}
    </>
  );

  // hasCopy: accessible name comes from the visible eyebrow/headline text.
  // isImageOnly: accessible name comes from the <img>'s own alt instead.
  // Only the remaining case (no copy, not image-only) needs an aria-label.
  const wrapperLabel = hasCopy || isImageOnly ? undefined : label;

  if (href) {
    const isInternal = href.startsWith("/");
    return isInternal ? (
      <Link className={className} to={href} aria-label={wrapperLabel}>
        {body}
      </Link>
    ) : (
      <a className={className} href={href} aria-label={wrapperLabel}>
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

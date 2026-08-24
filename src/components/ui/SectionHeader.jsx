import styles from "./SectionHeader.module.css";

export default function SectionHeader({
  eyebrow,
  title,
  titleId,
  description,
  action,
  align = "start",
  compact = false,
  as: Heading = "h2",
}) {
  return (
    <div
      className={`${styles.header} ${align === "center" ? styles.center : ""} ${
        compact ? styles.compact : ""
      }`}
    >
      <div className={styles.copy}>
        {eyebrow ? (
          <p className={`eyebrow ${styles.eyebrowRow}`}>{eyebrow}</p>
        ) : null}
        <Heading id={titleId} className={styles.title}>
          {title}
        </Heading>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

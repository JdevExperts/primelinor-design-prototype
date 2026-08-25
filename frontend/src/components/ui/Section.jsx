import styles from "./Section.module.css";

export default function Section({
  tone = "white",
  spacious = false,
  tightTop = false,
  id,
  ariaLabelledBy,
  className = "",
  children,
}) {
  const classes = [
    styles.section,
    styles[tone],
    spacious ? styles.spacious : "",
    tightTop ? styles.tightTop : "",
    tone === "navy" ? "on-dark" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={classes} aria-labelledby={ariaLabelledBy}>
      <div className="container">{children}</div>
    </section>
  );
}

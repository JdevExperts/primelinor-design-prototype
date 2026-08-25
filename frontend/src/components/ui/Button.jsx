import Icon from "./Icon";
import styles from "./Button.module.css";

/**
 * Prototype buttons render as <button> by default. Pass `as={Link}` or `as="a"`
 * for navigation without changing the visual button styles.
 */
export default function Button({
  as = "button",
  variant = "primary",
  size = "md",
  icon,
  trailingIcon,
  fullWidth = false,
  className = "",
  children,
  ...rest
}) {
  const Tag = as;
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.full : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSize = size === "lg" ? 20 : 18;

  return (
    <Tag
      className={classes}
      {...(Tag === "button" ? { type: rest.type || "button" } : {})}
      {...rest}
    >
      {icon ? <Icon name={icon} size={iconSize} className={styles.icon} /> : null}
      <span>{children}</span>
      {trailingIcon ? (
        <Icon
          name={trailingIcon}
          size={iconSize}
          className={`${styles.icon} ${styles.iconTrail}`}
        />
      ) : null}
    </Tag>
  );
}

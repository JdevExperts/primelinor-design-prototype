import Icon from "../ui/Icon";
import { useFocusTrap } from "../../utils/useFocusTrap";
import styles from "./Dialog.module.css";

export default function Dialog({
  open,
  onClose,
  titleId,
  title,
  children,
  footer,
  wide = false,
}) {
  const panelRef = useFocusTrap(open, onClose);

  if (!open) return null;

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.overlay}
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`${styles.panel} ${wide ? styles.wide : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose}>
            <Icon name="close" size={20} />
            <span className="visually-hidden">Close</span>
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.foot}>{footer}</div> : null}
      </div>
    </div>
  );
}

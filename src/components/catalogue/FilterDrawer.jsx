import { useEffect, useRef } from "react";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import FilterSidebar from "./FilterSidebar";
import styles from "./FilterDrawer.module.css";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function FilterDrawer({
  open,
  onClose,
  filters,
  onToggle,
  onCustomizable,
  onClear,
  resultCount,
  onApply,
}) {
  const panelRef = useRef(null);
  const lastFocus = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    lastFocus.current = document.activeElement;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      const nodes = panel?.querySelectorAll(FOCUSABLE);
      nodes?.[0]?.focus();
    };
    const frame = requestAnimationFrame(focusFirst);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const nodes = [...panel.querySelectorAll(FOCUSABLE)];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (lastFocus.current instanceof HTMLElement) lastFocus.current.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.overlay}
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
      >
        <div className={styles.head}>
          <h2 id="filter-drawer-title" className={styles.title}>
            Filters
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
          >
            <Icon name="close" size={20} />
            <span className="visually-hidden">Close filters</span>
          </button>
        </div>

        <div className={styles.body}>
          <FilterSidebar
            filters={filters}
            onToggle={onToggle}
            onCustomizable={onCustomizable}
            idPrefix="drawer-filter"
          />
        </div>

        <div className={styles.foot}>
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear all
          </button>
          <Button variant="primary" size="md" onClick={onApply}>
            Show {resultCount} {resultCount === 1 ? "Product" : "Products"}
          </Button>
        </div>
      </div>
    </div>
  );
}

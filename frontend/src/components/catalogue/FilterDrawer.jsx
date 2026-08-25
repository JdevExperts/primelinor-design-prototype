import Button from "../ui/Button";
import Icon from "../ui/Icon";
import FilterSidebar from "./FilterSidebar";
import { useFocusTrap } from "../../utils/useFocusTrap";
import styles from "./FilterDrawer.module.css";

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
  const panelRef = useFocusTrap(open, onClose);

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

import { listingCategories } from "../../data/mockData";
import styles from "./CategoryStrip.module.css";

export default function CategoryStrip({ selected, onSelect }) {
  return (
    <nav className={styles.strip} aria-label="Product categories">
      <ul className={styles.list}>
        {listingCategories.map((item) => {
          const isAll = item.id === "all";
          const active = isAll
            ? selected.length === 0
            : selected.length === 1 && selected[0] === item.id
              ? true
              : selected.includes(item.id) && !isAll;

          return (
            <li key={item.id}>
              <button
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                aria-pressed={active}
                onClick={() => onSelect(item.id)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

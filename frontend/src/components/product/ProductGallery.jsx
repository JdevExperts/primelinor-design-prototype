import ProductVisual from "../ui/ProductVisual";
import styles from "./ProductGallery.module.css";

function viewProps(viewId) {
  if (viewId === "back") return { scale: 0.96, surface: "tint" };
  if (viewId === "detail") return { scale: 1.42, surface: "default" };
  if (viewId === "lifestyle") return { scale: 0.9, surface: "warm" };
  return { scale: 1.04, surface: "default" };
}

export default function ProductGallery({
  product,
  colorHex,
  activeView,
  onViewChange,
}) {
  const views = product.gallery || [];

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        <ProductVisual
          art={product.art}
          color={colorHex}
          src={views.find((view) => view.id === activeView)?.image}
          alt={`${product.name} — ${views.find((view) => view.id === activeView)?.label || "Front"}`}
          ratio="1 / 1"
          scale={viewProps(activeView).scale}
          surface={viewProps(activeView).surface}
        />
        {activeView === "lifestyle" ? (
          <p className={styles.caption}>Branding example · placeholder visual</p>
        ) : null}
      </div>

      <ul className={styles.thumbs} aria-label="Product views">
        {views.map((view) => {
          const selected = view.id === activeView;
          return (
            <li key={view.id}>
              <button
                type="button"
                className={`${styles.thumb} ${selected ? styles.thumbOn : ""}`}
                onClick={() => onViewChange(view.id)}
                aria-pressed={selected}
                aria-label={`${view.label} view`}
              >
                <ProductVisual
                  art={product.art}
                  color={colorHex}
                  src={view.image}
                  alt=""
                  ratio="1 / 1"
                  scale={viewProps(view.id).scale * 0.86}
                  surface={viewProps(view.id).surface}
                />
                <span className={styles.thumbLabel}>{view.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

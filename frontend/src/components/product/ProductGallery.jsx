import { useState } from "react";
import ProductVisual from "../ui/ProductVisual";
import styles from "./ProductGallery.module.css";

/**
 * PDP image gallery.
 *
 * `images` is the ordered, de-duplicated customer-facing set the backend
 * computes (services/productGallery.js, shipped as `product.images` and
 * mapped by api/adapters.js `galleryFor` to `{ id, image, alt }`). One
 * thumbnail per image, image-only — asset roles/types stay server-side
 * (ordering, Studio, analytics) and are never rendered as visible labels.
 * The thumbnail rail is hidden when there is only one image. Falls back to
 * a single art-placeholder stage when a product has no photos yet.
 */
export default function ProductGallery({ product, colorHex, images }) {
  const gallery = images && images.length ? images : [{ id: "primary", image: null, alt: null }];
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = activeIndex < gallery.length ? activeIndex : 0;
  const active = gallery[safeIndex];

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        <ProductVisual
          art={product.art}
          color={colorHex}
          src={active.image}
          alt={active.alt || `${product.name} — image ${safeIndex + 1}`}
          ratio="1 / 1"
          scale={1.04}
          priority
        />
      </div>

      {gallery.length > 1 ? (
        <ul className={styles.thumbs} aria-label="Product images">
          {gallery.map((image, index) => {
            const selected = index === safeIndex;
            return (
              <li key={image.id}>
                <button
                  type="button"
                  className={`${styles.thumb} ${selected ? styles.thumbOn : ""}`}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={selected}
                  aria-label={image.alt || `View product image ${index + 1}`}
                >
                  <ProductVisual
                    art={product.art}
                    color={colorHex}
                    src={image.image}
                    alt=""
                    ratio="1 / 1"
                    scale={0.9}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

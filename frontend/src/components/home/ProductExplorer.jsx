import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import ProductCard from "../ui/ProductCard";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import {
  catalogueProducts,
  explorerMobilePageSize,
  explorerPageSize,
} from "../../data/mockData";
import styles from "./ProductExplorer.module.css";

const TOTAL = catalogueProducts.length;
const MOBILE_MQ = "(max-width: 767px)";

function pageSizeForViewport() {
  if (typeof window === "undefined") return explorerPageSize;
  return window.matchMedia(MOBILE_MQ).matches
    ? explorerMobilePageSize
    : explorerPageSize;
}

/**
 * Homepage catalogue slice. Pagination is local to this component and only the
 * current page is rendered, so the homepage never carries the whole catalogue
 * in the DOM. Real listing/filtering belongs on the Product Listing page.
 */
export default function ProductExplorer() {
  const [pageSize, setPageSize] = useState(pageSizeForViewport);
  const [page, setPage] = useState(1);
  const gridRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      const next = mq.matches ? explorerMobilePageSize : explorerPageSize;
      setPageSize(next);
      setPage((current) => {
        const pages = Math.ceil(TOTAL / next);
        return Math.min(current, pages);
      });
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pages = Math.ceil(TOTAL / pageSize);
  const start = (page - 1) * pageSize;
  const visible = catalogueProducts.slice(start, start + pageSize);
  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

  const goTo = (next) => {
    if (next < 1 || next > pages || next === page) return;
    setPage(next);
    gridRef.current?.focus({ preventScroll: true });
    gridRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <Section
      id="products"
      tightTop
      ariaLabelledBy="product-explorer-title"
    >
      <SectionHeader
        titleId="product-explorer-title"
        title="Explore Products"
        compact
        action={
          <Button
            as={Link}
            to="/products"
            variant="secondary"
            size="md"
            trailingIcon="arrowRight"
          >
            View all products
          </Button>
        }
      />

      <ul
        className={styles.grid}
        ref={gridRef}
        tabIndex={-1}
        aria-label="Products"
      >
        {visible.map((product) => (
          <li key={product.id} className={styles.item}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <p className={styles.count} aria-live="polite">
          Showing {start + 1}–{start + visible.length} of {TOTAL} products
        </p>

        <nav className={styles.pager} aria-label="Product pages">
          <button
            type="button"
            className={styles.step}
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
          >
            <Icon name="arrowLeft" size={16} />
            <span className={styles.stepLabel}>Previous</span>
          </button>

          <span className={styles.pages}>
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.page} ${n === page ? styles.pageActive : ""}`}
                onClick={() => goTo(n)}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Page ${n} of ${pages}`}
              >
                {n}
              </button>
            ))}
          </span>

          <button
            type="button"
            className={styles.step}
            onClick={() => goTo(page + 1)}
            disabled={page === pages}
          >
            <span className={styles.stepLabel}>Next</span>
            <Icon name="arrowRight" size={16} />
          </button>
        </nav>
      </div>
    </Section>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCategories, getProducts } from "../api/catalog";
import CategoryStrip from "../components/catalogue/CategoryStrip";
import FilterDrawer from "../components/catalogue/FilterDrawer";
import FilterSidebar from "../components/catalogue/FilterSidebar";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import ProductCard from "../components/ui/ProductCard";
import { listingPageSize, listingSortOptions } from "../data/mockData";
import { flattenToLeafCategories } from "../utils/categories";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filterProducts,
  getActiveFilterChips,
  pageNumbers,
  sortProducts,
  toggleId,
} from "../utils/filterProducts";
import { useMediaQuery } from "../utils/useMediaQuery";
import styles from "./ProductListing.module.css";

const CHIP_LIMIT = 8;
const DESKTOP_MQ = "(min-width: 1100px)";
const ALL_PRODUCTS_OPTION = { id: "all", label: "All Products" };

/**
 * The category filter list previously came from a hardcoded array in
 * catalogData.js — accurate only by coincidence while the dev DB had the
 * same 5 categories that array happened to name. A real catalogue with a
 * real taxonomy (parent categories like Apparel/Drinkware that aren't
 * directly assigned to any product, only their children are) surfaced the
 * gap: several real leaf categories (Uniforms, Tote Bags, ...) were
 * simply invisible in this filter, and "Bottles & Drinkware" no longer
 * matched the real category's name. Flattens to leaf-only options — the
 * only categories any product can actually belong to — matching the
 * filter UI's existing flat (non-nested) shape exactly, so nothing here
 * changes visually. Tree-walking itself lives in utils/categories.js,
 * shared with the Homepage category section — this just adapts that
 * shared leaf list into the filter UI's `{id, label}` shape.
 */
function flattenToLeafCategoryOptions(categories) {
  const leaves = flattenToLeafCategories(categories).map((c) => ({ id: c.slug, label: c.name }));
  return [ALL_PRODUCTS_OPTION, ...leaves];
}

function applyLocationState(state, setQuery, setFilters) {
  if (!state) return;

  if (typeof state.q === "string") setQuery(state.q);

  if (state.category) {
    setFilters({
      ...EMPTY_FILTERS,
      categories: [state.category],
    });
    if (typeof state.q !== "string") setQuery("");
    return;
  }

  if (typeof state.q === "string") {
    setFilters(EMPTY_FILTERS);
  }
}

export default function ProductListing() {
  const location = useLocation();
  const isDesktop = useMediaQuery(DESKTOP_MQ);
  const resultsRef = useRef(null);

  const [navKey, setNavKey] = useState(location.key);
  const [query, setQuery] = useState(() =>
    typeof location.state?.q === "string" ? location.state.q : "",
  );
  const [sort, setSort] = useState("recommended");
  const [filters, setFilters] = useState(() =>
    location.state?.category
      ? { ...EMPTY_FILTERS, categories: [location.state.category] }
      : EMPTY_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [pageSignature, setPageSignature] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [loadError, setLoadError] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([ALL_PRODUCTS_OPTION]);

  if (location.key !== navKey) {
    setNavKey(location.key);
    applyLocationState(location.state, setQuery, setFilters);
  }

  if (isDesktop && drawerOpen) {
    setDrawerOpen(false);
  }

  // Loads the active catalogue once, then all filtering/sorting below stays
  // client-side over that fetched set — the existing filter/sort UX (multi-
  // select bands, instant response) is preserved rather than rebuilt around
  // a fetch-per-filter-change model. Revisit once the catalogue is too big
  // to reasonably fetch in one page load (see completion report).
  useEffect(() => {
    let cancelled = false;
    getProducts({ limit: 100 })
      .then(({ products: fetched }) => {
        if (cancelled) return;
        setProducts(fetched);
        setLoadStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message);
        setLoadStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((fetched) => {
        if (!cancelled) setCategoryOptions(flattenToLeafCategoryOptions(fetched));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const retryLoad = () => {
    setLoadStatus("loading");
    getProducts({ limit: 100 })
      .then(({ products: fetched }) => {
        setProducts(fetched);
        setLoadStatus("ready");
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoadStatus("error");
      });
  };

  const filtered = useMemo(
    () => sortProducts(filterProducts(products, filters, query), sort),
    [products, filters, query, sort],
  );

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / listingPageSize));
  const filterSignature = `${query}::${sort}::${JSON.stringify(filters)}`;
  const currentPage = Math.min(
    pageSignature === filterSignature ? page : 1,
    pages,
  );

  const start = total === 0 ? 0 : (currentPage - 1) * listingPageSize;
  const visible = filtered.slice(start, start + listingPageSize);
  const categoryLabelById = useMemo(
    () => Object.fromEntries(categoryOptions.map((item) => [item.id, item.label])),
    [categoryOptions],
  );
  const chips = getActiveFilterChips(filters, categoryLabelById);
  const extraChips = Math.max(0, chips.length - CHIP_LIMIT);
  const visibleChips = extraChips > 0 ? chips.slice(0, CHIP_LIMIT) : chips;
  const filterCount = countActiveFilters(filters);
  const numbers = pageNumbers(currentPage, pages);

  const toggleFilter = (group, id) => {
    setFilters((current) => ({
      ...current,
      [group]: toggleId(current[group], id),
    }));
  };

  const toggleCustomizable = () => {
    setFilters((current) => ({
      ...current,
      customizable: !current.customizable,
    }));
  };

  const selectCategory = (id) => {
    setFilters((current) => ({
      ...current,
      categories: id === "all" ? [] : [id],
    }));
  };

  const removeChip = (chip) => {
    if (chip.group === "customizable") {
      setFilters((current) => ({ ...current, customizable: false }));
      return;
    }
    setFilters((current) => ({
      ...current,
      [chip.group]: current[chip.group].filter((item) => item !== chip.id),
    }));
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setQuery("");
  };

  const goToPage = (next) => {
    if (next < 1 || next > pages || next === currentPage) return;
    setPage(next);
    setPageSignature(filterSignature);
    resultsRef.current?.focus({ preventScroll: true });
    resultsRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <main id="main" className={styles.page}>
      <div className={`container ${styles.intro}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li aria-current="page">Products</li>
          </ol>
        </nav>

        <p className="eyebrow">Products</p>
        <h1 className={styles.title}>Custom Products for Your Brand</h1>
        <p className={styles.lede}>
          Explore apparel, corporate gifts, promotional products and branded
          business essentials.
        </p>
      </div>

      <div className={`container ${styles.shell}`}>
        <CategoryStrip
          selected={filters.categories}
          onSelect={selectCategory}
          categories={categoryOptions}
        />

        <div className={styles.controls}>
          <p className={styles.count} aria-live="polite">
            {loadStatus === "loading"
              ? "Loading…"
              : `${total} ${total === 1 ? "Product" : "Products"}`}
          </p>

          <div className={styles.tools}>
            <form
              className={styles.search}
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="visually-hidden" htmlFor="catalogue-search">
                Search products
              </label>
              <Icon name="search" size={16} className={styles.searchIcon} />
              <input
                id="catalogue-search"
                className={styles.searchInput}
                type="search"
                placeholder="Search products..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
            </form>

            {!isDesktop ? (
              <button
                type="button"
                className={styles.filterBtn}
                onClick={() => setDrawerOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={drawerOpen}
              >
                <Icon name="sliders" size={16} />
                Filters
                {filterCount > 0 ? (
                  <span className={styles.badge}>{filterCount}</span>
                ) : null}
              </button>
            ) : null}

            <label className={styles.sort}>
              <span className={styles.sortLabel}>Sort by</span>
              <select
                className={styles.sortSelect}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {listingSortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {chips.length > 0 ? (
          <div className={styles.chips} aria-label="Active filters">
            {visibleChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={styles.chip}
                onClick={() => removeChip(chip)}
              >
                {chip.label}
                <span aria-hidden="true">×</span>
                <span className="visually-hidden"> Remove filter</span>
              </button>
            ))}
            {extraChips > 0 ? (
              <span className={styles.moreChips}>+{extraChips} more</span>
            ) : null}
            <button
              type="button"
              className={styles.clear}
              onClick={clearFilters}
            >
              Clear all
            </button>
          </div>
        ) : null}

        <div className={styles.layout}>
          {isDesktop ? (
            <aside className={styles.sidebar} aria-label="Product filters">
              <FilterSidebar
                filters={filters}
                onToggle={toggleFilter}
                onCustomizable={toggleCustomizable}
                idPrefix="desktop-filter"
                categories={categoryOptions}
              />
            </aside>
          ) : null}

          <section
            className={styles.results}
            aria-labelledby="catalogue-results-title"
          >
            <h2 id="catalogue-results-title" className="visually-hidden">
              Product results
            </h2>

            {loadStatus === "loading" ? (
              <div className={styles.empty} aria-live="polite">
                <p className={styles.emptyTitle}>Loading products…</p>
              </div>
            ) : loadStatus === "error" ? (
              <div className={styles.empty} role="alert">
                <p className={styles.emptyTitle}>Couldn&rsquo;t load products.</p>
                <p className={styles.emptyCopy}>{loadError}</p>
                <div className={styles.emptyActions}>
                  <Button variant="primary" size="md" onClick={retryLoad}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : total === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>
                  No products match your filters.
                </p>
                <p className={styles.emptyCopy}>
                  Try clearing filters or search, or talk to us about a custom
                  quantity.
                </p>
                <div className={styles.emptyActions}>
                  <Button variant="primary" size="md" onClick={clearAll}>
                    Clear Filters
                  </Button>
                  <Button variant="secondary" size="md" type="button">
                    Chat with Us
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ul
                  ref={resultsRef}
                  className={styles.grid}
                  tabIndex={-1}
                  aria-label="Products"
                >
                  {visible.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        product={product}
                        showSwatches
                        compactMobile
                        detailsTo={`/products/${product.id}`}
                        tryHref={`/customize/${product.id}`}
                      />
                    </li>
                  ))}
                </ul>

                {pages > 1 ? (
                  <nav className={styles.pager} aria-label="Catalogue pages">
                  <button
                    type="button"
                    className={styles.step}
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Icon name="arrowLeft" size={16} />
                    <span className={styles.stepLabel}>Previous</span>
                  </button>

                  <span className={styles.pages}>
                    {numbers.map((item, index) =>
                      item === "ellipsis" ? (
                        <span
                          key={`e-${index}`}
                          className={styles.ellipsis}
                          aria-hidden="true"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          className={`${styles.pageBtn} ${
                            item === currentPage ? styles.pageActive : ""
                          }`}
                          onClick={() => goToPage(item)}
                          aria-current={
                            item === currentPage ? "page" : undefined
                          }
                          aria-label={`Page ${item} of ${pages}`}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  </span>

                  <button
                    type="button"
                    className={styles.step}
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === pages}
                  >
                    <span className={styles.stepLabel}>Next</span>
                    <Icon name="arrowRight" size={16} />
                    </button>
                  </nav>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>

      <FilterDrawer
        open={!isDesktop && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onToggle={toggleFilter}
        onCustomizable={toggleCustomizable}
        onClear={clearFilters}
        resultCount={total}
        onApply={() => setDrawerOpen(false)}
        categories={categoryOptions}
      />
    </main>
  );
}

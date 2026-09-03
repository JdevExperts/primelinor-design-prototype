import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProductsAdmin, listCategoriesAdmin } from "../../api/catalog";
import { useAdminAuth } from "../../context/useAdminAuth";
import styles from "../../components/adminTable.module.css";

export default function ProductsList() {
  const { staffUser } = useAdminAuth();
  const isAdmin = staffUser?.role === "ADMIN";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState("");
  const [priceMode, setPriceMode] = useState("");
  const [customizable, setCustomizable] = useState("");
  const [sort, setSort] = useState("sortOrder");
  const [loadStatus, setLoadStatus] = useState("loading");
  const limit = 25;

  useEffect(() => {
    listCategoriesAdmin()
      .then(({ categories: list }) => setCategories(list))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadStatus("loading");
    listProductsAdmin({ page, limit, search: search || undefined, category: category || undefined, active, priceMode, customizable, sort })
      .then(({ products: list, total: count }) => {
        if (cancelled) return;
        setProducts(list);
        setTotal(count);
        setLoadStatus("ready");
      })
      .catch(() => !cancelled && setLoadStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [page, search, category, active, priceMode, customizable, sort]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Products</h1>
        {isAdmin ? (
          <Link to="/admin/catalog/products/new" className={styles.actionLink}>
            + Add Product
          </Link>
        ) : null}
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search name, slug or product code…"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          value={category}
          onChange={(event) => {
            setPage(1);
            setCategory(event.target.value);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={active}
          onChange={(event) => {
            setPage(1);
            setActive(event.target.value);
          }}
        >
          <option value="">Active + Inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
        <select
          value={priceMode}
          onChange={(event) => {
            setPage(1);
            setPriceMode(event.target.value);
          }}
        >
          <option value="">All pricing modes</option>
          <option value="FIXED">Fixed</option>
          <option value="TIERED">Tiered</option>
          <option value="QUOTE_ONLY">Quote Only</option>
        </select>
        <select
          value={customizable}
          onChange={(event) => {
            setPage(1);
            setCustomizable(event.target.value);
          }}
        >
          <option value="">Customizable + Not</option>
          <option value="true">Customizable only</option>
          <option value="false">Not customizable</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="sortOrder">Sort order</option>
          <option value="updatedAt">Recently updated</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loadStatus === "loading" ? (
          <p className={styles.empty}>Loading…</p>
        ) : loadStatus === "error" ? (
          <p className={styles.empty}>Couldn&rsquo;t load products.</p>
        ) : products.length === 0 ? (
          <p className={styles.empty}>No products match these filters.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Code</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>MOQ</th>
                <th>Customizable</th>
                <th>Status</th>
                <th>Sort Order</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail.url}
                        alt={product.thumbnail.alt || product.name}
                        width={36}
                        height={36}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                      />
                    ) : product.active ? (
                      // Active product with zero ProductAsset rows — a real
                      // completeness gap worth flagging (Solutions/Catalogue
                      // Audit §25/§26), warn-only, never a save/activate
                      // blocker (no fabricated imagery).
                      <span style={{ fontSize: 10, color: "#b42318", fontWeight: 600 }}>NO IMAGE</span>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td>
                    <Link className={styles.rowLink} to={`/admin/catalog/products/${product.id}`}>
                      {product.name}
                    </Link>
                    <br />
                    <span className={styles.muted}>{product.slug}</span>
                    {product.active && product.variantType === "size" && product.activeVariantCount === 0 ? (
                      <>
                        <br />
                        {/* Size-typed but zero active ProductVariant rows — PDP renders
                            no Available Sizes line at all (Product Data Completeness §23). */}
                        <span style={{ fontSize: 10, color: "#b42318", fontWeight: 600 }}>NO SIZES</span>
                      </>
                    ) : null}
                    {product.active && product.specificationCount < 2 ? (
                      <>
                        <br />
                        {/* Fewer than 2 ProductSpecification rows — the Product Details
                            section reads as thin/placeholder, not a real spec sheet. */}
                        <span style={{ fontSize: 10, color: "#b54708", fontWeight: 600 }}>THIN DETAILS</span>
                      </>
                    ) : null}
                  </td>
                  <td>
                    <span style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em", userSelect: "all" }}>
                      {product.productCode || "—"}
                    </span>
                  </td>
                  <td className={styles.muted}>
                    {product.primaryCategory?.name || "—"}
                    {product.categoryCount > 1 ? <span style={{ marginLeft: 4, color: "#98a2b3" }}>+{product.categoryCount - 1}</span> : null}
                  </td>
                  <td>{product.priceSummary}</td>
                  <td>{product.moq}</td>
                  <td>{product.customizable ? "Yes" : "No"}</td>
                  <td>{product.active ? "Active" : "Inactive"}</td>
                  <td>{product.sortOrder}</td>
                  <td className={styles.muted}>{new Date(product.updatedAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <Link className={styles.actionLink} to={`/admin/catalog/products/${product.id}`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 ? (
        <div className={styles.pager}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

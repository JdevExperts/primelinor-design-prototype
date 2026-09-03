import { useEffect, useRef, useState } from "react";
import { listProductsAdmin } from "../api/catalog";

/**
 * Backend-driven catalogue picker (Phase D). Debounced search of
 * GET /admin/catalog/products by name / Product Code — never loads the
 * whole catalogue. Calls `onSelect(product)` with the chosen row.
 */
export default function ProductPicker({ onSelect, placeholder = "Search by product name or code…", autoFocus = false }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return undefined;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      listProductsAdmin({ search: q, limit: 8, sort: "name" })
        .then(({ products }) => {
          setResults(products || []);
          setOpen(true);
          setActiveIndex(-1);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [term]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (product) => {
    onSelect(product);
    setTerm("");
    setResults([]);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (!open || !results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      choose(results[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <input
        type="search"
        value={term}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event) => setTerm(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => results.length && setOpen(true)}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d5dd", borderRadius: 6, fontSize: 13 }}
        aria-label="Search catalogue products"
        aria-expanded={open}
      />
      {open ? (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 20,
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            margin: 0,
            padding: 4,
            listStyle: "none",
            background: "#fff",
            border: "1px solid #d0d5dd",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(16,24,40,0.12)",
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {loading && !results.length ? (
            <li style={{ padding: 10, fontSize: 12.5, color: "#667085" }}>Searching…</li>
          ) : null}
          {!loading && !results.length ? (
            <li style={{ padding: 10, fontSize: 12.5, color: "#667085" }}>No matching products.</li>
          ) : null}
          {results.map((product, index) => (
            <li key={product.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(product)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: 6,
                  background: index === activeIndex ? "#f2f4f7" : "transparent",
                  cursor: "pointer",
                  display: "grid",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>
                  {product.productCode} · {product.name}
                </span>
                <span style={{ fontSize: 11.5, color: "#667085" }}>
                  {product.primaryCategory?.name || "—"} · MOQ {product.moq} · {product.priceMode}
                  {product.priceSummary && product.priceSummary !== "—" ? ` · ${product.priceSummary}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

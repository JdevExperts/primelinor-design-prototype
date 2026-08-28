import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSolutionAdmin, listProductsAdmin } from "../../api/catalog";
import { useAdminAuth } from "../../context/useAdminAuth";
import BasicsTab from "./solutionEditor/BasicsTab";
import ContentTab from "./solutionEditor/ContentTab";
import ImageTab from "./solutionEditor/ImageTab";
import ProductsTab from "./solutionEditor/ProductsTab";
import styles from "../../components/adminDetail.module.css";

const TABS = [
  { key: "basics", label: "Basics" },
  { key: "content", label: "Content" },
  { key: "image", label: "Image" },
  { key: "products", label: "Products" },
];

export default function SolutionEditor() {
  const { id } = useParams();
  const { staffUser } = useAdminAuth();
  const isAdmin = staffUser?.role === "ADMIN";
  const [solution, setSolution] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [allProducts, setAllProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("basics");
  const [dirty, setDirty] = useState(false);

  const load = () => {
    getSolutionAdmin(id)
      .then((res) => {
        setSolution(res.solution);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, [id]);

  useEffect(() => {
    // Admin list query caps `limit` at 100 (adminListProductsQuerySchema)
    // — 500 was silently rejected with a 400, swallowed by .catch(() => {}),
    // which is exactly the same latent bug ProductEditor.jsx's identical
    // call had (fixed alongside this one).
    listProductsAdmin({ limit: 100, sort: "name" })
      .then(({ products: list }) => setAllProducts(list))
      .catch(() => {});
  }, []);

  const handleTabChange = (tabKey) => {
    if (dirty && !window.confirm("You have unsaved changes on this tab. Switch anyway?")) return;
    setDirty(false);
    setActiveTab(tabKey);
  };

  const handleSaved = (updated) => setSolution(updated);

  if (loadStatus === "loading") return <p className={styles.page}>Loading…</p>;
  if (loadStatus === "error" || !solution) return <p className={styles.page}>Couldn&rsquo;t load this solution.</p>;

  return (
    <div className={styles.page} style={{ maxWidth: 900 }}>
      <div className={styles.breadcrumb}>
        <Link to="/admin/catalog/solutions">&larr; Solutions</Link>
      </div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {solution.name}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: solution.active ? "#166534" : "#92400e",
              background: solution.active ? "#dcfce7" : "#fef3c7",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            {solution.active ? "Active" : "Draft"}
          </span>
        </h1>
        <div className={styles.buttonRow}>
          {solution.active ? (
            <a
              className={styles.buttonSecondary}
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              href={`/solutions/${solution.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View Solution
            </a>
          ) : null}
        </div>
      </div>

      {solution.activeProductCount === 0 ? (
        <p className={styles.errorMessage} style={{ background: "#fef3c7", color: "#92400e" }}>
          NO PRODUCTS — this Solution has zero active mapped products. It cannot be activated until at least one is
          mapped on the Products tab.
        </p>
      ) : null}
      {!solution.image ? (
        <p className={styles.errorMessage} style={{ background: "#f0f4fa", color: "#0f1b2d" }}>
          NO IMAGE — the art/color placeholder is shown publicly until a real photo is uploaded on the Image tab.
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--color-border, #e5e7eb)", flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: "8px 12px",
              fontSize: 12.5,
              fontWeight: 600,
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--color-navy, #0f1b2d)" : "2px solid transparent",
              color: activeTab === tab.key ? "var(--color-navy, #0f1b2d)" : "#6b7280",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!isAdmin ? (
        <p className={styles.errorMessage} style={{ background: "#f0f4fa", color: "#0f1b2d" }}>
          View only — SALES can view Solutions but cannot edit them. Ask an admin to make changes.
        </p>
      ) : null}

      <div style={!isAdmin ? { pointerEvents: "none", opacity: 0.65 } : undefined}>
        {activeTab === "basics" ? <BasicsTab solution={solution} onSaved={handleSaved} setDirty={setDirty} /> : null}
        {activeTab === "content" ? <ContentTab solution={solution} onSaved={handleSaved} setDirty={setDirty} /> : null}
        {activeTab === "image" ? <ImageTab solution={solution} onSaved={handleSaved} /> : null}
        {activeTab === "products" ? <ProductsTab solution={solution} allProducts={allProducts} onSaved={handleSaved} /> : null}
      </div>
    </div>
  );
}

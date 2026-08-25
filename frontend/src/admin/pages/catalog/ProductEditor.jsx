import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getProductAdmin,
  listCategoriesAdmin,
  listColorsAdmin,
  listTagsAdmin,
  listProductsAdmin,
  duplicateProductAdmin,
} from "../../api/catalog";
import { useAdminAuth } from "../../context/useAdminAuth";
import BasicsTab from "./productEditor/BasicsTab";
import PricingTab from "./productEditor/PricingTab";
import ColorsVariantsTab from "./productEditor/ColorsVariantsTab";
import SpecificationsTab from "./productEditor/SpecificationsTab";
import ImagesTab from "./productEditor/ImagesTab";
import CustomizationTab from "./productEditor/CustomizationTab";
import RelatedTagsTab from "./productEditor/RelatedTagsTab";
import styles from "../../components/adminDetail.module.css";

const TABS = [
  { key: "basics", label: "Basics" },
  { key: "pricing", label: "Pricing" },
  { key: "colors", label: "Colors & Variants" },
  { key: "specs", label: "Specifications" },
  { key: "images", label: "Images" },
  { key: "customization", label: "Customization" },
  { key: "related", label: "Related & Tags" },
];

/** Prevents accidental loss (Phase 5 §67) — a real beforeunload prompt for the cross-tab/close case; in-app tab switches just carry the state forward since nothing is destroyed. */
function useUnsavedWarning(dirty) {
  useEffect(() => {
    function handler(event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staffUser } = useAdminAuth();
  const isAdmin = staffUser?.role === "ADMIN";
  const [product, setProduct] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [tags, setTags] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("basics");
  const [dirty, setDirty] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  useUnsavedWarning(dirty);

  const load = () => {
    getProductAdmin(id)
      .then((res) => {
        setProduct(res.product);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, [id]);

  useEffect(() => {
    listCategoriesAdmin().then(({ categories: list }) => setCategories(list)).catch(() => {});
    listColorsAdmin().then(({ colors: list }) => setColors(list)).catch(() => {});
    listTagsAdmin().then(({ tags: list }) => setTags(list)).catch(() => {});
    listProductsAdmin({ limit: 500, sort: "name" })
      .then(({ products: list }) => setAllProducts(list))
      .catch(() => {});
  }, []);

  const handleTabChange = (tabKey) => {
    if (dirty && !window.confirm("You have unsaved changes on this tab. Switch anyway?")) return;
    setDirty(false);
    setActiveTab(tabKey);
  };

  const handleSaved = (updated) => setProduct(updated);

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const { product: copy } = await duplicateProductAdmin(id, {});
      navigate(`/admin/catalog/products/${copy.id}`);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setDuplicating(false);
    }
  };

  if (loadStatus === "loading") return <p className={styles.page}>Loading…</p>;
  if (loadStatus === "error" || !product) return <p className={styles.page}>Couldn&rsquo;t load this product.</p>;

  return (
    <div className={styles.page} style={{ maxWidth: 900 }}>
      <div className={styles.breadcrumb}>
        <Link to="/admin/catalog/products">&larr; Products</Link>
      </div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {product.name}
          <span style={{ fontSize: 11, fontWeight: 600, color: product.active ? "#166534" : "#92400e", background: product.active ? "#dcfce7" : "#fef3c7", padding: "2px 8px", borderRadius: 4 }}>
            {product.active ? "Active" : "Inactive"}
          </span>
        </h1>
        <div className={styles.buttonRow}>
          {product.active ? (
            <a className={styles.buttonSecondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }} href={`/products/${product.slug}`} target="_blank" rel="noreferrer">
              View Product
            </a>
          ) : null}
          {isAdmin ? (
            <button type="button" className={styles.buttonSecondary} onClick={handleDuplicate} disabled={duplicating}>
              {duplicating ? "Duplicating…" : "Duplicate Product"}
            </button>
          ) : null}
        </div>
      </div>

      {product.customizationIncomplete ? (
        <p className={styles.errorMessage} style={{ background: "#fef3c7", color: "#92400e" }}>
          Marked Customizable but missing a customization image or an active placement zone — Try Your Logo won&rsquo;t
          work correctly for this product yet. See the Customization tab.
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
          View only — SALES can view catalogue details but cannot edit them. Ask an admin to make changes.
        </p>
      ) : null}

      {/* Catalogue mutation is ADMIN-only (Phase 5 §3) — backend already
          rejects a SALES write with 403 regardless, but disabling every
          control here too means a SALES user never fills out a form only
          to have it silently fail on submit. pointer-events:none on this
          wrapper is a single, comprehensive disable across every tab's
          inputs/buttons rather than threading a readOnly prop through
          seven separate tab components for the same effect. */}
      <div style={!isAdmin ? { pointerEvents: "none", opacity: 0.65 } : undefined}>
        {activeTab === "basics" ? <BasicsTab product={product} categories={categories} onSaved={handleSaved} setDirty={setDirty} /> : null}
        {activeTab === "pricing" ? <PricingTab product={product} onSaved={handleSaved} setDirty={setDirty} /> : null}
        {activeTab === "colors" ? <ColorsVariantsTab product={product} allColors={colors} onSaved={handleSaved} setDirty={setDirty} /> : null}
        {activeTab === "specs" ? <SpecificationsTab product={product} onSaved={handleSaved} setDirty={setDirty} /> : null}
        {activeTab === "images" ? <ImagesTab product={product} colors={colors} onSaved={handleSaved} /> : null}
        {activeTab === "customization" ? <CustomizationTab product={product} colors={colors} onSaved={handleSaved} /> : null}
        {activeTab === "related" ? (
          <RelatedTagsTab
            product={product}
            allProducts={allProducts}
            allTags={tags}
            onSaved={handleSaved}
            onTagCreated={(tag) => setTags((current) => [...current, tag])}
            setDirty={setDirty}
          />
        ) : null}
      </div>
    </div>
  );
}

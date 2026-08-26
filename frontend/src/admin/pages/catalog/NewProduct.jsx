import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProductAdmin } from "../../api/catalog";
import { listCategoriesAdmin } from "../../api/catalog";
import { BasicsFieldSet, PricingFieldSet, basicsToPayload, pricingToPayload, emptyBasics, emptyPricing } from "./productEditor/fieldSets";
import styles from "../../components/adminDetail.module.css";

export default function NewProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [basics, setBasics] = useState(emptyBasics());
  const [pricing, setPricing] = useState(emptyPricing());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    listCategoriesAdmin()
      .then(({ categories: list }) => setCategories(list.filter((c) => c.active)))
      .catch(() => {});
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { product } = await createProductAdmin({ ...basicsToPayload(basics), ...pricingToPayload(pricing) });
      navigate(`/admin/catalog/products/${product.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/admin/catalog/products">&larr; Products</Link>
      </div>
      <div className={styles.header}>
        <h1 className={styles.title}>Add Product</h1>
      </div>

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <form onSubmit={handleCreate} style={{ display: "grid", gap: 16 }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Basics</div>
          <BasicsFieldSet values={basics} onChange={setBasics} categories={categories} />
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Pricing</div>
          <PricingFieldSet values={pricing} onChange={setPricing} />
        </div>
        <div className={styles.buttonRow}>
          <button type="submit" className={styles.button} disabled={saving}>
            {saving ? "Creating…" : "Create Product"}
          </button>
          <Link to="/admin/catalog/products" className={styles.buttonSecondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Cancel
          </Link>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280" }}>
          Colors, variants, specifications, images, customization placement zones, related products and tags can be
          added once the product is created — the product starts Inactive-safe as-is until you finish setting it up
          (toggle Active above whenever it&rsquo;s ready to publish).
        </p>
      </form>
    </div>
  );
}

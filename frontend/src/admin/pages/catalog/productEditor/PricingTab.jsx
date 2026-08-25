import { useEffect, useState } from "react";
import { updateProductAdmin } from "../../../api/catalog";
import { PricingFieldSet, pricingToPayload, pricingFromProduct } from "./fieldSets";
import styles from "../../../components/adminDetail.module.css";

export default function PricingTab({ product, onSaved, setDirty }) {
  const [values, setValues] = useState(() => pricingFromProduct(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValues(pricingFromProduct(product));
  }, [product.id]);

  const handleChange = (next) => {
    setValues(next);
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { product: updated } = await updateProductAdmin(product.id, pricingToPayload(values));
      setDirty(false);
      setSaved(true);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className={styles.card}>
      <div className={styles.cardTitle}>Pricing</div>
      <p style={{ fontSize: 12.5, color: "#6b7280" }}>Current: {product.priceSummary}</p>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <PricingFieldSet values={values} onChange={handleChange} />
      <div className={styles.buttonRow}>
        <button type="submit" className={styles.button} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save Pricing"}
        </button>
      </div>
    </form>
  );
}

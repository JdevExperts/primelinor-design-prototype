import { useEffect, useState } from "react";
import { updateProductAdmin } from "../../../api/catalog";
import { BasicsFieldSet, basicsToPayload, basicsFromProduct } from "./fieldSets";
import styles from "../../../components/adminDetail.module.css";

export default function BasicsTab({ product, categories, onSaved, setDirty }) {
  const [values, setValues] = useState(() => basicsFromProduct(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValues(basicsFromProduct(product));
  }, [product.id]);

  const slugChanged = values.slug !== product.slug;

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
      const { product: updated } = await updateProductAdmin(product.id, basicsToPayload(values));
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
      <div className={styles.cardTitle}>Basics</div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <BasicsFieldSet
        values={values}
        onChange={handleChange}
        categories={categories}
        slugWarning={
          slugChanged
            ? "Changing the slug on a published product breaks its existing /products/... URL — no redirect is created."
            : null
        }
      />
      <div className={styles.buttonRow}>
        <button type="submit" className={styles.button} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save Basics"}
        </button>
      </div>
    </form>
  );
}

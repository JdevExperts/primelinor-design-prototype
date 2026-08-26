import { useEffect, useState } from "react";
import { updateProductAdmin } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";

let keySeq = 0;
function newKey() {
  keySeq += 1;
  return `spec-${keySeq}`;
}

function specsFromProduct(product) {
  return (product.specifications || []).map((s) => ({ key: newKey(), label: s.label, value: s.value }));
}

/** Ordered label/value pairs — Phase 5 §18, deliberately not an EAV system. */
export default function SpecificationsTab({ product, onSaved, setDirty }) {
  const [specs, setSpecs] = useState(() => specsFromProduct(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSpecs(specsFromProduct(product));
  }, [product.id]);

  const touch = () => {
    setDirty(true);
    setSaved(false);
  };

  const addSpec = () => {
    touch();
    setSpecs((current) => [...current, { key: newKey(), label: "", value: "" }]);
  };
  const updateSpec = (key, patch) => {
    touch();
    setSpecs((current) => current.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };
  const removeSpec = (key) => {
    touch();
    setSpecs((current) => current.filter((s) => s.key !== key));
  };
  const moveSpec = (key, dir) => {
    touch();
    setSpecs((current) => {
      const index = current.findIndex((s) => s.key === key);
      const target = index + dir;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { product: updated } = await updateProductAdmin(product.id, {
        specifications: specs.map((s, i) => ({ label: s.label.trim(), value: s.value.trim(), sortOrder: i })),
      });
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
      <div className={styles.cardTitle}>Specifications</div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <div style={{ display: "grid", gap: 8 }}>
        {specs.map((spec, index) => (
          <div key={spec.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className={styles.input} style={{ width: 160 }} placeholder="Fabric" value={spec.label} onChange={(e) => updateSpec(spec.key, { label: e.target.value })} />
            <input className={styles.input} style={{ flex: 1 }} placeholder="100% Cotton" value={spec.value} onChange={(e) => updateSpec(spec.key, { value: e.target.value })} />
            <button type="button" className={styles.buttonSecondary} onClick={() => moveSpec(spec.key, -1)} disabled={index === 0}>
              ↑
            </button>
            <button type="button" className={styles.buttonSecondary} onClick={() => moveSpec(spec.key, 1)} disabled={index === specs.length - 1}>
              ↓
            </button>
            <button type="button" className={styles.buttonSecondary} onClick={() => removeSpec(spec.key)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className={styles.buttonRow}>
        <button type="button" className={styles.buttonSecondary} onClick={addSpec}>
          + Add Specification
        </button>
        <button type="submit" className={styles.button} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save Specifications"}
        </button>
      </div>
    </form>
  );
}

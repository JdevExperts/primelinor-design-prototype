import { useEffect, useState } from "react";
import { updateProductAdmin } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";

const STANDARD_APPAREL_SIZES = ["S", "M", "L", "XL", "2XL"];

let keySeq = 0;
function newKey() {
  keySeq += 1;
  return `k-${keySeq}`;
}

function colorsFromProduct(product) {
  return (product.colors || []).map((pc) => ({ key: newKey(), colorId: pc.colorId, active: pc.active, sortOrder: pc.sortOrder }));
}

function variantsFromProduct(product) {
  return (product.variants || []).map((v) => ({ key: newKey(), code: v.code, label: v.label, active: v.active, sortOrder: v.sortOrder }));
}

/** Colors & Variants — Phase 5 §14-17. Colors are picked from the reusable Color list, never typed by id. */
export default function ColorsVariantsTab({ product, allColors, onSaved, setDirty }) {
  const [selectedColors, setSelectedColors] = useState(() => colorsFromProduct(product));
  const [variants, setVariants] = useState(() => variantsFromProduct(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelectedColors(colorsFromProduct(product));
    setVariants(variantsFromProduct(product));
  }, [product.id]);

  const touch = () => {
    setDirty(true);
    setSaved(false);
  };

  const toggleColor = (colorId) => {
    touch();
    setSelectedColors((current) => {
      const exists = current.find((c) => c.colorId === colorId);
      if (exists) return current.filter((c) => c.colorId !== colorId);
      return [...current, { key: newKey(), colorId, active: true, sortOrder: current.length }];
    });
  };

  const addVariant = () => {
    touch();
    setVariants((current) => [...current, { key: newKey(), code: "", label: "", active: true, sortOrder: current.length }]);
  };
  const updateVariant = (key, patch) => {
    touch();
    setVariants((current) => current.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  };
  const removeVariant = (key) => {
    touch();
    setVariants((current) => current.filter((v) => v.key !== key));
  };
  const addStandardSizes = () => {
    touch();
    setVariants((current) => [
      ...current,
      ...STANDARD_APPAREL_SIZES.filter((size) => !current.some((v) => v.code.toLowerCase() === size.toLowerCase())).map((size, i) => ({
        key: newKey(),
        code: size.toLowerCase(),
        label: size,
        active: true,
        sortOrder: current.length + i,
      })),
    ]);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { product: updated } = await updateProductAdmin(product.id, {
        colorIds: selectedColors.map((c, i) => ({ colorId: c.colorId, active: c.active, sortOrder: i })),
        variants: variants.map((v, i) => ({ code: v.code.trim(), label: v.label.trim(), active: v.active, sortOrder: i })),
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
    <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Colors</div>
        {error ? <p className={styles.errorMessage}>{error}</p> : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allColors.map((color) => {
            const isSelected = selectedColors.some((c) => c.colorId === color.id);
            return (
              <label
                key={color.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid var(--color-border-strong, #d3d8e0)",
                  borderRadius: 6,
                  padding: "5px 9px",
                  fontSize: 12.5,
                  background: isSelected ? "#f0f4fa" : "#fff",
                }}
              >
                <input type="checkbox" checked={isSelected} onChange={() => toggleColor(color.id)} />
                {color.hex ? (
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: color.hex, border: "1px solid #ddd", display: "inline-block" }} />
                ) : null}
                {color.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Variants</div>
        <div style={{ display: "grid", gap: 8 }}>
          {variants.map((variant) => (
            <div key={variant.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className={styles.input}
                style={{ width: 100 }}
                placeholder="Code (m)"
                value={variant.code}
                onChange={(e) => updateVariant(variant.key, { code: e.target.value })}
              />
              <input
                className={styles.input}
                style={{ width: 140 }}
                placeholder="Label (M)"
                value={variant.label}
                onChange={(e) => updateVariant(variant.key, { label: e.target.value })}
              />
              <label style={{ fontSize: 12 }}>
                <input type="checkbox" checked={variant.active} onChange={(e) => updateVariant(variant.key, { active: e.target.checked })} /> Active
              </label>
              <button type="button" className={styles.buttonSecondary} onClick={() => removeVariant(variant.key)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className={styles.buttonRow}>
          <button type="button" className={styles.buttonSecondary} onClick={addVariant}>
            + Add Variant
          </button>
          <button type="button" className={styles.buttonSecondary} onClick={addStandardSizes}>
            + Add Standard Apparel Sizes
          </button>
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button type="submit" className={styles.button} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save Colors & Variants"}
        </button>
      </div>
    </form>
  );
}

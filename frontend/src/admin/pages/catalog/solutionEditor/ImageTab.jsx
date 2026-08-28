import { useRef, useState } from "react";
import { uploadSolutionImage, removeSolutionImage } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";

export default function ImageTab({ solution, onSaved }) {
  const inputRef = useRef(null);
  const [alt, setAlt] = useState(solution.image?.alt || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    setSaving(true);
    setError(null);
    try {
      const { solution: updated } = await uploadSolutionImage(solution.id, file, alt || solution.name);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError(null);
    try {
      const { solution: updated } = await removeSolutionImage(solution.id);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.card} style={{ display: "grid", gap: 12 }}>
      <div className={styles.cardTitle}>Hero Image</div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
        Not required to save or activate a Solution — until a real photo is uploaded here, the public pages fall back
        to the art/color placeholder. No image is generated automatically.
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {solution.image ? (
          <img src={solution.image.url} alt={solution.image.alt || solution.name} width={160} height={112} style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }} />
        ) : (
          <div style={{ width: 160, height: 112, borderRadius: 6, border: "1px dashed #d0d5dd", display: "grid", placeItems: "center", fontSize: 11, color: "#98a2b3" }}>
            No image
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          <label>
            <div className={styles.fieldLabel}>Alt text</div>
            <input className={styles.input} value={alt} onChange={(e) => setAlt(e.target.value)} disabled={saving} />
          </label>
          <div className={styles.buttonRow}>
            <label className={styles.buttonSecondary} style={{ cursor: saving ? "default" : "pointer" }}>
              {saving ? "Saving…" : solution.image ? "Replace" : "Upload"}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                disabled={saving}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
            {solution.image ? (
              <button type="button" className={styles.buttonSecondary} onClick={handleRemove} disabled={saving} style={{ color: "#b42318" }}>
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { updateProductAdmin, createTagAdmin } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";

export default function RelatedTagsTab({ product, allProducts, allTags, onSaved, onTagCreated, setDirty }) {
  const [relatedIds, setRelatedIds] = useState(() => (product.relatedProducts || []).map((p) => p.id));
  const [tagIds, setTagIds] = useState(() => (product.tags || []).map((t) => t.id));
  const [search, setSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [saving, setSaving] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRelatedIds((product.relatedProducts || []).map((p) => p.id));
    setTagIds((product.tags || []).map((t) => t.id));
  }, [product.id]);

  const touch = () => {
    setDirty(true);
    setSaved(false);
  };

  const toggleRelated = (id) => {
    touch();
    setRelatedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };
  const toggleTag = (id) => {
    touch();
    setTagIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };

  const handleCreateTag = async (event) => {
    event.preventDefault();
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    setError(null);
    try {
      const slug = newTagName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const { tag } = await createTagAdmin({ name: newTagName.trim(), slug });
      onTagCreated(tag);
      setTagIds((current) => [...current, tag.id]);
      setNewTagName("");
      touch();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { product: updated } = await updateProductAdmin(product.id, { relatedProductIds: relatedIds, tagIds });
      setDirty(false);
      setSaved(true);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const candidateProducts = allProducts.filter(
    (p) => p.id !== product.id && (search === "" || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.card}>
        <div className={styles.cardTitle}>Tags / Use Cases</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allTags.map((tag) => (
            <label
              key={tag.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid var(--color-border-strong, #d3d8e0)",
                borderRadius: 6,
                padding: "5px 9px",
                fontSize: 12.5,
                background: tagIds.includes(tag.id) ? "#f0f4fa" : "#fff",
              }}
            >
              <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
              {tag.name}
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input className={styles.input} style={{ width: 200 }} placeholder="New tag name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
          <button type="button" className={styles.buttonSecondary} onClick={handleCreateTag} disabled={creatingTag || !newTagName.trim()}>
            {creatingTag ? "Adding…" : "+ New Tag"}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Related Products ({relatedIds.length})</div>
        <input className={styles.input} placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div style={{ maxHeight: 220, overflowY: "auto", display: "grid", gap: 4 }}>
          {candidateProducts.map((p) => (
            <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, padding: "3px 0" }}>
              <input type="checkbox" checked={relatedIds.includes(p.id)} onChange={() => toggleRelated(p.id)} />
              {p.name} <span style={{ color: "#6b7280" }}>({p.slug})</span>
            </label>
          ))}
          {candidateProducts.length === 0 ? <p style={{ fontSize: 12, color: "#6b7280" }}>No products match.</p> : null}
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button type="submit" className={styles.button} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save Related & Tags"}
        </button>
      </div>
    </form>
  );
}

import { useState } from "react";
import { updateSolutionAdmin } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";

export default function BasicsTab({ solution, onSaved, setDirty }) {
  const [name, setName] = useState(solution.name);
  const [slug, setSlug] = useState(solution.slug);
  const [eyebrow, setEyebrow] = useState(solution.eyebrow || "");
  const [hubDescription, setHubDescription] = useState(solution.hubDescription);
  const [featuredOnHome, setFeaturedOnHome] = useState(solution.featuredOnHome);
  const [sortOrder, setSortOrder] = useState(solution.sortOrder);
  const [homeSortOrder, setHomeSortOrder] = useState(solution.homeSortOrder);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const touch = (setter) => (value) => {
    setter(value);
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { solution: updated } = await updateSolutionAdmin(solution.id, {
        name: name.trim(),
        slug: slug.trim(),
        eyebrow: eyebrow.trim() || null,
        hubDescription: hubDescription.trim(),
        featuredOnHome,
        sortOrder: Number(sortOrder),
        homeSortOrder: Number(homeSortOrder),
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

  const handleActivate = async (nextActive) => {
    setSaving(true);
    setError(null);
    try {
      const { solution: updated } = await updateSolutionAdmin(solution.id, { active: nextActive });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Status</div>
        {error ? <p className={styles.errorMessage}>{error}</p> : null}
        <p style={{ fontSize: 12.5, margin: "0 0 8px" }}>
          Currently <strong>{solution.active ? "Active" : "Draft"}</strong> — {solution.activeProductCount} active
          mapped product{solution.activeProductCount === 1 ? "" : "s"}.
          {!solution.active && solution.activeProductCount === 0 ? " Map at least one active product on the Products tab before activating." : ""}
        </p>
        <button type="button" className={styles.button} onClick={() => handleActivate(!solution.active)} disabled={saving}>
          {solution.active ? "Deactivate" : "Activate"}
        </button>
      </div>

      <form onSubmit={handleSave} className={styles.card} style={{ display: "grid", gap: 8 }}>
        <div className={styles.cardTitle}>Basics</div>
        <div className={styles.fieldGrid} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <label>
            <div className={styles.fieldLabel}>Name</div>
            <input className={styles.input} value={name} onChange={(e) => touch(setName)(e.target.value)} />
          </label>
          <label>
            <div className={styles.fieldLabel}>Slug</div>
            <input className={styles.input} value={slug} onChange={(e) => touch(setSlug)(e.target.value)} />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            <div className={styles.fieldLabel}>Eyebrow (small label above the hero title)</div>
            <input className={styles.input} value={eyebrow} onChange={(e) => touch(setEyebrow)(e.target.value)} />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            <div className={styles.fieldLabel}>Hub description (one line, shown on the Solutions card)</div>
            <input className={styles.input} value={hubDescription} onChange={(e) => touch(setHubDescription)(e.target.value)} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, gridColumn: "1 / -1" }}>
            <input type="checkbox" checked={featuredOnHome} onChange={(e) => touch(setFeaturedOnHome)(e.target.checked)} />
            Featured on Home
          </label>
          <label>
            <div className={styles.fieldLabel}>Sort order (Solutions hub)</div>
            <input className={styles.input} type="number" value={sortOrder} onChange={(e) => touch(setSortOrder)(e.target.value)} />
          </label>
          <label>
            <div className={styles.fieldLabel}>Home sort order (only used when Featured on Home)</div>
            <input className={styles.input} type="number" value={homeSortOrder} onChange={(e) => touch(setHomeSortOrder)(e.target.value)} />
          </label>
        </div>
        <div className={styles.buttonRow}>
          <button type="submit" className={styles.button} disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : "Save Basics"}
          </button>
        </div>
      </form>
    </div>
  );
}

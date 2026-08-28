import { useState } from "react";
import { updateSolutionAdmin } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";

/** A plain repeatable text-row list (challengePoints, useCases) — never raw JSON (Solutions Phase A §15). */
function StringListEditor({ label, hint, values, onChange }) {
  const set = (i, value) => onChange(values.map((v, idx) => (idx === i ? value : v)));
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, ""]);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{label}</div>
      {hint ? <p style={{ fontSize: 11.5, color: "#6b7280", margin: "0 0 8px" }}>{hint}</p> : null}
      <div style={{ display: "grid", gap: 6 }}>
        {values.map((value, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <input className={styles.input} style={{ flex: 1 }} value={value} onChange={(e) => set(i, e.target.value)} />
            <button type="button" className={styles.buttonSecondary} onClick={() => remove(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.buttonSecondary} style={{ marginTop: 8 }} onClick={add}>
        + Add row
      </button>
    </div>
  );
}

/** A repeatable {title, description} row list (benefits, processSteps). */
function TitleDescriptionListEditor({ label, values, onChange }) {
  const set = (i, field, value) => onChange(values.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, { title: "", description: "" }]);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{label}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {values.map((row, i) => (
          <div key={i} className={styles.itemCard} style={{ display: "grid", gap: 6 }}>
            <input className={styles.input} placeholder="Title" value={row.title} onChange={(e) => set(i, "title", e.target.value)} />
            <input className={styles.input} placeholder="Description" value={row.description} onChange={(e) => set(i, "description", e.target.value)} />
            <button type="button" className={styles.buttonSecondary} onClick={() => remove(i)} style={{ justifySelf: "start" }}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.buttonSecondary} style={{ marginTop: 8 }} onClick={add}>
        + Add row
      </button>
    </div>
  );
}

/** Feature blocks (editorial sections with an art/color placeholder + optional CTA). */
function FeatureSectionsEditor({ values, onChange }) {
  const set = (i, field, value) => onChange(values.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, { id: `feature-${values.length + 1}`, title: "", description: "", art: "", color: "", ctaLabel: "", ctaTo: "" }]);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Feature Sections</div>
      <div style={{ display: "grid", gap: 8 }}>
        {values.map((row, i) => (
          <div key={i} className={styles.itemCard} style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr 1fr" }}>
            <input className={styles.input} placeholder="id (e.g. uniform-programs)" value={row.id} onChange={(e) => set(i, "id", e.target.value)} />
            <input className={styles.input} placeholder="Title" value={row.title} onChange={(e) => set(i, "title", e.target.value)} />
            <input className={styles.input} style={{ gridColumn: "1 / -1" }} placeholder="Description" value={row.description} onChange={(e) => set(i, "description", e.target.value)} />
            <input className={styles.input} placeholder="Art (e.g. tshirt, cap, kit)" value={row.art || ""} onChange={(e) => set(i, "art", e.target.value)} />
            <input className={styles.input} placeholder="Color (#hex)" value={row.color || ""} onChange={(e) => set(i, "color", e.target.value)} />
            <input className={styles.input} placeholder="CTA label" value={row.ctaLabel || ""} onChange={(e) => set(i, "ctaLabel", e.target.value)} />
            <input className={styles.input} placeholder="CTA link (e.g. /products)" value={row.ctaTo || ""} onChange={(e) => set(i, "ctaTo", e.target.value)} />
            <button type="button" className={styles.buttonSecondary} onClick={() => remove(i)} style={{ justifySelf: "start" }}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.buttonSecondary} style={{ marginTop: 8 }} onClick={add}>
        + Add feature section
      </button>
    </div>
  );
}

/** Final CTA panel — a title/subtitle plus up to a few buttons (quote or link). */
function FinalCtaEditor({ value, onChange }) {
  const cta = value || { title: "", subtitle: "", ctas: [] };
  const setField = (field, v) => onChange({ ...cta, [field]: v });
  const setButton = (i, field, v) => onChange({ ...cta, ctas: cta.ctas.map((c, idx) => (idx === i ? { ...c, [field]: v } : c)) });
  const removeButton = (i) => onChange({ ...cta, ctas: cta.ctas.filter((_, idx) => idx !== i) });
  const addButton = () => onChange({ ...cta, ctas: [...cta.ctas, { type: "link", label: "", to: "/products" }] });

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Final CTA</div>
      <div style={{ display: "grid", gap: 6 }}>
        <input className={styles.input} placeholder="Title" value={cta.title} onChange={(e) => setField("title", e.target.value)} />
        <input className={styles.input} placeholder="Subtitle (optional)" value={cta.subtitle || ""} onChange={(e) => setField("subtitle", e.target.value || null)} />
        {cta.ctas.map((btn, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select className={styles.select} style={{ width: 100 }} value={btn.type} onChange={(e) => setButton(i, "type", e.target.value)}>
              <option value="quote">Quote</option>
              <option value="link">Link</option>
            </select>
            <input className={styles.input} placeholder="Label" value={btn.label} onChange={(e) => setButton(i, "label", e.target.value)} />
            {btn.type === "link" ? (
              <input className={styles.input} placeholder="/products" value={typeof btn.to === "string" ? btn.to : ""} onChange={(e) => setButton(i, "to", e.target.value)} />
            ) : null}
            <button type="button" className={styles.buttonSecondary} onClick={() => removeButton(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.buttonSecondary} style={{ marginTop: 8 }} onClick={addButton} disabled={cta.ctas.length >= 4}>
        + Add button
      </button>
    </div>
  );
}

export default function ContentTab({ solution, onSaved, setDirty }) {
  const [heroTitle, setHeroTitle] = useState(solution.heroTitle);
  const [heroCopy, setHeroCopy] = useState(solution.heroCopy);
  const [challengeTitle, setChallengeTitle] = useState(solution.challengeTitle || "");
  const [challengeCopy, setChallengeCopy] = useState(solution.challengeCopy || "");
  const [challengePoints, setChallengePoints] = useState(solution.challengePoints || []);
  const [useCases, setUseCases] = useState(solution.useCases || []);
  const [benefits, setBenefits] = useState(solution.benefits || []);
  const [processSteps, setProcessSteps] = useState(solution.processSteps || []);
  const [featureSections, setFeatureSections] = useState(solution.featureSections || []);
  const [finalCta, setFinalCta] = useState(solution.finalCta);
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState(solution.primaryCtaLabel || "");
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState(solution.secondaryCtaLabel || "");
  const [secondaryCtaTo, setSecondaryCtaTo] = useState(solution.secondaryCtaTo || "");
  const [art, setArt] = useState(solution.art || "");
  const [color, setColor] = useState(solution.color || "");
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
        heroTitle: heroTitle.trim(),
        heroCopy: heroCopy.trim(),
        challengeTitle: challengeTitle.trim() || null,
        challengeCopy: challengeCopy.trim() || null,
        challengePoints: challengePoints.filter((v) => v.trim()),
        useCases: useCases.filter((v) => v.trim()),
        benefits: benefits.filter((b) => b.title.trim()),
        processSteps: processSteps.filter((s) => s.title.trim()),
        featureSections: featureSections.filter((f) => f.title.trim()),
        finalCta: finalCta?.title ? finalCta : null,
        primaryCtaLabel: primaryCtaLabel.trim() || null,
        secondaryCtaLabel: secondaryCtaLabel.trim() || null,
        secondaryCtaTo: secondaryCtaTo.trim() || null,
        art: art.trim() || null,
        color: color.trim() || null,
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
      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.card} style={{ display: "grid", gap: 8 }}>
        <div className={styles.cardTitle}>Hero</div>
        <input className={styles.input} placeholder="Hero title" value={heroTitle} onChange={(e) => touch(setHeroTitle)(e.target.value)} />
        <input className={styles.input} placeholder="Hero copy" value={heroCopy} onChange={(e) => touch(setHeroCopy)(e.target.value)} />
      </div>

      <div className={styles.card} style={{ display: "grid", gap: 8 }}>
        <div className={styles.cardTitle}>Challenge</div>
        <input className={styles.input} placeholder="Challenge title" value={challengeTitle} onChange={(e) => touch(setChallengeTitle)(e.target.value)} />
        <input className={styles.input} placeholder="Challenge copy" value={challengeCopy} onChange={(e) => touch(setChallengeCopy)(e.target.value)} />
      </div>

      <StringListEditor label="Challenge Points" values={challengePoints} onChange={touch(setChallengePoints)} />
      <StringListEditor label="Use Cases" hint="Short phrases shown as “Where this helps” chips." values={useCases} onChange={touch(setUseCases)} />
      <TitleDescriptionListEditor label="Benefits" values={benefits} onChange={touch(setBenefits)} />
      <TitleDescriptionListEditor label="Process Steps" values={processSteps} onChange={touch(setProcessSteps)} />
      <FeatureSectionsEditor values={featureSections} onChange={touch(setFeatureSections)} />
      <FinalCtaEditor value={finalCta} onChange={touch(setFinalCta)} />

      <div className={styles.card} style={{ display: "grid", gap: 8 }}>
        <div className={styles.cardTitle}>CTA Labels &amp; Placeholder Art</div>
        <input className={styles.input} placeholder="Primary CTA label (e.g. Request a Quote)" value={primaryCtaLabel} onChange={(e) => touch(setPrimaryCtaLabel)(e.target.value)} />
        <input className={styles.input} placeholder="Secondary CTA label (e.g. Explore Products)" value={secondaryCtaLabel} onChange={(e) => touch(setSecondaryCtaLabel)(e.target.value)} />
        <input className={styles.input} placeholder="Secondary CTA link (e.g. /products)" value={secondaryCtaTo} onChange={(e) => touch(setSecondaryCtaTo)(e.target.value)} />
        <input className={styles.input} placeholder="Art fallback (e.g. tshirt, polo, cap)" value={art} onChange={(e) => touch(setArt)(e.target.value)} />
        <input className={styles.input} placeholder="Color fallback (#hex)" value={color} onChange={(e) => touch(setColor)(e.target.value)} />
      </div>

      <div className={styles.buttonRow}>
        <button type="submit" className={styles.button} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save Content"}
        </button>
      </div>
    </form>
  );
}

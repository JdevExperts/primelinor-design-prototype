import styles from "../../../components/adminDetail.module.css";

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Basics section — Phase 5 §10. `slugTouched` tracks whether the admin has
 * manually edited the slug field, so auto-suggestion from the name only
 * keeps applying until they make it their own (Phase 5 §11).
 */
export function BasicsFieldSet({ values, onChange, categories, slugWarning }) {
  const set = (key) => (event) => onChange({ ...values, [key]: event.target.value });
  const setChecked = (key) => (event) => onChange({ ...values, [key]: event.target.checked });

  return (
    <div className={styles.fieldGrid} style={{ gridTemplateColumns: "1fr 1fr" }}>
      <label>
        <div className={styles.fieldLabel}>Name *</div>
        <input
          className={styles.input}
          value={values.name}
          onChange={(event) => {
            const name = event.target.value;
            onChange({
              ...values,
              name,
              slug: values.slugTouched ? values.slug : slugify(name),
            });
          }}
        />
      </label>
      <label>
        <div className={styles.fieldLabel}>Slug *</div>
        <input
          className={styles.input}
          value={values.slug}
          onChange={(event) => onChange({ ...values, slug: slugify(event.target.value), slugTouched: true })}
        />
        {slugWarning ? <div style={{ fontSize: 11, color: "#b45309", marginTop: 4 }}>{slugWarning}</div> : null}
      </label>
      <label>
        <div className={styles.fieldLabel}>Primary Category *</div>
        <select
          className={styles.select}
          value={values.primaryCategoryId}
          onChange={(event) => {
            const primaryCategoryId = event.target.value;
            // Primary must always be one of the mapped categories (Solutions
            // Phase 0 §E) — picking a new primary that isn't in the current
            // additional-categories set adds it automatically rather than
            // rejecting the change, since "make X the primary" is a clear
            // enough intent to also mean "and map X".
            const categoryIds = values.categoryIds.includes(primaryCategoryId)
              ? values.categoryIds
              : [...values.categoryIds, primaryCategoryId];
            onChange({ ...values, primaryCategoryId, categoryIds });
          }}
        >
          <option value="">Select a category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label style={{ gridColumn: "1 / -1" }}>
        <div className={styles.fieldLabel}>Additional Categories</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categories
            .filter((c) => c.id !== values.primaryCategoryId)
            .map((c) => (
              <label
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid var(--color-border-strong, #d3d8e0)",
                  borderRadius: 6,
                  padding: "5px 9px",
                  fontSize: 12.5,
                  background: values.categoryIds.includes(c.id) ? "#f0f4fa" : "#fff",
                }}
              >
                <input
                  type="checkbox"
                  checked={values.categoryIds.includes(c.id)}
                  onChange={(event) => {
                    const categoryIds = event.target.checked
                      ? [...values.categoryIds, c.id]
                      : values.categoryIds.filter((id) => id !== c.id);
                    onChange({ ...values, categoryIds });
                  }}
                />
                {c.name}
              </label>
            ))}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
          Where this product also shows up (discovery/merchandising) — the Primary Category above stays the canonical
          breadcrumb/navigation category.
        </div>
      </label>
      <label>
        <div className={styles.fieldLabel}>MOQ *</div>
        <input className={styles.input} type="number" min="1" value={values.moq} onChange={set("moq")} />
      </label>
      <label>
        <div className={styles.fieldLabel}>Unit *</div>
        <input className={styles.input} value={values.unit} onChange={set("unit")} placeholder="piece" />
      </label>
      <label>
        <div className={styles.fieldLabel}>Dispatch Estimate</div>
        <input className={styles.input} value={values.dispatchEstimate} onChange={set("dispatchEstimate")} placeholder="7–10 working days" />
      </label>
      <label>
        <div className={styles.fieldLabel}>Material</div>
        <input className={styles.input} value={values.material} onChange={set("material")} />
      </label>
      <label>
        <div className={styles.fieldLabel}>GSM</div>
        <input className={styles.input} type="number" min="1" value={values.gsm} onChange={set("gsm")} />
      </label>
      <label>
        <div className={styles.fieldLabel}>Variant Type</div>
        <input className={styles.input} value={values.variantType} onChange={set("variantType")} placeholder="size (optional)" />
      </label>
      <label>
        <div className={styles.fieldLabel}>Sort Order</div>
        <input className={styles.input} type="number" value={values.sortOrder} onChange={set("sortOrder")} />
      </label>
      <label style={{ gridColumn: "1 / -1" }}>
        <div className={styles.fieldLabel}>Description *</div>
        <textarea className={styles.textarea} value={values.description} onChange={set("description")} />
      </label>
      <label style={{ gridColumn: "1 / -1" }}>
        <div className={styles.fieldLabel}>Long Description</div>
        <textarea className={styles.textarea} value={values.longSpec} onChange={set("longSpec")} />
      </label>
      <label>
        <input type="checkbox" checked={values.customizable} onChange={setChecked("customizable")} /> Customizable
      </label>
      <label>
        <input type="checkbox" checked={values.active} onChange={setChecked("active")} /> Active
      </label>
      <label>
        <div className={styles.fieldLabel}>SEO Title</div>
        <input className={styles.input} value={values.seoTitle} onChange={set("seoTitle")} />
      </label>
      <label>
        <div className={styles.fieldLabel}>SEO Description</div>
        <input className={styles.input} value={values.seoDescription} onChange={set("seoDescription")} />
      </label>
    </div>
  );
}

export function basicsToPayload(values) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    primaryCategoryId: values.primaryCategoryId,
    categoryIds: values.categoryIds,
    description: values.description.trim(),
    longSpec: values.longSpec.trim() || null,
    material: values.material.trim() || null,
    gsm: values.gsm === "" ? null : Number(values.gsm),
    moq: Number(values.moq),
    unit: values.unit.trim(),
    dispatchEstimate: values.dispatchEstimate.trim() || null,
    customizable: values.customizable,
    active: values.active,
    sortOrder: Number(values.sortOrder) || 0,
    variantType: values.variantType.trim() || null,
    seoTitle: values.seoTitle.trim() || null,
    seoDescription: values.seoDescription.trim() || null,
  };
}

export function emptyBasics() {
  return {
    name: "",
    slug: "",
    slugTouched: false,
    primaryCategoryId: "",
    categoryIds: [],
    description: "",
    longSpec: "",
    material: "",
    gsm: "",
    moq: "1",
    unit: "piece",
    dispatchEstimate: "",
    customizable: false,
    active: true,
    sortOrder: "0",
    variantType: "",
    seoTitle: "",
    seoDescription: "",
  };
}

export function basicsFromProduct(product) {
  return {
    name: product.name,
    slug: product.slug,
    slugTouched: true,
    primaryCategoryId: product.primaryCategory?.id || product.primaryCategoryId || "",
    categoryIds: (product.categories || []).map((c) => c.categoryId),
    description: product.description,
    longSpec: product.longSpec || "",
    material: product.material || "",
    gsm: product.gsm ?? "",
    moq: String(product.moq),
    unit: product.unit,
    dispatchEstimate: product.dispatchEstimate || "",
    customizable: product.customizable,
    active: product.active,
    sortOrder: String(product.sortOrder),
    variantType: product.variantType || "",
    seoTitle: product.seoTitle || "",
    seoDescription: product.seoDescription || "",
  };
}

let tierKeySeq = 0;
function newTierKey() {
  tierKeySeq += 1;
  return `tier-${tierKeySeq}`;
}

export function emptyPricing() {
  return { priceMode: "FIXED", fixedPrice: "", quoteAboveQty: "", tiers: [] };
}

export function pricingFromProduct(product) {
  return {
    priceMode: product.priceMode,
    fixedPrice: product.fixedPrice ?? "",
    quoteAboveQty: product.quoteAboveQty ?? "",
    tiers: (product.priceTiers || []).map((t) => ({
      key: newTierKey(),
      minQty: String(t.minQty),
      maxQty: t.maxQty == null ? "" : String(t.maxQty),
      unitPrice: String(t.unitPrice),
    })),
  };
}

export function pricingToPayload(values) {
  const payload = { priceMode: values.priceMode };
  if (values.priceMode === "FIXED") {
    payload.fixedPrice = Number(values.fixedPrice);
  }
  if (values.priceMode === "TIERED") {
    payload.priceTiers = values.tiers.map((t) => ({
      minQty: Number(t.minQty),
      maxQty: t.maxQty === "" ? null : Number(t.maxQty),
      unitPrice: Number(t.unitPrice),
    }));
    if (values.quoteAboveQty !== "") payload.quoteAboveQty = Number(values.quoteAboveQty);
  }
  return payload;
}

/** Pricing section — Phase 5 §19-24 (FIXED / TIERED / QUOTE_ONLY + quote-above-quantity). */
export function PricingFieldSet({ values, onChange }) {
  const addTier = () =>
    onChange({ ...values, tiers: [...values.tiers, { key: newTierKey(), minQty: "", maxQty: "", unitPrice: "" }] });
  const updateTier = (key, patch) =>
    onChange({ ...values, tiers: values.tiers.map((t) => (t.key === key ? { ...t, ...patch } : t)) });
  const removeTier = (key) => onChange({ ...values, tiers: values.tiers.filter((t) => t.key !== key) });

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label>
        <div className={styles.fieldLabel}>Pricing Mode</div>
        <select className={styles.select} value={values.priceMode} onChange={(e) => onChange({ ...values, priceMode: e.target.value })}>
          <option value="FIXED">Fixed</option>
          <option value="TIERED">Tiered</option>
          <option value="QUOTE_ONLY">Quote Only</option>
        </select>
      </label>

      {values.priceMode === "FIXED" ? (
        <label>
          <div className={styles.fieldLabel}>Fixed Price (₹) *</div>
          <input
            className={styles.input}
            type="number"
            min="0"
            value={values.fixedPrice}
            onChange={(e) => onChange({ ...values, fixedPrice: e.target.value })}
          />
        </label>
      ) : null}

      {values.priceMode === "QUOTE_ONLY" ? (
        <p style={{ fontSize: 12.5, color: "#6b7280" }}>
          Customers see &ldquo;Price on request&rdquo; — no numeric pricing needed.
        </p>
      ) : null}

      {values.priceMode === "TIERED" ? (
        <>
          <div style={{ display: "grid", gap: 8 }}>
            {values.tiers.map((tier) => (
              <div key={tier.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className={styles.input}
                  style={{ width: 100 }}
                  type="number"
                  placeholder="Min Qty"
                  value={tier.minQty}
                  onChange={(e) => updateTier(tier.key, { minQty: e.target.value })}
                />
                <input
                  className={styles.input}
                  style={{ width: 100 }}
                  type="number"
                  placeholder="Max Qty (blank = open-ended)"
                  value={tier.maxQty}
                  onChange={(e) => updateTier(tier.key, { maxQty: e.target.value })}
                />
                <input
                  className={styles.input}
                  style={{ width: 120 }}
                  type="number"
                  placeholder="Unit Price ₹"
                  value={tier.unitPrice}
                  onChange={(e) => updateTier(tier.key, { unitPrice: e.target.value })}
                />
                <button type="button" className={styles.buttonSecondary} onClick={() => removeTier(tier.key)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={styles.buttonSecondary} onClick={addTier} style={{ width: "fit-content" }}>
            + Add Tier
          </button>
          <label>
            <div className={styles.fieldLabel}>Quote-above quantity (optional)</div>
            <input
              className={styles.input}
              type="number"
              placeholder="e.g. 5000 — quantities at/above this become Request Quote"
              value={values.quoteAboveQty}
              onChange={(e) => onChange({ ...values, quoteAboveQty: e.target.value })}
            />
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
              Leave blank if the last tier&rsquo;s price should apply to any quantity above it. Set this only when
              quantities beyond your priced tiers should say &ldquo;Request Quote&rdquo; instead — the last tier must
              then have a Max Qty (not open-ended).
            </div>
          </label>
        </>
      ) : null}
    </div>
  );
}

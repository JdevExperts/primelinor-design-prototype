import { useState } from "react";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { pluralUnit } from "../../utils/pricing";
import { audienceLabelById, budgetLabelById, itemLabelById } from "../../utils/giftKit";
import {
  giftKitItems,
  kitAudiences,
  kitBudgetOptions,
  kitQuantityChips,
} from "../../data/corporateGiftingData";
import styles from "./KitBuilder.module.css";

/**
 * V1 scope: a single contained requirements-capture section, not a bundle
 * configurator. It never computes a kit total — see §21 in the brief — it
 * only prepares an accurate quote request.
 */
export default function KitBuilder({
  audience,
  onAudience,
  items,
  onToggleItem,
  budget,
  onBudget,
  quantity,
  onQuantity,
  onRequestQuote,
}) {
  const [qtyDraft, setQtyDraft] = useState(String(quantity));

  const applyQuantity = (value) => {
    const numeric = Number.parseInt(value, 10);
    const next = Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
    onQuantity(next);
    setQtyDraft(String(next));
  };

  return (
    <Section id="build-kit" tone="muted" ariaLabelledBy="build-kit-title" spacious>
      <SectionHeader
        titleId="build-kit-title"
        eyebrow="Build your own kit"
        title="Build Your Own Corporate Kit"
        description="Choose products, set your budget and tell us who the kit is for. PrimeLinor will help you create a branded combination that fits your requirement."
      />

      <div className={styles.builder}>
        <div className={styles.fields}>
          <fieldset className={styles.field}>
            <legend className={styles.legend}>
              <span className={styles.step}>1</span> Who is this for?
            </legend>
            <div className={styles.chips} role="radiogroup" aria-label="Who is this kit for">
              {kitAudiences.map((option) => (
                <label
                  key={option.id}
                  className={`${styles.chip} ${option.id === audience ? styles.chipOn : ""}`}
                >
                  <input
                    className={styles.sr}
                    type="radio"
                    name="kit-audience"
                    checked={option.id === audience}
                    onChange={() => onAudience(option.id)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend className={styles.legend}>
              <span className={styles.step}>2</span> Choose items
            </legend>
            <div className={styles.itemGrid}>
              {giftKitItems.map((item) => {
                const selected = items.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`${styles.itemTile} ${selected ? styles.itemTileOn : ""}`}
                  >
                    <input
                      className={styles.sr}
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleItem(item.id)}
                    />
                    <span className={styles.itemCheck} aria-hidden="true">
                      {selected ? <Icon name="check" size={14} /> : null}
                    </span>
                    {item.label}
                  </label>
                );
              })}
            </div>
            <p className={styles.hint}>
              Select the product types you want in the kit — we'll confirm exact
              SKUs, colours and branding with you.
            </p>
          </fieldset>

          <fieldset className={styles.field}>
            <legend className={styles.legend}>
              <span className={styles.step}>3</span> Budget per kit
              <span className={styles.legendValue}>Optional</span>
            </legend>
            <div className={styles.chips} role="radiogroup" aria-label="Budget per kit">
              {kitBudgetOptions.map((option) => (
                <label
                  key={option.id}
                  className={`${styles.chip} ${option.id === budget ? styles.chipOn : ""}`}
                >
                  <input
                    className={styles.sr}
                    type="radio"
                    name="kit-budget"
                    checked={option.id === budget}
                    onChange={() => onBudget(option.id === budget ? null : option.id)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.field}>
            <p className={styles.legend} id="kit-qty-label">
              <span className={styles.step}>4</span> Quantity
            </p>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.stepBtn}
                onClick={() => applyQuantity(quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Icon name="minus" size={16} />
              </button>
              <input
                className={styles.qtyInput}
                type="number"
                inputMode="numeric"
                min={1}
                value={qtyDraft}
                aria-labelledby="kit-qty-label"
                onChange={(event) => setQtyDraft(event.target.value)}
                onBlur={() => applyQuantity(qtyDraft)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
              />
              <button
                type="button"
                className={styles.stepBtn}
                onClick={() => applyQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Icon name="plus" size={16} />
              </button>
              <span className={styles.qtyUnit}>{pluralUnit("kit", quantity)}</span>
            </div>
            <div className={styles.quick} role="group" aria-label="Quick quantities">
              {kitQuantityChips.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.qtyChip} ${value === quantity ? styles.qtyChipOn : ""}`}
                  onClick={() => applyQuantity(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className={`${styles.summary} on-dark`} aria-label="Your kit">
          <p className={styles.summaryTitle}>Your Kit</p>

          <dl className={styles.summaryList}>
            <div>
              <dt>For</dt>
              <dd>{audience ? audienceLabelById[audience] : "Not selected yet"}</dd>
            </div>
            <div>
              <dt>Items</dt>
              <dd>
                {items.length
                  ? items.map((id) => itemLabelById[id]).join(", ")
                  : "No items selected yet"}
              </dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{budget ? budgetLabelById[budget] : "Not specified"}</dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd>
                {quantity} {pluralUnit("kit", quantity)}
              </dd>
            </div>
          </dl>

          <p className={styles.summaryNote}>
            We&rsquo;ll prepare a tailored quote based on your selected
            products, quantity and branding.
          </p>

          <Button variant="primary" size="lg" fullWidth onClick={onRequestQuote}>
            Request Kit Quote
          </Button>
        </aside>
      </div>
    </Section>
  );
}

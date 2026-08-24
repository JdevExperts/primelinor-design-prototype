import { useState } from "react";
import Button from "../ui/Button";
import { formatInr, pluralUnit } from "../../utils/pricing";
import { getColorMeta } from "../../utils/productDetail";
import Dialog from "./Dialog";
import styles from "./QuoteModal.module.css";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  company: "",
  city: "",
  notes: "",
};

export default function QuoteModal({
  open,
  onClose,
  product,
  colorId,
  variantLabel,
  quantity,
  quote,
  extraSummary = [],
}) {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [viaWhatsApp, setViaWhatsApp] = useState(false);

  const close = () => {
    setSubmitted(false);
    setViaWhatsApp(false);
    setForm(EMPTY);
    onClose();
  };

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setViaWhatsApp(false);
    setSubmitted(true);
  };

  const color = colorId ? getColorMeta(colorId) : null;
  const priceLine = !quote
    ? null
    : quote.kind === "priced"
      ? `${formatInr(quote.total)} · ${quantity} × ${formatInr(quote.unitPrice)}`
      : quote.headline;

  return (
    <Dialog
      open={open}
      onClose={close}
      titleId="quote-dialog-title"
      title={submitted ? "Request received" : "Request a Quote"}
    >
      {submitted ? (
        <div className={styles.success}>
          <p className={styles.successTitle}>
            {viaWhatsApp
              ? "WhatsApp would open here in production."
              : "Your quote request is ready to send."}
          </p>
          <p className={styles.successCopy}>
            This is a visual prototype — nothing was submitted. Our team would
            confirm pricing, artwork and dispatch from here.
          </p>
          <Button variant="primary" size="md" onClick={close}>
            Close
          </Button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.summary}>
            <p className={styles.summaryTitle}>{product.name}</p>
            <ul className={styles.summaryList}>
              {color ? <li>Color: {color.label}</li> : null}
              {variantLabel ? <li>Size: {variantLabel}</li> : null}
              {extraSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
              {quantity ? (
                <li>
                  Quantity: {quantity} {pluralUnit(product.unit, quantity)}
                </li>
              ) : null}
              {priceLine ? <li>Estimated: {priceLine}</li> : null}
            </ul>
          </div>

          <label className={styles.field}>
            <span>Name *</span>
            <input
              required
              value={form.name}
              onChange={update("name")}
              autoComplete="name"
            />
          </label>
          <label className={styles.field}>
            <span>Mobile / WhatsApp *</span>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              autoComplete="tel"
            />
          </label>
          <label className={styles.field}>
            <span>Business email</span>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
            />
          </label>
          <label className={styles.field}>
            <span>Company name</span>
            <input
              value={form.company}
              onChange={update("company")}
              autoComplete="organization"
            />
          </label>
          <label className={styles.field}>
            <span>Delivery city / PIN</span>
            <input
              value={form.city}
              onChange={update("city")}
              autoComplete="postal-code"
            />
          </label>
          <label className={styles.field}>
            <span>Additional requirement</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={update("notes")}
            />
          </label>

          <div className={styles.actions}>
            <Button variant="primary" size="md" type="submit" fullWidth>
              Submit Quote Request
            </Button>
            <Button
              variant="secondary"
              size="md"
              type="button"
              fullWidth
              onClick={() => {
                setViaWhatsApp(true);
                setSubmitted(true);
              }}
            >
              Continue on WhatsApp
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

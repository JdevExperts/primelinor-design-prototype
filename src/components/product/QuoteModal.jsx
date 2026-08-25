import { useRef, useState } from "react";
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

/**
 * Owns the contact-capture form AND the real submission lifecycle
 * (idle/submitting/success/error) — every page that opens this modal
 * supplies an `onSubmit(contactFields)` that builds and sends its own
 * Lead or RFQ payload (see src/api/leads.js / src/api/rfqs.js) and
 * resolves with `{ reference }`. This keeps the domain logic (what a
 * "quantity" or "product" means on that particular page) with the caller,
 * while the form UI, validation-error display and reference-number success
 * screen live here once.
 */
export default function QuoteModal({
  open,
  onClose,
  product,
  colorId,
  variantLabel,
  quantity,
  quote,
  extraSummary = [],
  onSubmit,
}) {
  const formRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [viaWhatsApp, setViaWhatsApp] = useState(false);
  const [reference, setReference] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const close = () => {
    setStatus("idle");
    setViaWhatsApp(false);
    setReference(null);
    setErrorMessage(null);
    setForm(EMPTY);
    onClose();
  };

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event, { viaWhatsApp: whatsApp = false } = {}) => {
    event.preventDefault();
    // The "Continue on WhatsApp" button is type="button" (it must not
    // trigger the browser's native submit), so it doesn't get native
    // required-field validation for free the way the submit button does —
    // ask the form directly instead.
    if (!formRef.current?.reportValidity()) return;
    setViaWhatsApp(whatsApp);
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const result = await onSubmit(form);
      setReference(result?.reference || null);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
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
      title={status === "success" ? "Request received" : "Request a Quote"}
    >
      {status === "success" ? (
        <div className={styles.success}>
          <p className={styles.successTitle}>
            {viaWhatsApp
              ? "Request received — we'll also follow up on WhatsApp."
              : "Your quote request has been sent."}
          </p>
          {reference ? (
            <p className={styles.successReference}>
              Reference: <strong>{reference}</strong>
            </p>
          ) : null}
          <p className={styles.successCopy}>
            Our team will confirm pricing, artwork and dispatch and reach out
            on the number you provided.
          </p>
          <Button variant="primary" size="md" onClick={close}>
            Close
          </Button>
        </div>
      ) : (
        <form ref={formRef} className={styles.form} onSubmit={submit}>
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

          {status === "error" ? (
            <p className={styles.errorMessage} role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="md"
              type="submit"
              fullWidth
              disabled={status === "submitting"}
            >
              {status === "submitting" && !viaWhatsApp ? "Sending…" : "Submit Quote Request"}
            </Button>
            <Button
              variant="secondary"
              size="md"
              type="button"
              fullWidth
              disabled={status === "submitting"}
              onClick={(event) => submit(event, { viaWhatsApp: true })}
            >
              {status === "submitting" && viaWhatsApp ? "Sending…" : "Continue on WhatsApp"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

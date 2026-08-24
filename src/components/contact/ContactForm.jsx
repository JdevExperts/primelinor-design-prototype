import { useState } from "react";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { enquiryInterests } from "../../data/companyData";
import styles from "./ContactForm.module.css";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  company: "",
  interest: "",
  quantity: "",
  city: "",
  message: "",
};

/**
 * General business enquiry — separate from the product-specific QuoteModal
 * flow. No backend yet; the conceptual payload this would eventually send
 * is documented below so wiring a real endpoint later is a drop-in change.
 */
export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    // Eventual payload shape: { ...form, source: "contact_page" }
    setSubmitted(true);
  };

  const sendAnother = () => {
    setForm(EMPTY);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className={styles.success}>
        <Icon name="check" size={22} className={styles.successIcon} />
        <p className={styles.successTitle}>Your enquiry is ready to send.</p>
        <p className={styles.successCopy}>
          This is a visual prototype — nothing was submitted. Our team would
          follow up directly from here.
        </p>
        <Button variant="secondary" size="md" onClick={sendAnother}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} aria-label="General business enquiry">
      <label className={styles.field}>
        <span>Name *</span>
        <input required value={form.name} onChange={update("name")} autoComplete="name" />
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
        <span>Business Email</span>
        <input type="email" value={form.email} onChange={update("email")} autoComplete="email" />
      </label>

      <label className={styles.field}>
        <span>Company Name</span>
        <input value={form.company} onChange={update("company")} autoComplete="organization" />
      </label>

      <label className={styles.field}>
        <span>I&rsquo;m interested in</span>
        <select value={form.interest} onChange={update("interest")}>
          <option value="">Select an option</option>
          {enquiryInterests.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Approximate Quantity</span>
          <input value={form.quantity} onChange={update("quantity")} inputMode="numeric" />
        </label>
        <label className={styles.field}>
          <span>City / PIN</span>
          <input value={form.city} onChange={update("city")} autoComplete="postal-code" />
        </label>
      </div>

      <label className={styles.field}>
        <span>Message / Requirement *</span>
        <textarea required rows={4} value={form.message} onChange={update("message")} />
      </label>

      <Button variant="primary" size="lg" type="submit" fullWidth>
        Send Enquiry
      </Button>
    </form>
  );
}

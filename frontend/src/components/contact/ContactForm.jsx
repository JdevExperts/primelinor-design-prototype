import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { getPublicConfig } from "../../api/config";
import { submitLead } from "../../api/leads";
import { buildLeadWhatsAppMessage, buildWhatsAppUrl } from "../../utils/whatsapp";
import { track } from "../../analytics/track";
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

/** General business enquiry — submits a real Lead (see src/api/leads.js). */
export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [reference, setReference] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [whatsapp, setWhatsapp] = useState({ enabled: false, number: null });

  useEffect(() => {
    getPublicConfig()
      .then((cfg) => setWhatsapp({ enabled: cfg.whatsappEnabled, number: cfg.whatsappNumber }))
      .catch(() => {});
  }, []);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const lead = await submitLead({
        contact: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          companyName: form.company,
        },
        message: form.message,
        sourceType: "CONTACT",
        sourceContext: {
          interest: form.interest || undefined,
          approxQuantity: form.quantity || undefined,
          city: form.city || undefined,
        },
      });
      setReference(lead?.reference || null);
      setStatus("success");
      track("CONTACT_CLICK", { metadata: { channel: "form", reference: lead?.reference || null } });
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const sendAnother = () => {
    setForm(EMPTY);
    setStatus("idle");
    setReference(null);
    setErrorMessage(null);
  };

  if (status === "success") {
    return (
      <div className={styles.success}>
        <Icon name="check" size={22} className={styles.successIcon} />
        <p className={styles.successTitle}>Your enquiry has been sent.</p>
        {reference ? (
          <p className={styles.successCopy}>
            Reference: <strong>{reference}</strong>
          </p>
        ) : null}
        <p className={styles.successCopy}>Our team will follow up directly.</p>
        {whatsapp.enabled && reference ? (
          <Button
            as="a"
            href={buildWhatsAppUrl(whatsapp.number, buildLeadWhatsAppMessage(reference))}
            target="_blank"
            rel="noreferrer"
            variant="primary"
            size="md"
          >
            Continue on WhatsApp
          </Button>
        ) : null}
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

      {status === "error" ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button variant="primary" size="lg" type="submit" fullWidth disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send Enquiry"}
      </Button>
    </form>
  );
}

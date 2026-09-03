import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuoteByToken, acceptQuote, declineQuote, requestQuoteRevision, getQuotePdfUrl } from "../api/quotes";
import { getPublicConfig } from "../api/config";
import { buildWhatsAppUrl, buildQuoteWhatsAppMessage } from "../utils/whatsapp";
import styles from "./CustomerQuote.module.css";

function formatInr(value, currency) {
  if (value == null) return "—";
  return `${currency === "INR" ? "₹" : currency + " "}${Number(value).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * SPA-appropriate noindex — this page must never be crawled/indexed
 * (Phase 4 §41). Also sets `Referrer-Policy: no-referrer` at the page
 * level (Production Hardening Patch §9): the backend already sends this
 * header on every API response (helmet's default), but the *page* itself
 * is served by the static frontend host, outside that boundary, and its
 * URL carries the access token — no outbound navigation from this page
 * should leak it via a Referer header, on top of the individual
 * `rel="noreferrer"` already used on every outbound link below.
 */
function useNoIndex() {
  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);

    const referrer = document.createElement("meta");
    referrer.name = "referrer";
    referrer.content = "no-referrer";
    document.head.appendChild(referrer);

    document.title = "Quotation | PrimeLinor";
    return () => {
      document.head.removeChild(robots);
      document.head.removeChild(referrer);
    };
  }, []);
}

function LineItemsTable({ lines, currency }) {
  return (
    <table className={styles.table}>
      <caption className="visually-hidden">Quotation line items</caption>
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col">Qty</th>
          <th scope="col">Unit</th>
          <th scope="col">Unit Price</th>
          <th scope="col">Total</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id}>
            <td data-label="Description">
              {line.description}
              {line.productCode ? (
                <span className={styles.lineCode}>Product Code: {line.productCode}</span>
              ) : null}
            </td>
            <td data-label="Qty">{line.quantity ?? "—"}</td>
            <td data-label="Unit">{line.unit || "—"}</td>
            <td data-label="Unit Price">{line.unitPrice != null ? formatInr(line.unitPrice, currency) : "—"}</td>
            <td data-label="Total">{formatInr(line.lineTotal, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CustomerQuote() {
  useNoIndex();
  const { token } = useParams();

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [quote, setQuote] = useState(null);
  const [config, setConfig] = useState({ whatsappEnabled: false, whatsappNumber: null, supportEmail: null });

  const [activePanel, setActivePanel] = useState(null); // null | "accept" | "decline" | "revision"
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [revisionSent, setRevisionSent] = useState(false);

  useEffect(() => {
    getPublicConfig()
      .then(setConfig)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    getQuoteByToken(token)
      .then(({ quote: data }) => {
        if (cancelled) return;
        setQuote(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const openPanel = (panel) => {
    setActivePanel(panel);
    setActionError(null);
    setMessage("");
  };

  const closePanel = () => {
    setActivePanel(null);
    setActionError(null);
  };

  const confirmAccept = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      const { quote: updated } = await acceptQuote(token);
      setQuote(updated);
      setActivePanel(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDecline = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      const { quote: updated } = await declineQuote(token, message);
      setQuote(updated);
      setActivePanel(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRevision = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      const { quote: updated } = await requestQuoteRevision(token, message);
      setQuote(updated);
      setActivePanel(null);
      setRevisionSent(true);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.center}>Loading your quotation…</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.page}>
        <div className={styles.center}>
          <p className={styles.errorTitle}>This link isn&rsquo;t working</p>
          <p className={styles.errorCopy}>{errorMessage || "This quotation link is invalid or no longer active."}</p>
        </div>
      </div>
    );
  }

  const whatsappUrl = config.whatsappEnabled
    ? buildWhatsAppUrl(config.whatsappNumber, buildQuoteWhatsAppMessage(quote.reference))
    : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>PrimeLinor</div>
        <div className={styles.headerMeta}>
          <span className={styles.quoteRef}>Quotation {quote.reference}</span>
          <span className={`${styles.statusPill} ${styles[`status_${quote.status.toLowerCase()}`]}`}>
            {quote.status}
          </span>
        </div>
      </header>

      <main className={styles.content}>
        {quote.isCancelled ? (
          <div className={styles.banner} role="status">
            <strong>This quotation is no longer active.</strong> Please contact PrimeLinor Bulk for an updated
            quotation.
          </div>
        ) : null}

        {quote.isSuperseded ? (
          <div className={styles.banner} role="status">
            This quotation has been replaced by a newer version. Please use the link you received for the latest
            version, or contact us on WhatsApp for a fresh copy.
          </div>
        ) : null}

        {quote.isExpired && !quote.isSuperseded && !quote.isCancelled ? (
          <div className={styles.banner} role="status">
            <strong>Quotation Expired.</strong> This quotation is no longer valid for acceptance. Please request an
            updated quote or contact us.
          </div>
        ) : null}

        {quote.status === "ACCEPTED" ? (
          <div className={styles.successBanner} role="status">
            <p className={styles.successTitle}>Quotation Accepted</p>
            <p className={styles.successCopy}>
              Thank you. PrimeLinor has received your confirmation and our team will contact you regarding the next
              steps.
            </p>
            <p className={styles.successMeta}>
              Reference {quote.reference} · {formatInr(quote.grandTotal, quote.currency)}
              {quote.respondedAt ? ` · Accepted ${formatDate(quote.respondedAt)}` : ""}
            </p>
          </div>
        ) : null}

        {quote.status === "REJECTED" ? (
          <div className={styles.banner} role="status">
            You declined this quotation{quote.respondedAt ? ` on ${formatDate(quote.respondedAt)}` : ""}. If
            you&rsquo;d still like to discuss it, use Request Revision / Discuss below.
          </div>
        ) : null}

        {revisionSent ? (
          <div className={styles.successBanner} role="status">
            <p className={styles.successTitle}>Request sent</p>
            <p className={styles.successCopy}>Our team has been notified and will follow up shortly.</p>
          </div>
        ) : null}

        <section className={styles.card} aria-labelledby="quote-summary-title">
          <h1 id="quote-summary-title" className="visually-hidden">
            Quotation summary
          </h1>
          <div className={styles.summaryGrid}>
            <div>
              <div className={styles.label}>Prepared for</div>
              <div className={styles.value}>{quote.customer.companyName || quote.customer.name}</div>
              {quote.customer.companyName ? <div className={styles.subValue}>{quote.customer.name}</div> : null}
            </div>
            <div>
              <div className={styles.label}>Sent</div>
              <div className={styles.value}>{formatDate(quote.sentAt)}</div>
            </div>
            <div>
              <div className={styles.label}>Valid until</div>
              <div className={styles.value}>{quote.validUntil ? formatDate(quote.validUntil) : "No expiry set"}</div>
            </div>
            <div>
              <div className={styles.label}>Currency</div>
              <div className={styles.value}>{quote.currency}</div>
            </div>
          </div>
        </section>

        <section className={styles.card} aria-labelledby="quote-lines-title">
          <h2 id="quote-lines-title" className={styles.cardTitle}>
            Items
          </h2>
          <div className={styles.tableWrap}>
            <LineItemsTable lines={quote.lines} currency={quote.currency} />
          </div>

          <div className={styles.totals}>
            <div className={styles.totalsRow}>
              <span>Subtotal</span>
              <span>{formatInr(quote.subtotal, quote.currency)}</span>
            </div>
            {quote.taxAmount != null ? (
              <div className={styles.totalsRow}>
                <span>{quote.taxMode || "Tax"}</span>
                <span>{formatInr(quote.taxAmount, quote.currency)}</span>
              </div>
            ) : null}
            <div className={`${styles.totalsRow} ${styles.grandTotalRow}`}>
              <span>Grand Total</span>
              <span>{formatInr(quote.grandTotal, quote.currency)}</span>
            </div>
          </div>
        </section>

        {quote.customerNotes ? (
          <section className={styles.card} aria-labelledby="quote-notes-title">
            <h2 id="quote-notes-title" className={styles.cardTitle}>
              Notes &amp; Terms
            </h2>
            <p className={styles.notes}>{quote.customerNotes}</p>
          </section>
        ) : null}

        {activePanel ? (
          <section className={styles.card} aria-live="polite">
            {activePanel === "accept" ? (
              <>
                <h2 className={styles.cardTitle}>Confirm acceptance</h2>
                <p className={styles.confirmCopy}>
                  You&rsquo;re about to accept quotation {quote.reference} for{" "}
                  {formatInr(quote.grandTotal, quote.currency)}. PrimeLinor will reach out about next steps.
                </p>
              </>
            ) : activePanel === "decline" ? (
              <>
                <h2 className={styles.cardTitle}>Decline this quotation?</h2>
                <label className={styles.field}>
                  <span>Reason (optional)</span>
                  <textarea
                    className={styles.textarea}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Let us know why, if you'd like."
                  />
                </label>
              </>
            ) : (
              <>
                <h2 className={styles.cardTitle}>Request a revision</h2>
                <label className={styles.field}>
                  <span>What would you like changed?</span>
                  <textarea
                    className={styles.textarea}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="e.g. Can you revise this for 150 pieces?"
                  />
                </label>
              </>
            )}

            {actionError ? (
              <p className={styles.errorMessage} role="alert">
                {actionError}
              </p>
            ) : null}

            <div className={styles.actionRow}>
              <button type="button" className={styles.secondaryBtn} onClick={closePanel} disabled={submitting}>
                Cancel
              </button>
              <button
                type="button"
                className={activePanel === "decline" ? styles.dangerBtn : styles.primaryBtn}
                disabled={submitting}
                onClick={
                  activePanel === "accept" ? confirmAccept : activePanel === "decline" ? confirmDecline : confirmRevision
                }
              >
                {submitting
                  ? "Sending…"
                  : activePanel === "accept"
                    ? "Confirm Acceptance"
                    : activePanel === "decline"
                      ? "Confirm Decline"
                      : "Send Request"}
              </button>
            </div>
          </section>
        ) : (
          <section className={styles.actions}>
            {quote.actions.canAccept ? (
              <button type="button" className={styles.primaryBtn} onClick={() => openPanel("accept")}>
                Accept Quote
              </button>
            ) : null}
            {quote.actions.canRequestRevision ? (
              <button type="button" className={styles.secondaryBtn} onClick={() => openPanel("revision")}>
                Request Revision / Discuss
              </button>
            ) : null}
            {quote.actions.canDecline ? (
              <button type="button" className={styles.textBtn} onClick={() => openPanel("decline")}>
                Decline
              </button>
            ) : null}
          </section>
        )}

        <section className={styles.secondaryActions}>
          {whatsappUrl ? (
            <a className={styles.secondaryLink} href={whatsappUrl} target="_blank" rel="noreferrer">
              Continue on WhatsApp
            </a>
          ) : null}
          <a className={styles.secondaryLink} href={getQuotePdfUrl(token)} target="_blank" rel="noreferrer">
            Download PDF
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>PrimeLinor</p>
        {config.supportEmail ? <p>{config.supportEmail}</p> : null}
      </footer>
    </div>
  );
}

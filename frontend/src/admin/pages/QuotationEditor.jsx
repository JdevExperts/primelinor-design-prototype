import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as quotationsApi from "../api/quotations";
import * as rfqsApi from "../api/rfqs";
import * as configApi from "../../api/config";
import { buildWhatsAppUrl, buildQuoteWhatsAppMessage } from "../../utils/whatsapp";
import StatusBadge from "../components/StatusBadge";
import styles from "../components/adminDetail.module.css";

const LINE_TYPES = ["PRODUCT", "SHIPPING", "DISCOUNT", "ADJUSTMENT"];

function formatInr(value) {
  if (value == null) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

let tempKeySeq = 0;
function newTempKey() {
  tempKeySeq += 1;
  return `tmp-${tempKeySeq}`;
}

function toFormLines(lines) {
  return lines.map((line) => ({
    key: newTempKey(),
    rfqItemId: line.rfqItemId || undefined,
    lineType: line.lineType,
    description: line.description,
    quantity: line.quantity ?? "",
    unit: line.unit || "",
    unitPrice: line.unitPrice ?? "",
    lineTotal: line.unitPrice == null ? line.lineTotal : "",
  }));
}

function estimateLineTotal(line) {
  if ((line.lineType === "PRODUCT" || line.lineType === "SHIPPING") && line.quantity !== "" && line.unitPrice !== "") {
    return Number(line.quantity) * Number(line.unitPrice);
  }
  return line.lineTotal !== "" ? Number(line.lineTotal) : 0;
}

export default function QuotationEditor() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [lines, setLines] = useState([]);
  const [currency, setCurrency] = useState("INR");
  const [taxMode, setTaxMode] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmingSend, setConfirmingSend] = useState(false);
  const [error, setError] = useState(null);
  const [customerQuoteUrl, setCustomerQuoteUrl] = useState(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(null);
  const [rfqReference, setRfqReference] = useState(null);

  const load = () => {
    quotationsApi
      .getQuotation(id)
      .then(({ quotation: q }) => {
        setQuotation(q);
        setLines(toFormLines(q.lines));
        setCurrency(q.currency);
        setTaxMode(q.taxMode || "");
        setTaxAmount(q.taxAmount ?? "");
        setValidUntil(q.validUntil ? q.validUntil.slice(0, 10) : "");
        setCustomerNotes(q.customerNotes || "");
        setLoadStatus("ready");
        rfqsApi.getRfq(q.rfqId).then(({ rfq }) => setRfqReference(rfq.reference)).catch(() => {});
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, [id]);
  useEffect(() => {
    configApi.getPublicConfig().then((cfg) => setWhatsappNumber(cfg.whatsappEnabled ? cfg.whatsappNumber : null)).catch(() => {});
  }, []);

  const editable = quotation?.status === "DRAFT";

  const updateLine = (key, patch) => {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const removeLine = (key) => setLines((current) => current.filter((line) => line.key !== key));

  const addLine = (lineType) => {
    setLines((current) => [
      ...current,
      { key: newTempKey(), lineType, description: "", quantity: "", unit: "", unitPrice: "", lineTotal: "" },
    ]);
  };

  const moveLine = (key, direction) => {
    setLines((current) => {
      const index = current.findIndex((line) => line.key === key);
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const buildPayload = () => ({
    currency,
    taxMode: taxMode || undefined,
    taxAmount: taxAmount === "" ? undefined : Number(taxAmount),
    validUntil: validUntil || undefined,
    customerNotes: customerNotes || undefined,
    lines: lines
      .filter((line) => line.description.trim())
      .map((line, index) => ({
        rfqItemId: line.rfqItemId,
        lineType: line.lineType,
        description: line.description.trim(),
        quantity: line.quantity === "" ? undefined : Number(line.quantity),
        unit: line.unit || undefined,
        unitPrice: line.unitPrice === "" ? undefined : Number(line.unitPrice),
        lineTotal: line.lineTotal === "" ? undefined : Number(line.lineTotal),
        sortOrder: index,
      })),
  });

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { quotation: updated } = await quotationsApi.updateQuotation(id, buildPayload());
      setQuotation(updated);
      setLines(toFormLines(updated.lines));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onSend = async () => {
    setConfirmingSend(false);
    setSending(true);
    setError(null);
    try {
      await onSave();
      const result = await quotationsApi.sendQuotation(id);
      setQuotation(result.quotation);
      setLines(toFormLines(result.quotation.lines));
      if (result.customerQuoteUrl) setCustomerQuoteUrl(result.customerQuoteUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  /** The raw token only ever exists in this one response (Phase 4 §3) — a page reload can't recover it. */
  const onGenerateLink = async () => {
    setLinkBusy(true);
    setError(null);
    try {
      const result = await quotationsApi.regenerateQuoteLink(id);
      setQuotation(result.quotation);
      if (result.customerQuoteUrl) setCustomerQuoteUrl(result.customerQuoteUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLinkBusy(false);
    }
  };

  const onCopyLink = async () => {
    if (!customerQuoteUrl) return;
    try {
      await navigator.clipboard.writeText(customerQuoteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Couldn't copy the link — copy it manually.");
    }
  };

  if (loadStatus === "loading") return <p>Loading…</p>;
  if (loadStatus === "error" || !quotation) return <p>Couldn&rsquo;t load this quotation.</p>;

  const computedGrandTotal =
    lines.reduce((sum, line) => sum + estimateLineTotal(line), 0) + (taxAmount === "" ? 0 : Number(taxAmount));

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to={`/admin/rfqs/${quotation.rfqId}`}>← Back to RFQ</Link>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>
          Quotation V{quotation.version}
          <StatusBadge status={quotation.status} />
        </h1>
        {!editable ? <span className={styles.fieldLabel}>Sent quotations are read-only — create a revision to change pricing.</span> : null}
      </div>

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.card}>
        <p className={styles.cardTitle}>Lines</p>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table} style={{ width: "100%", fontSize: 12.5 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Type</th>
                <th style={{ textAlign: "left" }}>Description</th>
                <th style={{ textAlign: "left" }}>Qty</th>
                <th style={{ textAlign: "left" }}>Unit</th>
                <th style={{ textAlign: "left" }}>Unit price</th>
                <th style={{ textAlign: "left" }}>Line amount</th>
                <th style={{ textAlign: "left" }}>Total</th>
                {editable ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.key}>
                  <td>
                    {editable ? (
                      <select
                        className={styles.select}
                        value={line.lineType}
                        onChange={(event) => updateLine(line.key, { lineType: event.target.value })}
                      >
                        {LINE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    ) : (
                      line.lineType
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <input
                        className={styles.input}
                        style={{ minWidth: 220 }}
                        value={line.description}
                        onChange={(event) => updateLine(line.key, { description: event.target.value })}
                      />
                    ) : (
                      line.description
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <input
                        className={styles.input}
                        style={{ width: 70 }}
                        type="number"
                        value={line.quantity}
                        onChange={(event) => updateLine(line.key, { quantity: event.target.value })}
                      />
                    ) : (
                      line.quantity || "—"
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <input
                        className={styles.input}
                        style={{ width: 70 }}
                        value={line.unit}
                        onChange={(event) => updateLine(line.key, { unit: event.target.value })}
                      />
                    ) : (
                      line.unit || "—"
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <input
                        className={styles.input}
                        style={{ width: 90 }}
                        type="number"
                        value={line.unitPrice}
                        onChange={(event) => updateLine(line.key, { unitPrice: event.target.value })}
                      />
                    ) : (
                      formatInr(line.unitPrice || null)
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <input
                        className={styles.input}
                        style={{ width: 100 }}
                        type="number"
                        value={line.lineTotal}
                        placeholder="or set qty+price"
                        onChange={(event) => updateLine(line.key, { lineTotal: event.target.value })}
                      />
                    ) : (
                      formatInr(line.lineTotal || null)
                    )}
                  </td>
                  <td>{formatInr(estimateLineTotal(line))}</td>
                  {editable ? (
                    <td style={{ display: "flex", gap: 4 }}>
                      <button type="button" className={styles.actionLink} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => moveLine(line.key, -1)}>
                        ↑
                      </button>
                      <button type="button" className={styles.actionLink} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => moveLine(line.key, 1)}>
                        ↓
                      </button>
                      <button type="button" className={styles.actionLink} style={{ background: "none", border: "none", cursor: "pointer", color: "#b42318" }} onClick={() => removeLine(line.key)}>
                        Remove
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editable ? (
          <div className={styles.buttonRow}>
            <button type="button" className={styles.buttonSecondary} onClick={() => addLine("PRODUCT")}>
              + Product line
            </button>
            <button type="button" className={styles.buttonSecondary} onClick={() => addLine("SHIPPING")}>
              + Shipping
            </button>
            <button type="button" className={styles.buttonSecondary} onClick={() => addLine("DISCOUNT")}>
              + Discount
            </button>
            <button type="button" className={styles.buttonSecondary} onClick={() => addLine("ADJUSTMENT")}>
              + Adjustment
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.layout}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Terms</p>
          <div className={styles.fieldGrid}>
            <label style={{ display: "grid", gap: 4 }}>
              <span className={styles.fieldLabel}>Currency</span>
              <input className={styles.input} value={currency} disabled={!editable} onChange={(event) => setCurrency(event.target.value)} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className={styles.fieldLabel}>Valid until</span>
              <input
                className={styles.input}
                type="date"
                value={validUntil}
                disabled={!editable}
                onChange={(event) => setValidUntil(event.target.value)}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className={styles.fieldLabel}>Tax label (free text)</span>
              <input className={styles.input} value={taxMode} disabled={!editable} onChange={(event) => setTaxMode(event.target.value)} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className={styles.fieldLabel}>Tax amount</span>
              <input
                className={styles.input}
                type="number"
                value={taxAmount}
                disabled={!editable}
                onChange={(event) => setTaxAmount(event.target.value)}
              />
            </label>
          </div>
          <label style={{ display: "grid", gap: 4 }}>
            <span className={styles.fieldLabel}>Customer notes</span>
            <textarea
              className={styles.textarea}
              value={customerNotes}
              disabled={!editable}
              onChange={(event) => setCustomerNotes(event.target.value)}
            />
          </label>
        </div>

        <div className={styles.side}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Totals</p>
            <div style={{ fontSize: 13, display: "grid", gap: 4 }}>
              <div>Estimated grand total: {formatInr(computedGrandTotal)}</div>
              <div className={styles.fieldLabel}>Backend recalculates and stores the authoritative total on save.</div>
              {!editable ? (
                <>
                  <div style={{ marginTop: 6 }}>Subtotal: {formatInr(quotation.subtotal)}</div>
                  <div>Grand total: {formatInr(quotation.grandTotal)}</div>
                </>
              ) : null}
            </div>
          </div>

          {!editable ? (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Customer Delivery</p>
              {customerQuoteUrl ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <code style={{ fontSize: 11.5, background: "#f8f9fb", padding: "6px 8px", borderRadius: 6, wordBreak: "break-all" }}>
                    {customerQuoteUrl}
                  </code>
                  <div className={styles.buttonRow}>
                    <button type="button" className={styles.buttonSecondary} onClick={onCopyLink}>
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <a className={styles.buttonSecondary} style={{ textAlign: "center", textDecoration: "none" }} href={customerQuoteUrl} target="_blank" rel="noreferrer">
                      Open Customer View
                    </a>
                  </div>
                  {whatsappNumber && rfqReference ? (
                    <a
                      className={styles.buttonSecondary}
                      style={{ textAlign: "center", textDecoration: "none" }}
                      href={buildWhatsAppUrl(whatsappNumber, buildQuoteWhatsAppMessage(`${rfqReference}-V${quotation.version}`))}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Continue on WhatsApp
                    </a>
                  ) : null}
                  <a
                    className={styles.buttonSecondary}
                    style={{ textAlign: "center", textDecoration: "none" }}
                    href={quotationsApi.getQuotationPdfUrl(id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download PDF
                  </a>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  <p className={styles.fieldLabel}>
                    The link is only shown once, right after it&rsquo;s generated — regenerate to get a fresh copy.
                  </p>
                  <button type="button" className={styles.buttonSecondary} disabled={linkBusy} onClick={onGenerateLink}>
                    {linkBusy ? "Working…" : "Generate / Regenerate Link"}
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {editable ? (
            <div className={styles.card}>
              {confirmingSend ? (
                <>
                  <p style={{ fontSize: 12.5 }}>
                    Send this quotation? Once sent it can no longer be edited — only revised as a new version.
                  </p>
                  <div className={styles.buttonRow}>
                    <button type="button" className={styles.buttonSecondary} onClick={() => setConfirmingSend(false)}>
                      Cancel
                    </button>
                    <button type="button" className={styles.button} disabled={sending} onClick={onSend}>
                      {sending ? "Sending…" : "Confirm send"}
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.buttonRow}>
                  <button type="button" className={styles.buttonSecondary} disabled={saving} onClick={onSave}>
                    {saving ? "Saving…" : "Save draft"}
                  </button>
                  <button type="button" className={styles.button} onClick={() => setConfirmingSend(true)}>
                    Send
                  </button>
                </div>
              )}
              <p className={styles.fieldLabel}>
                &ldquo;Send&rdquo; marks this ready for customer delivery — no email/WhatsApp is sent automatically yet.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as quotationsApi from "../api/quotations";
import * as configApi from "../../api/config";
import { buildWhatsAppUrl, buildQuoteWhatsAppMessage } from "../../utils/whatsapp";
import StatusBadge from "../components/StatusBadge";
import ProductPicker from "../components/ProductPicker";
import styles from "../components/adminDetail.module.css";
import { formatDate, formatDateTime } from "../utils/datetime";
import { canCreateRevision as canReviseStatus, revisionCta as revisionCtaFor } from "../utils/quotationEligibility";

const LINE_TYPES = ["PRODUCT", "SHIPPING", "DISCOUNT", "ADJUSTMENT"];
const EMPTY_PARTY = { name: "", contactPerson: "", phone: "", email: "", gstin: "", address: "" };
const CUSTOMER_EVENT_LABEL = {
  QUOTATION_CREATED: "Quotation created",
  QUOTATION_UPDATED: "Quotation edited",
  QUOTATION_SENT: "Quotation sent",
  QUOTATION_VIEWED: "Customer opened the quotation",
  CUSTOMER_REVISION_REQUESTED: "Customer requested a revision",
  REVISION_REQUEST_ADDRESSED: "Revision request addressed — new version created",
  QUOTATION_REVISION_CREATED: "New version created",
  QUOTATION_ACCEPTED: "Quotation accepted",
  QUOTATION_REJECTED: "Quotation declined",
  QUOTATION_CANCELLED: "Quotation cancelled",
  QUOTE_LINK_REGENERATED: "Customer link regenerated",
  QUOTE_LINK_REVOKED: "Customer link revoked",
  NOTE_ADDED: "Internal note added",
};

const ORIGIN_LABEL = { RFQ: "From RFQ", MANUAL: "Manual", PHONE: "Phone", WHATSAPP: "WhatsApp", OFFLINE: "Offline" };

function formatInr(value) {
  if (value == null) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

/** A PRODUCT/SHIPPING line with a quantity but no rate and no manual amount. */
function lineNeedsRate(line) {
  if (line.lineType !== "PRODUCT" && line.lineType !== "SHIPPING") return false;
  const hasQtyPrice = line.quantity !== "" && line.unitPrice !== "";
  const hasAmount = line.lineTotal !== "";
  return !hasQtyPrice && !hasAmount && line.quantity !== "";
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
    productId: line.productId || undefined,
    productCode: line.productCodeSnapshot || line.productCode || "",
    lineType: line.lineType,
    description: line.description,
    quantity: line.quantity ?? "",
    unit: line.unit || "",
    unitPrice: line.unitPrice ?? "",
    lineTotal: line.unitPrice == null && line.lineTotal != null ? line.lineTotal : "",
  }));
}

/** The line's amount, or null when it still needs a rate (never a fake 0). */
function estimateLineTotal(line) {
  if ((line.lineType === "PRODUCT" || line.lineType === "SHIPPING") && line.quantity !== "" && line.unitPrice !== "") {
    return Number(line.quantity) * Number(line.unitPrice);
  }
  if (line.lineTotal !== "") return Number(line.lineTotal);
  return null;
}

export default function QuotationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [revising, setRevising] = useState(false);
  const [existingDraftId, setExistingDraftId] = useState(null);
  const [lines, setLines] = useState([]);
  const [currency, setCurrency] = useState("INR");
  const [taxMode, setTaxMode] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [party, setParty] = useState(EMPTY_PARTY);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmingSend, setConfirmingSend] = useState(false);
  const [error, setError] = useState(null);
  const [customerQuoteUrl, setCustomerQuoteUrl] = useState(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(null);
  const [rfqReference, setRfqReference] = useState(null);
  // Internal / negotiation notes (§8/§9)
  const [notes, setNotes] = useState([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteBody, setEditNoteBody] = useState("");
  // Staff cancellation (§12)
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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
        setParty({ ...EMPTY_PARTY, ...Object.fromEntries(Object.entries(q.party || {}).map(([k, v]) => [k, v ?? ""])) });
        setNotes(q.internalNotes || []);
        setRfqReference(q.rfqReference || null);
        setExistingDraftId(null);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, [id]);
  useEffect(() => {
    configApi.getPublicConfig().then((cfg) => setWhatsappNumber(cfg.whatsappEnabled ? cfg.whatsappNumber : null)).catch(() => {});
  }, []);

  const editable = quotation?.status === "DRAFT";
  // Any issued version can seed a new one — never a DRAFT (edit in place),
  // never a CANCELLED. Backend is authoritative; helper is the fallback.
  const canRevise = quotation ? (quotation.canCreateRevision ?? canReviseStatus(quotation.status)) : false;
  const canCancelQuote = quotation ? (quotation.canCancel ?? false) : false;
  const cta = quotation ? quotation.revisionCta || revisionCtaFor(quotation.status) : null;

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
    // Party is editable on ANY draft now (§7) — always send it so a
    // correction to an RFQ-origin quote's GSTIN/address sticks.
    party: Object.fromEntries(Object.entries(party).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])),
    lines: lines
      .filter((line) => line.description.trim())
      .map((line, index) => ({
        rfqItemId: line.rfqItemId,
        productId: line.productId || undefined,
        productCode: line.productCode || undefined,
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
      setQuotation((q) => ({ ...q, ...updated }));
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

  // Clone this version into a new editable DRAFT (next version) and open
  // it. Unified path — works from SENT/VIEWED/ACCEPTED/REJECTED/SUPERSEDED,
  // for RFQ-origin and standalone alike, with no customer request needed.
  const onCreateRevision = async () => {
    if (cta?.confirm && !window.confirm(cta.confirm)) return;
    setRevising(true);
    setError(null);
    try {
      const { quotation: created } = await quotationsApi.reviseQuotation(quotation.id, {});
      navigate(`/admin/quotations/${created.id}`);
    } catch (err) {
      // 409: a draft version already exists — offer to open it (§20).
      if (err.details?.quotationId) setExistingDraftId(err.details.quotationId);
      setError(err.message);
      setRevising(false);
    }
  };

  const onCancelQuotation = async () => {
    setCancelling(true);
    setError(null);
    try {
      const { quotation: updated } = await quotationsApi.cancelQuotation(id, cancelReason.trim() || undefined);
      setConfirmingCancel(false);
      setCancelReason("");
      setQuotation(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const onAddNote = async () => {
    const body = noteDraft.trim();
    if (!body) return;
    setNoteBusy(true);
    setError(null);
    try {
      const { note } = await quotationsApi.addQuotationNote(id, body);
      setNotes((current) => [note, ...current]);
      setNoteDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setNoteBusy(false);
    }
  };

  const onSaveNote = async (noteId) => {
    const body = editNoteBody.trim();
    if (!body) return;
    setNoteBusy(true);
    setError(null);
    try {
      const { note } = await quotationsApi.updateQuotationNote(id, noteId, body);
      setNotes((current) => current.map((n) => (n.id === noteId ? note : n)));
      setEditNoteId(null);
      setEditNoteBody("");
    } catch (err) {
      setError(err.message);
    } finally {
      setNoteBusy(false);
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

  const linesNeedingRate = lines.filter(lineNeedsRate).length;
  const pricingComplete = linesNeedingRate === 0;
  const computedGrandTotal =
    lines.reduce((sum, line) => sum + (estimateLineTotal(line) ?? 0), 0) + (taxAmount === "" ? 0 : Number(taxAmount));
  const hasLines = lines.some((line) => line.description.trim());
  const partyMissing = !party.name.trim();
  const sendDisabled =
    !editable || sending || !hasLines || !pricingComplete || !validUntil || computedGrandTotal <= 0 || partyMissing;

  const addProductLine = (product) => {
    setLines((current) => [
      ...current,
      {
        key: newTempKey(),
        lineType: "PRODUCT",
        productId: product.id,
        productCode: product.productCode,
        description: product.name,
        quantity: String(product.moq || 1),
        unit: product.unit || "piece",
        // Pre-fill the catalogue rate as an editable starting value; blank
        // for QUOTE_ONLY -> "Rate required".
        unitPrice: product.effectivePrice != null ? String(product.effectivePrice) : "",
        lineTotal: "",
      },
    ]);
  };

  // Read-only line rows for the finalised view (server-authoritative amounts).
  const roLines = (quotation.lines || []).map((l) => {
    const [name, ...rest] = String(l.description || "").split("\n");
    return {
      id: l.id,
      lineType: l.lineType,
      name: name.trim() || "—",
      spec: rest.join(" ").replace(/\s+/g, " ").trim() || null,
      code: l.productCodeSnapshot || l.productCode || null,
      qty: l.quantity,
      unit: l.unit,
      unitPrice: l.unitPrice,
      lineTotal: l.lineTotal,
      needsRate: l.needsRate,
    };
  });
  const allProductLines = roLines.length > 0 && roLines.every((l) => l.lineType === "PRODUCT");
  const latestRevision = (quotation.customerActivity || []).find((a) => a.type === "CUSTOMER_REVISION_REQUESTED");
  const partyRows = [
    ["Customer / Company", quotation.party?.name],
    ["Contact person", quotation.party?.contactPerson],
    ["Phone", quotation.party?.phone],
    ["Email", quotation.party?.email],
    ["GSTIN", quotation.party?.gstin],
    ["Address", quotation.party?.address],
  ];
  const versions = quotation.versions || [];
  const latestVersionNo =
    quotation.latestVersion ?? (versions.length ? Math.max(...versions.map((v) => v.version)) : quotation.version);
  const latestVersionRow = versions.find((v) => v.version === latestVersionNo) || null;
  const viewingOlderVersion = latestVersionNo > quotation.version && latestVersionRow;
  const newerDraft = quotation.newerDraft;
  const nextVersionNo = latestVersionNo + 1;

  const newerDraftBanner = viewingOlderVersion ? (
    <div className={styles.revisionStrip}>
      <span aria-hidden="true">●</span> You&rsquo;re viewing V{quotation.version}. Newer version exists: V
      {latestVersionRow.version}.{" "}
      <Link to={`/admin/quotations/${latestVersionRow.id}`}>Open V{latestVersionRow.version}</Link>
    </div>
  ) : null;

  const revisionButtonLabel = revising
    ? "Creating…"
    : `${cta?.label || "Create New Version"} (V${nextVersionNo})`;

  // §13: never encourage a duplicate — if a newer version already exists
  // (draft or issued), the only offered action is to open it.
  const reviseBlock = viewingOlderVersion ? (
    <div className={styles.card}>
      <p className={styles.fieldLabel}>
        A newer version (V{latestVersionRow.version}, {latestVersionRow.status}) already exists.
      </p>
      <Link
        className={styles.button}
        style={{ textAlign: "center", textDecoration: "none" }}
        to={`/admin/quotations/${latestVersionRow.id}`}
      >
        Open V{latestVersionRow.version}
      </Link>
    </div>
  ) : canRevise ? (
    newerDraft && newerDraft.id !== quotation.id ? (
      <div className={styles.card}>
        <p className={styles.fieldLabel}>A newer draft (V{newerDraft.version}) already exists.</p>
        <Link className={styles.buttonSecondary} style={{ textAlign: "center", textDecoration: "none" }} to={`/admin/quotations/${newerDraft.id}`}>
          Open draft V{newerDraft.version}
        </Link>
      </div>
    ) : latestRevision ? (
      <div className={`${styles.card} ${styles.revisionCard}`}>
        <p className={styles.cardTitle}>
          <span className={styles.revisionBadge}>REVISION REQUESTED</span>
        </p>
        <div style={{ fontSize: 12.5 }}>
          <div className={styles.fieldLabel}>Latest customer request</div>
          <div className={styles.timelineQuote} style={{ marginTop: 4 }}>
            {latestRevision.message || "(no message)"}
          </div>
          <div className={styles.timelineWhen} style={{ marginTop: 6 }}>
            Requested {formatDateTime(latestRevision.createdAt)}
          </div>
        </div>
        <button type="button" className={styles.button} disabled={revising} onClick={onCreateRevision}>
          {revisionButtonLabel}
        </button>
      </div>
    ) : (
      <div className={styles.card}>
        <button type="button" className={styles.button} disabled={revising} onClick={onCreateRevision}>
          {revisionButtonLabel}
        </button>
        <p className={styles.fieldLabel}>
          Start a new editable version from this one. The current version stays unchanged as history.
        </p>
        {existingDraftId ? (
          <Link className={styles.buttonSecondary} style={{ textAlign: "center", textDecoration: "none" }} to={`/admin/quotations/${existingDraftId}`}>
            Open the existing draft
          </Link>
        ) : null}
      </div>
    )
  ) : null;

  const cancelBlock = canCancelQuote ? (
    <div className={styles.card}>
      {confirmingCancel ? (
        <>
          <p style={{ fontSize: 12.5 }}>
            Cancel this quotation? The record is kept, but the customer link stops working and no further customer
            action is possible.
          </p>
          <label style={{ display: "grid", gap: 4 }}>
            <span className={styles.fieldLabel}>Reason (optional)</span>
            <input className={styles.input} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </label>
          <div className={styles.buttonRow}>
            <button type="button" className={styles.buttonSecondary} onClick={() => setConfirmingCancel(false)}>
              Keep quotation
            </button>
            <button type="button" className={styles.buttonDanger} disabled={cancelling} onClick={onCancelQuotation}>
              {cancelling ? "Cancelling…" : "Cancel quotation"}
            </button>
          </div>
        </>
      ) : (
        <button type="button" className={styles.buttonSecondary} onClick={() => setConfirmingCancel(true)}>
          Cancel / void this quotation
        </button>
      )}
    </div>
  ) : null;

  // Full-width Version History — lives at the bottom of the main content
  // (not the sidebar). Clean table on desktop, cards on mobile. Every row
  // links to that EXACT version, never the latest.
  const historyRows = versions.slice().sort((a, b) => b.version - a.version);
  const versionHistorySection = versions.length > 1 ? (
    <section className={`${styles.card} ${styles.versionHistory}`}>
      <p className={styles.cardTitle}>Version history</p>
      <div className={styles.tableScroll}>
        <table className={styles.versionTable}>
          <thead>
            <tr>
              <th>Version</th>
              <th>Quotation ID</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Grand Total</th>
              <th>Created</th>
              <th>Valid Until</th>
              <th>Created By</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {historyRows.map((v) => {
              const current = v.id === quotation.id;
              const latest = v.version === latestVersionNo;
              return (
                <tr key={v.id} className={current ? styles.vhCurrentRow : undefined}>
                  <td data-label="Version">
                    <strong>V{v.version}</strong>
                    {current ? (
                      <span className={styles.vhCurrent} title="Currently viewing" aria-label="Currently viewing">
                        ✓
                      </span>
                    ) : null}
                    {latest && !current ? <span className={styles.vhBadgeMuted}>LATEST</span> : null}
                  </td>
                  <td data-label="Quotation ID">
                    {current ? (
                      <span className={styles.muted}>{v.reference || `V${v.version}`}</span>
                    ) : (
                      <Link className={styles.rowLink} to={`/admin/quotations/${v.id}`}>
                        {v.reference || `V${v.version}`}
                      </Link>
                    )}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={v.status} />
                    {v.isExpired ? <span className={styles.lineTypeBadge}>EXPIRED</span> : null}
                  </td>
                  <td data-label="Grand Total" style={{ textAlign: "right" }}>
                    {v.pricingComplete ? formatInr(v.grandTotal) : <span style={{ color: "#b45309" }}>Pricing incomplete</span>}
                  </td>
                  <td data-label="Created" className={styles.muted}>{formatDateTime(v.createdAt)}</td>
                  <td data-label="Valid Until" className={styles.muted}>{v.validUntil ? formatDate(v.validUntil) : "—"}</td>
                  <td data-label="Created By" className={styles.muted}>{v.createdBy?.name || "—"}</td>
                  <td data-label="">
                    {current ? (
                      <span className={styles.muted}>Viewing</span>
                    ) : (
                      <Link className={styles.rowLink} to={`/admin/quotations/${v.id}`}>View</Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  ) : null;

  const notesCard = (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Internal / negotiation notes</p>
      <p className={styles.fieldLabel}>Private to staff — never shown to the customer or in the PDF.</p>
      <div style={{ display: "grid", gap: 6 }}>
        <textarea
          className={styles.textarea}
          style={{ minHeight: 52 }}
          placeholder="e.g. Customer called — wants ₹245 if qty becomes 300."
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
        />
        <div>
          <button type="button" className={styles.buttonSecondary} disabled={noteBusy || !noteDraft.trim()} onClick={onAddNote}>
            {noteBusy ? "Saving…" : "Add note"}
          </button>
        </div>
      </div>
      {notes.length ? (
        <div className={styles.notesThread} style={{ marginTop: 8 }}>
          {notes.map((n) => (
            <div key={n.id} className={styles.note}>
              <div className={styles.noteMeta}>
                {n.author?.name || "Staff"} · {formatDateTime(n.createdAt)}
                {n.updatedAt && n.updatedAt !== n.createdAt ? " · edited" : ""}
              </div>
              {editNoteId === n.id ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <textarea
                    className={styles.textarea}
                    style={{ minHeight: 52 }}
                    value={editNoteBody}
                    onChange={(e) => setEditNoteBody(e.target.value)}
                  />
                  <div className={styles.buttonRow}>
                    <button type="button" className={styles.buttonSecondary} onClick={() => setEditNoteId(null)}>
                      Cancel
                    </button>
                    <button type="button" className={styles.button} disabled={noteBusy} onClick={() => onSaveNote(n.id)}>
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ whiteSpace: "pre-wrap" }}>{n.body}</div>
                  {n.editable ? (
                    <button
                      type="button"
                      className={styles.actionLink}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11 }}
                      onClick={() => {
                        setEditNoteId(n.id);
                        setEditNoteBody(n.body);
                      }}
                    >
                      Edit
                    </button>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.fieldLabel} style={{ marginTop: 6 }}>
          No notes yet.
        </p>
      )}
    </div>
  );

  const quickActionsCard = (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Quick actions</p>
      {customerQuoteUrl ? (
        <div style={{ display: "grid", gap: 8 }}>
          <code style={{ fontSize: 11, background: "#f8f9fb", padding: "6px 8px", borderRadius: 6, wordBreak: "break-all" }}>
            {customerQuoteUrl}
          </code>
          <button type="button" className={styles.buttonSecondary} onClick={onCopyLink}>
            {copied ? "Copied!" : "Copy quote link"}
          </button>
          <a className={styles.buttonSecondary} style={{ textAlign: "center", textDecoration: "none" }} href={customerQuoteUrl} target="_blank" rel="noreferrer">
            Open customer view
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <p className={styles.fieldLabel}>
            The link is shown once, right after it&rsquo;s generated — regenerate for a fresh copy.
          </p>
          <button type="button" className={styles.buttonSecondary} disabled={linkBusy || quotation.status === "CANCELLED"} onClick={onGenerateLink}>
            {linkBusy ? "Working…" : "Generate / regenerate link"}
          </button>
        </div>
      )}
      <a
        className={styles.buttonSecondary}
        style={{ textAlign: "center", textDecoration: "none" }}
        href={quotationsApi.getQuotationPdfUrl(id)}
        target="_blank"
        rel="noreferrer"
      >
        Download PDF
      </a>
      {whatsappNumber ? (
        <a
          className={styles.buttonSecondary}
          style={{ textAlign: "center", textDecoration: "none" }}
          href={buildWhatsAppUrl(
            whatsappNumber,
            buildQuoteWhatsAppMessage(quotation.reference || `${rfqReference}-V${quotation.version}`),
          )}
          target="_blank"
          rel="noreferrer"
        >
          Share on WhatsApp
        </a>
      ) : null}
    </div>
  );

  const activityCard = quotation.customerActivity?.length ? (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Activity</p>
      <div className={styles.timeline}>
        {quotation.customerActivity.map((a) => (
          <div
            key={a.id}
            className={`${styles.timelineRow} ${a.type === "CUSTOMER_REVISION_REQUESTED" ? styles.accent : ""}`}
          >
            <div className={styles.timelineAction}>{CUSTOMER_EVENT_LABEL[a.type] || a.type}</div>
            <div className={styles.timelineWhen}>
              {formatDateTime(a.createdAt)}
              {a.actorType === "STAFF" ? " · staff" : ""}
            </div>
            {a.message ? <div className={styles.timelineQuote}>{a.message}</div> : null}
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        {quotation.rfqId ? (
          <Link to={`/admin/rfqs/${quotation.rfqId}`}>← Back to RFQ</Link>
        ) : (
          <Link to="/admin/quotations">← Quotations</Link>
        )}
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {quotation.reference || `Quotation V${quotation.version}`}
          <StatusBadge status={quotation.status} />
          <span className={styles.fieldLabel} style={{ marginLeft: 8 }}>
            {ORIGIN_LABEL[quotation.originType] || quotation.originType}
            {quotation.originDetail ? ` · ${quotation.originDetail}` : ""}
          </span>
        </h1>
        <span className={styles.fieldLabel}>
          Created {formatDateTime(quotation.createdAt)}
          {quotation.createdBy?.name ? ` by ${quotation.createdBy.name}` : ""}
        </span>
      </div>
      {!editable && quotation.status !== "CANCELLED" ? (
        <span className={styles.fieldLabel}>This version is finalised. Make changes in a new version.</span>
      ) : null}
      {quotation.status === "CANCELLED" ? (
        <div className={styles.revisionStrip}>
          <span aria-hidden="true">●</span> This quotation was cancelled
          {quotation.cancelledAt ? ` on ${formatDate(quotation.cancelledAt)}` : ""}
          {quotation.cancelReason ? ` — ${quotation.cancelReason}` : ""}.
        </div>
      ) : null}
      {newerDraftBanner}
      {rfqReference ? (
        <span className={styles.fieldLabel}>
          Source RFQ:{" "}
          <Link to={`/admin/rfqs/${quotation.rfqId}`}>{rfqReference}</Link>
        </span>
      ) : null}

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      {editable ? (
        <>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Party</p>
            <div className={styles.fieldGrid} style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                ["name", "Customer / Company *"],
                ["contactPerson", "Contact person"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["gstin", "GSTIN"],
                ["address", "Address"],
              ].map(([key, label]) => (
                <label key={key}>
                  <div className={styles.fieldLabel}>{label}</div>
                  <input
                    className={styles.input}
                    value={party[key]}
                    onChange={(event) => setParty((p) => ({ ...p, [key]: event.target.value }))}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Lines</p>
            <div style={{ maxWidth: 460, marginBottom: 12 }}>
              <ProductPicker onSelect={addProductLine} />
            </div>
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
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.key}>
                      <td>
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
                      </td>
                      <td>
                        <input
                          className={styles.input}
                          style={{ minWidth: 220 }}
                          value={line.description}
                          onChange={(event) => updateLine(line.key, { description: event.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className={styles.input}
                          style={{ width: 70 }}
                          type="number"
                          value={line.quantity}
                          onChange={(event) => updateLine(line.key, { quantity: event.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className={styles.input}
                          style={{ width: 70 }}
                          value={line.unit}
                          onChange={(event) => updateLine(line.key, { unit: event.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className={styles.input}
                          style={{ width: 90 }}
                          type="number"
                          value={line.unitPrice}
                          onChange={(event) => updateLine(line.key, { unitPrice: event.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className={styles.input}
                          style={{ width: 100 }}
                          type="number"
                          value={line.lineTotal}
                          placeholder="or set qty+price"
                          onChange={(event) => updateLine(line.key, { lineTotal: event.target.value })}
                        />
                      </td>
                      <td>
                        {lineNeedsRate(line) ? (
                          <span style={{ color: "#b45309", fontWeight: 600, fontSize: 12 }}>Rate required</span>
                        ) : (
                          formatInr(estimateLineTotal(line))
                        )}
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.buttonSecondary} onClick={() => addLine("PRODUCT")}>
                + Custom line
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
          </div>

          <div className={styles.layout}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Terms</p>
              <div className={styles.fieldGrid}>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className={styles.fieldLabel}>Currency</span>
                  <input className={styles.input} value={currency} onChange={(event) => setCurrency(event.target.value)} />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className={styles.fieldLabel}>Valid until</span>
                  <input className={styles.input} type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className={styles.fieldLabel}>Tax label (free text)</span>
                  <input className={styles.input} value={taxMode} onChange={(event) => setTaxMode(event.target.value)} />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className={styles.fieldLabel}>Tax amount</span>
                  <input className={styles.input} type="number" value={taxAmount} onChange={(event) => setTaxAmount(event.target.value)} />
                </label>
              </div>
              <label style={{ display: "grid", gap: 4 }}>
                <span className={styles.fieldLabel}>Customer notes</span>
                <textarea className={styles.textarea} value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} />
              </label>
            </div>

            <div className={styles.side}>
              <div className={styles.card}>
                <p className={styles.cardTitle}>Totals</p>
                <div style={{ fontSize: 13, display: "grid", gap: 4 }}>
                  {!pricingComplete ? (
                    <>
                      <div style={{ fontWeight: 600 }}>Estimated Total</div>
                      <div style={{ color: "#b45309", fontWeight: 600 }}>Pricing incomplete</div>
                      <div className={styles.fieldLabel}>
                        {linesNeedingRate === 1 ? "1 line needs a rate" : `${linesNeedingRate} lines need a rate`}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>Estimated grand total: {formatInr(computedGrandTotal)}</div>
                      <div className={styles.fieldLabel}>Final total is confirmed when you save.</div>
                    </>
                  )}
                </div>
              </div>

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
                    <button
                      type="button"
                      className={styles.button}
                      disabled={sendDisabled}
                      onClick={() => setConfirmingSend(true)}
                    >
                      Send
                    </button>
                  </div>
                )}
                {!confirmingSend && sendDisabled && hasLines ? (
                  <p className={styles.fieldLabel} style={{ color: "#b45309" }}>
                    {!pricingComplete
                      ? "Enter a rate for every product line before sending."
                      : !validUntil
                        ? "Set a valid-until date before sending."
                        : partyMissing
                          ? "Enter the customer / company name before sending."
                          : "This quotation isn't ready to send yet."}
                  </p>
                ) : null}
                <p className={styles.fieldLabel}>
                  Sending finalizes this quotation version and makes it ready to share with the customer.
                </p>
              </div>

              {cancelBlock}
            </div>
          </div>

          {notesCard}
          {versionHistorySection}
        </>
      ) : (
        <>
          {quotation.hasPendingRevisionRequest ? (
            <div className={styles.revisionStrip}>
              <span aria-hidden="true">●</span> Revision requested by the customer — details in Activity
            </div>
          ) : null}

          <div className={styles.quoteView}>
            <div className={styles.quoteMain}>
              <div className={styles.card}>
                <p className={styles.cardTitle}>Party</p>
                <dl className={styles.infoGrid}>
                  {partyRows.map(([label, value]) => (
                    <div key={label} style={{ display: "contents" }}>
                      <dt>{label}</dt>
                      <dd>{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className={styles.card}>
                <p className={styles.cardTitle}>Lines</p>
                <div className={styles.tableScroll}>
                  <table className={styles.lineTable}>
                    <thead>
                      <tr>
                        {!allProductLines ? <th>Type</th> : null}
                        <th>Description</th>
                        <th style={{ textAlign: "right" }}>Qty</th>
                        <th>Unit</th>
                        <th style={{ textAlign: "right" }}>Rate</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roLines.map((l) => (
                        <tr key={l.id}>
                          {!allProductLines ? (
                            <td>
                              {l.lineType !== "PRODUCT" ? (
                                <span className={styles.lineTypeBadge}>{l.lineType}</span>
                              ) : (
                                "—"
                              )}
                            </td>
                          ) : null}
                          <td>
                            <div style={{ fontWeight: 600, color: "#0f1b2d" }}>{l.name}</div>
                            {l.code ? (
                              <div className={styles.muted} style={{ fontSize: 11 }}>Product Code: {l.code}</div>
                            ) : null}
                            {l.spec ? (
                              <div className={styles.muted} style={{ fontSize: 11 }}>{l.spec}</div>
                            ) : null}
                          </td>
                          <td style={{ textAlign: "right" }}>{l.qty ?? "—"}</td>
                          <td className={styles.muted}>{l.unit || "—"}</td>
                          <td style={{ textAlign: "right" }}>{l.unitPrice != null ? formatInr(l.unitPrice) : "—"}</td>
                          <td style={{ textAlign: "right" }}>
                            {l.needsRate ? (
                              <span style={{ color: "#b45309" }}>Rate required</span>
                            ) : l.lineTotal != null ? (
                              formatInr(l.lineTotal)
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.card}>
                <p className={styles.cardTitle}>Terms &amp; totals</p>
                <dl className={styles.infoGrid}>
                  <dt>Currency</dt>
                  <dd>{quotation.currency}</dd>
                  <dt>Valid until</dt>
                  <dd>
                    {quotation.validUntil ? formatDate(quotation.validUntil) : "—"}
                    {quotation.isExpired ? <span className={styles.lineTypeBadge}>EXPIRED</span> : null}
                  </dd>
                  {quotation.taxMode ? (
                    <>
                      <dt>Tax</dt>
                      <dd>{quotation.taxMode}</dd>
                    </>
                  ) : null}
                </dl>
                <div style={{ marginTop: 4 }}>
                  <div className={styles.totalsRow}>
                    <span>Subtotal</span>
                    <span>{formatInr(quotation.subtotal)}</span>
                  </div>
                  {quotation.taxAmount != null ? (
                    <div className={styles.totalsRow}>
                      <span>{quotation.taxMode || "Tax"}</span>
                      <span>{formatInr(quotation.taxAmount)}</span>
                    </div>
                  ) : (
                    <div className={styles.totalsRow}>
                      <span>Tax</span>
                      <span className={styles.muted}>—</span>
                    </div>
                  )}
                  <div className={styles.totalsGrand}>
                    <span>Grand Total</span>
                    <span>{formatInr(quotation.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {quotation.customerNotes ? (
                <div className={styles.card}>
                  <p className={styles.cardTitle}>Customer notes</p>
                  <p style={{ fontSize: 13, whiteSpace: "pre-wrap", margin: 0 }}>{quotation.customerNotes}</p>
                </div>
              ) : null}

              {notesCard}
              {versionHistorySection}
            </div>

            <aside className={styles.quoteAside}>
              {reviseBlock}
              {activityCard}
              {cancelBlock}
              {quickActionsCard}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

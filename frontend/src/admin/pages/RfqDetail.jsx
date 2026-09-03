import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as rfqsApi from "../api/rfqs";
import * as quotationsApi from "../api/quotations";
import * as staffApi from "../api/staff";
import * as configApi from "../../api/config";
import { buildWhatsAppUrl, buildQuoteWhatsAppMessage } from "../../utils/whatsapp";
import StatusBadge from "../components/StatusBadge";
import ProductPicker from "../components/ProductPicker";
import styles from "../components/adminDetail.module.css";
import { formatDateTime } from "../utils/datetime";
import { canCreateRevision } from "../utils/quotationEligibility";

// Accept / reject act only on a live sent offer; a new version can be
// branched from any issued status (§5).
const ACTIONABLE_QUOTE_STATUSES = ["SENT", "VIEWED"];

const RFQ_STATUSES = ["NEW", "IN_PROGRESS", "QUOTED", "NEGOTIATING", "WON", "LOST", "CANCELLED"];

function formatInr(value) {
  if (value == null) return "Price on request";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

/** "sizeBreakdown" -> "Size Breakdown", "availableSizes" -> "Available Sizes". */
function humanizeKey(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatRequirementValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  if (value === "" || value == null) return "—";
  return String(value);
}

/** Renders requirementData as readable label/value rows, raw JSON tucked behind a disclosure (task §27). */
function RequirementData({ data }) {
  const entries = Object.entries(data);
  return (
    <div>
      <div className={styles.fieldLabel}>Requirement</div>
      <dl style={{ margin: "4px 0 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", fontSize: 13 }}>
        {entries.map(([key, value]) => (
          <div key={key} style={{ display: "contents" }}>
            <dt style={{ color: "#6b7280" }}>{humanizeKey(key)}</dt>
            <dd style={{ margin: 0 }}>{formatRequirementValue(value)}</dd>
          </div>
        ))}
      </dl>
      <details style={{ marginTop: 6 }}>
        <summary style={{ fontSize: 11.5, color: "#6b7280", cursor: "pointer" }}>View raw data</summary>
        <pre style={{ fontSize: 11, background: "#f8f9fb", padding: 8, borderRadius: 6, overflowX: "auto" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function ItemCard({ item }) {
  return (
    <div className={styles.itemCard}>
      <div className={styles.itemTitle}>
        {item.productNameSnapshot || item.description || "Item"}
        {item.productCodeSnapshot ? (
          <span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280", userSelect: "all" }}>
            {item.productCodeSnapshot}
          </span>
        ) : null}
        <span className={styles.estimateBadge}>{item.estimate.label}</span>
      </div>
      {item.productNameSnapshot ? (
        <div className={styles.fieldLabel}>
          {item.specSnapshot}
          {item.colorNameSnapshot ? ` · ${item.colorNameSnapshot}` : ""}
          {item.variantLabelSnapshot ? ` · ${item.variantLabelSnapshot}` : ""}
        </div>
      ) : null}
      <div style={{ fontSize: 12.5 }}>
        Qty: {item.quantity ?? "—"} {item.unitSnapshot || ""} · Unit: {formatInr(item.estimate.unitPrice)} · Total:{" "}
        {formatInr(item.estimate.total)}
      </div>
      {item.customizationData?.front?.enabled || item.customizationData?.back?.enabled ? (
        <div style={{ fontSize: 12, color: "#4b5563" }}>
          {item.customizationData.front?.enabled ? `Front: ${item.customizationData.front.placementKey || "—"} ` : ""}
          {item.customizationData.back?.enabled ? `· Back: ${item.customizationData.back.placementKey || "—"}` : ""}
        </div>
      ) : null}
      {item.artwork.length ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {item.artwork.map((a) => (
            <a key={a.id} className={styles.artworkLink} href={a.downloadUrl} target="_blank" rel="noreferrer">
              View/Download: {a.originalFileName}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Current Requirement (Phase C) — the editable sales view. Every change
 * calls the working-item API and replaces the list from its response, so
 * the RFQ's original items are never touched.
 */
function WorkingRequirement({ rfqId, items, onChange, onError }) {
  const [busy, setBusy] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDesc, setCustomDesc] = useState("");
  const [customQty, setCustomQty] = useState("");

  const run = async (fn) => {
    setBusy(true);
    onError(null);
    try {
      const { workingItems } = await fn();
      onChange(workingItems);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addProduct = (product) =>
    run(() => rfqsApi.addWorkingItem(rfqId, { productId: product.id, quantity: product.moq || 1 }));
  const changeQty = (itemId, quantity) =>
    run(() => rfqsApi.updateWorkingItem(rfqId, itemId, { quantity: quantity === "" ? null : Number(quantity) }));
  const remove = (itemId) => run(() => rfqsApi.removeWorkingItem(rfqId, itemId));
  const addCustom = () => {
    if (!customDesc.trim()) return;
    run(() =>
      rfqsApi.addWorkingItem(rfqId, {
        description: customDesc.trim(),
        quantity: customQty ? Number(customQty) : undefined,
      }),
    ).then(() => {
      setCustomDesc("");
      setCustomQty("");
      setCustomOpen(false);
    });
  };

  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Current Requirement</p>
      <p className={styles.fieldLabel} style={{ marginTop: -4 }}>
        The working requirement used when creating a quotation. Edit freely — the original request above is untouched.
      </p>

      <div style={{ maxWidth: 460, margin: "8px 0 12px" }}>
        <ProductPicker onSelect={addProduct} placeholder="Add a product by name or code…" />
      </div>

      {items.length === 0 ? (
        <p className={styles.fieldLabel}>No items in the current requirement yet.</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.lineTable}>
            <thead>
              <tr>
                <th>Product / Description</th>
                <th>Code</th>
                <th>Qty</th>
                <th>Unit</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.productName || item.description}
                    {item.isCustom ? (
                      <span style={{ marginLeft: 6, fontSize: 10.5, color: "#667085" }}>custom</span>
                    ) : null}
                  </td>
                  <td className={styles.muted} style={{ whiteSpace: "nowrap" }}>{item.productCode || "—"}</td>
                  <td>
                    <input
                      className={styles.input}
                      style={{ width: 72 }}
                      type="number"
                      min="1"
                      defaultValue={item.quantity ?? ""}
                      disabled={busy}
                      onBlur={(event) => {
                        const v = event.target.value;
                        if (String(item.quantity ?? "") !== v) changeQty(item.id, v);
                      }}
                    />
                  </td>
                  <td className={styles.muted}>{item.unit || "—"}</td>
                  <td>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(item.id)}
                      style={{ background: "none", border: "none", color: "#b42318", cursor: "pointer", fontSize: 12 }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {customOpen ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
          <label style={{ display: "grid", gap: 4, flex: "1 1 240px" }}>
            <span className={styles.fieldLabel}>Custom line description</span>
            <input className={styles.input} value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 4, width: 90 }}>
            <span className={styles.fieldLabel}>Qty</span>
            <input className={styles.input} type="number" value={customQty} onChange={(e) => setCustomQty(e.target.value)} />
          </label>
          <button type="button" className={styles.buttonSecondary} disabled={busy} onClick={addCustom}>
            Add
          </button>
          <button type="button" className={styles.buttonSecondary} onClick={() => setCustomOpen(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.buttonSecondary}
          style={{ marginTop: 10 }}
          onClick={() => setCustomOpen(true)}
        >
          + Custom / described line
        </button>
      )}
    </div>
  );
}

export default function RfqDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [staff, setStaff] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [noteBody, setNoteBody] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingField, setSavingField] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [workingItems, setWorkingItems] = useState([]);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [linkByQuotation, setLinkByQuotation] = useState({});
  const [linkBusyId, setLinkBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState(null);

  const load = () => {
    Promise.all([rfqsApi.getRfq(id), quotationsApi.listForRfq(id)])
      .then(([{ rfq: data }, { quotations: qs }]) => {
        setRfq(data);
        setWorkingItems(data.workingItems || []);
        setQuotations(qs);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, [id]);
  useEffect(() => {
    staffApi.listStaff().then(({ staff: list }) => setStaff(list)).catch(() => {});
    configApi.getPublicConfig().then((cfg) => setWhatsappNumber(cfg.whatsappEnabled ? cfg.whatsappNumber : null)).catch(() => {});
  }, []);

  const patchRfq = async (payload) => {
    setActionError(null);
    setSavingField(Object.keys(payload)[0]);
    try {
      const { rfq: updated } = await rfqsApi.updateRfq(id, payload);
      setRfq(updated);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingField(null);
    }
  };

  const onAddNote = async (event) => {
    event.preventDefault();
    if (!noteBody.trim()) return;
    setSavingNote(true);
    try {
      await rfqsApi.addNote(id, noteBody.trim());
      setNoteBody("");
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  // The server snapshots the RFQ's current items into the new draft
  // (including QUOTE_ONLY items, which start with no rate — never a fake
  // ₹0). Sales then negotiates qty/rate independently; there is no ongoing
  // sync back to the RFQ.
  const onCreateQuotation = async () => {
    setActionError(null);
    try {
      const { quotation } = await quotationsApi.createQuotation(id, {});
      navigate(`/admin/quotations/${quotation.id}`);
    } catch (err) {
      setActionError(err.message);
    }
  };

  // The server clones the source version's party/lines/qty/rates/terms
  // into the new draft — V2 starts identical to V1, then Sales edits it.
  // Works from any issued status, no customer request required (§5).
  const onCreateRevision = async (sourceId) => {
    setActionError(null);
    try {
      const { quotation } = await quotationsApi.reviseQuotation(sourceId, {});
      navigate(`/admin/quotations/${quotation.id}`);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const onImportRfqItems = async (quotationId) => {
    setActionError(null);
    try {
      await quotationsApi.importRfqItems(quotationId);
      navigate(`/admin/quotations/${quotationId}`);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const onAccept = async (quotationId) => {
    setActionError(null);
    try {
      await quotationsApi.acceptQuotation(quotationId);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const onReject = async (quotationId, nextRfqStatus) => {
    setActionError(null);
    try {
      await quotationsApi.rejectQuotation(quotationId, nextRfqStatus);
      setRejectTargetId(null);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  };

  /** Fetches a fresh customer link — the raw token only ever exists in this one response (Phase 4 §3). */
  const onGenerateLink = async (quotationId) => {
    setLinkBusyId(quotationId);
    setActionError(null);
    try {
      const { customerQuoteUrl } = await quotationsApi.regenerateQuoteLink(quotationId);
      setLinkByQuotation((current) => ({ ...current, [quotationId]: customerQuoteUrl }));
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLinkBusyId(null);
    }
  };

  const onRevokeLink = async (quotationId) => {
    setLinkBusyId(quotationId);
    setActionError(null);
    try {
      await quotationsApi.revokeQuoteLink(quotationId);
      setLinkByQuotation((current) => {
        const next = { ...current };
        delete next[quotationId];
        return next;
      });
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLinkBusyId(null);
    }
  };

  const onCopyLink = async (quotationId, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(quotationId);
      window.setTimeout(() => setCopiedId((current) => (current === quotationId ? null : current)), 1600);
    } catch {
      setActionError("Couldn't copy the link — copy it manually.");
    }
  };

  if (loadStatus === "loading") return <p>Loading…</p>;
  if (loadStatus === "error" || !rfq) return <p>Couldn&rsquo;t load this RFQ.</p>;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin/rfqs">← RFQs</Link>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {rfq.reference}
          <StatusBadge status={rfq.status} />
        </h1>
        <span className={styles.fieldLabel}>Created {formatDateTime(rfq.createdAt)}</span>
      </div>

      {actionError ? <p className={styles.errorMessage}>{actionError}</p> : null}

      <div className={styles.layout}>
        <div style={{ display: "grid", gap: 16 }}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Customer</p>
            <div className={styles.fieldGrid}>
              <div>
                <div className={styles.fieldLabel}>Name</div>
                <div className={styles.fieldValue}>{rfq.contact.name}</div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Phone</div>
                <div className={styles.fieldValue}>{rfq.contact.phone}</div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Email</div>
                <div className={styles.fieldValue}>{rfq.contact.email || "—"}</div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Company</div>
                <div className={styles.fieldValue}>{rfq.contact.company?.name || rfq.contact.companyNameRaw || "—"}</div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Delivery</div>
                <div className={styles.fieldValue}>
                  {[rfq.deliveryCity, rfq.deliveryPin].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Source</div>
                <div className={styles.fieldValue}>
                  {rfq.sourceType} · {rfq.sourcePath}
                </div>
              </div>
            </div>
            {rfq.message ? (
              <div>
                <div className={styles.fieldLabel}>Message</div>
                <p style={{ fontSize: 13, marginTop: 4 }}>{rfq.message}</p>
              </div>
            ) : null}
            {rfq.requirementData && Object.keys(rfq.requirementData).length > 0 ? (
              <RequirementData data={rfq.requirementData} />
            ) : null}
          </div>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Original Customer Request</p>
            <p className={styles.fieldLabel} style={{ marginTop: -4 }}>
              What the customer submitted — never changes.
            </p>
            {rfq.items.length === 0 ? (
              <p className={styles.fieldLabel}>No items submitted.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {rfq.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          <WorkingRequirement
            rfqId={id}
            items={workingItems}
            onChange={setWorkingItems}
            onError={setActionError}
          />

          <div className={styles.card}>
            <p className={styles.cardTitle}>Quotations</p>
            {quotations.length === 0 ? (
              <p className={styles.fieldLabel}>No quotations yet.</p>
            ) : (
              <div>
                {quotations.map((q) => {
                  const revealedLink = linkByQuotation[q.id];
                  const whatsappUrl =
                    revealedLink && whatsappNumber
                      ? buildWhatsAppUrl(whatsappNumber, buildQuoteWhatsAppMessage(`${rfq.reference}-V${q.version}`))
                      : null;
                  return (
                    <div key={q.id} className={styles.quotationRow} style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span>
                          V{q.version} — <StatusBadge status={q.status} /> ·{" "}
                          {q.status === "DRAFT" && (q.linesNeedingRate ?? 0) > 0
                            ? "Pricing incomplete"
                            : formatInr(q.grandTotal)}{" "}
                          · by {q.createdBy?.name}
                        </span>
                        <span style={{ display: "flex", gap: 8 }}>
                          <Link className={styles.actionLink} to={`/admin/quotations/${q.id}`}>
                            Open
                          </Link>
                          {q.status === "DRAFT" && (q.lineCount ?? 0) === 0 ? (
                            <button
                              type="button"
                              className={styles.actionLink}
                              style={{ background: "none", border: "none", cursor: "pointer" }}
                              onClick={() => onImportRfqItems(q.id)}
                            >
                              Import RFQ items
                            </button>
                          ) : null}
                          {q.status === "DRAFT" && (q.linesNeedingRate ?? 0) > 0 ? (
                            <span className={styles.fieldLabel} style={{ color: "#b45309" }}>
                              {q.linesNeedingRate === 1 ? "1 rate pending" : `${q.linesNeedingRate} rates pending`}
                            </span>
                          ) : null}
                          {canCreateRevision(q.status) ? (
                            <button type="button" className={styles.actionLink} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => onCreateRevision(q.id)}>
                              Create New Version
                            </button>
                          ) : null}
                          {ACTIONABLE_QUOTE_STATUSES.includes(q.status) ? (
                            <>
                              <button type="button" className={styles.actionLink} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => onAccept(q.id)}>
                                Mark Accepted
                              </button>
                              <button
                                type="button"
                                className={styles.actionLink}
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                                onClick={() => setRejectTargetId(rejectTargetId === q.id ? null : q.id)}
                              >
                                Mark Rejected
                              </button>
                            </>
                          ) : null}
                        </span>
                      </div>

                      {q.status !== "DRAFT" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span className={styles.fieldLabel}>
                            Customer link: {q.hasActiveLink ? "active" : "none"}
                          </span>
                          <button
                            type="button"
                            className={styles.actionLink}
                            style={{ background: "none", border: "none", cursor: "pointer" }}
                            disabled={linkBusyId === q.id}
                            onClick={() => onGenerateLink(q.id)}
                          >
                            {linkBusyId === q.id ? "Working…" : q.hasActiveLink ? "Regenerate Link" : "Generate Link"}
                          </button>
                          {q.hasActiveLink ? (
                            <button
                              type="button"
                              className={styles.actionLink}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#b42318" }}
                              disabled={linkBusyId === q.id}
                              onClick={() => onRevokeLink(q.id)}
                            >
                              Revoke Link
                            </button>
                          ) : null}
                        </div>
                      ) : null}

                      {revealedLink ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
                          <code style={{ background: "#f8f9fb", padding: "3px 6px", borderRadius: 4, wordBreak: "break-all" }}>
                            {revealedLink}
                          </code>
                          <button type="button" className={styles.actionLink} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => onCopyLink(q.id, revealedLink)}>
                            {copiedId === q.id ? "Copied!" : "Copy Link"}
                          </button>
                          <a className={styles.actionLink} href={revealedLink} target="_blank" rel="noreferrer">
                            Open Customer View
                          </a>
                          {whatsappUrl ? (
                            <a className={styles.actionLink} href={whatsappUrl} target="_blank" rel="noreferrer">
                              Continue on WhatsApp
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
            {rejectTargetId ? (
              <div className={styles.card} style={{ background: "#fef2f2" }}>
                <p className={styles.fieldLabel}>Rejecting — what should happen to the RFQ?</p>
                <div className={styles.buttonRow}>
                  <button type="button" className={styles.buttonSecondary} onClick={() => onReject(rejectTargetId, "NEGOTIATING")}>
                    Keep negotiating
                  </button>
                  <button type="button" className={styles.buttonDanger} onClick={() => onReject(rejectTargetId, "LOST")}>
                    Mark RFQ Lost
                  </button>
                  <button type="button" className={styles.buttonSecondary} onClick={() => onReject(rejectTargetId, undefined)}>
                    Reject only (leave RFQ status)
                  </button>
                </div>
              </div>
            ) : null}
            <div className={styles.buttonRow}>
              <button type="button" className={styles.button} onClick={onCreateQuotation}>
                Create Quotation
              </button>
            </div>
          </div>

          {rfq.activity.some((a) => a.type === "CUSTOMER_REVISION_REQUESTED") ? (
            <div className={styles.card} style={{ background: "#fffbeb" }}>
              <p className={styles.cardTitle}>Revision Requested</p>
              <div style={{ display: "grid", gap: 10 }}>
                {rfq.activity
                  .filter((a) => a.type === "CUSTOMER_REVISION_REQUESTED")
                  .map((a) => (
                    <div key={a.id} style={{ fontSize: 12.5 }}>
                      <div className={styles.fieldLabel}>
                        V{a.metadata?.version} · {new Date(a.createdAt).toLocaleString("en-IN")}
                      </div>
                      <div>{a.metadata?.message || "No message provided."}</div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}

          <div className={styles.card}>
            <p className={styles.cardTitle}>Activity</p>
            <div>
              {rfq.activity.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <span>
                    {activity.type} <span className={styles.fieldLabel}>({activity.actorType})</span>
                  </span>
                  <span className={styles.activityWhen}>{new Date(activity.createdAt).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.side}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Status</p>
            <select
              className={styles.select}
              value={rfq.status}
              disabled={savingField === "status"}
              onChange={(event) => patchRfq({ status: event.target.value })}
            >
              {RFQ_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Assignment</p>
            <select
              className={styles.select}
              value={rfq.assignedTo?.id || ""}
              disabled={savingField === "assignedToUserId"}
              onChange={(event) => patchRfq({ assignedToUserId: event.target.value || null })}
            >
              <option value="">Unassigned</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Internal Notes</p>
            <div className={styles.notesThread}>
              {rfq.notes.length === 0 ? <p className={styles.fieldLabel}>No notes yet.</p> : null}
              {rfq.notes.map((note) => (
                <div key={note.id} className={styles.note}>
                  <div className={styles.noteMeta}>
                    {note.author?.name} · {new Date(note.createdAt).toLocaleString("en-IN")}
                  </div>
                  <div>{note.body}</div>
                </div>
              ))}
            </div>
            <form onSubmit={onAddNote} style={{ display: "grid", gap: 6 }}>
              <textarea
                className={styles.textarea}
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
                placeholder="Add an internal note…"
              />
              <button type="submit" className={styles.buttonSecondary} disabled={savingNote}>
                {savingNote ? "Saving…" : "Add note"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as rfqsApi from "../api/rfqs";
import * as quotationsApi from "../api/quotations";
import * as staffApi from "../api/staff";
import * as configApi from "../../api/config";
import { buildWhatsAppUrl, buildQuoteWhatsAppMessage } from "../../utils/whatsapp";
import StatusBadge from "../components/StatusBadge";
import styles from "../components/adminDetail.module.css";

const ACTIONABLE_QUOTE_STATUSES = ["SENT", "VIEWED"];

const RFQ_STATUSES = ["NEW", "IN_PROGRESS", "QUOTED", "NEGOTIATING", "WON", "LOST", "CANCELLED"];

function formatInr(value) {
  if (value == null) return "Price on request";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function ItemCard({ item }) {
  return (
    <div className={styles.itemCard}>
      <div className={styles.itemTitle}>
        {item.productNameSnapshot || item.description || "Item"}
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
  const [itemDescription, setItemDescription] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [linkByQuotation, setLinkByQuotation] = useState({});
  const [linkBusyId, setLinkBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState(null);

  const load = () => {
    Promise.all([rfqsApi.getRfq(id), quotationsApi.listForRfq(id)])
      .then(([{ rfq: data }, { quotations: qs }]) => {
        setRfq(data);
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

  const onAddItem = async (event) => {
    event.preventDefault();
    if (!itemDescription.trim()) return;
    setAddingItem(true);
    setActionError(null);
    try {
      await rfqsApi.addItem(id, {
        description: itemDescription.trim(),
        quantity: itemQuantity ? Number(itemQuantity) : undefined,
      });
      setItemDescription("");
      setItemQuantity("");
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setAddingItem(false);
    }
  };

  const onCreateQuotation = async () => {
    setActionError(null);
    try {
      const lines = (rfq.items || [])
        .filter((item) => item.estimate.unitPrice != null || item.description)
        .map((item, index) => ({
          rfqItemId: item.id,
          lineType: "PRODUCT",
          description: item.productNameSnapshot || item.description,
          quantity: item.quantity || 1,
          unit: item.unitSnapshot || "piece",
          // Starting value only — the website estimate, never presented as
          // approved final pricing (Phase 3 §37). Sales can overwrite it.
          unitPrice: item.estimate.unitPrice ?? 0,
          sortOrder: index,
        }));
      const { quotation } = await quotationsApi.createQuotation(id, { lines });
      navigate(`/admin/quotations/${quotation.id}`);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const onCreateRevision = async (supersedesId) => {
    setActionError(null);
    try {
      const { quotation: full } = await quotationsApi.getQuotation(supersedesId);
      const lines = full.lines.map((line) => ({
        rfqItemId: line.rfqItemId || undefined,
        lineType: line.lineType,
        description: line.description,
        quantity: line.quantity || undefined,
        unit: line.unit || undefined,
        unitPrice: line.unitPrice || undefined,
        lineTotal: line.unitPrice == null ? line.lineTotal : undefined,
      }));
      const { quotation } = await quotationsApi.createQuotation(id, {
        supersedesId,
        lines,
        taxMode: full.taxMode || undefined,
        taxAmount: full.taxAmount ?? undefined,
        customerNotes: full.customerNotes || undefined,
      });
      navigate(`/admin/quotations/${quotation.id}`);
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
            {rfq.requirementData ? (
              <div>
                <div className={styles.fieldLabel}>Requirement data</div>
                <pre style={{ fontSize: 11.5, background: "#f8f9fb", padding: 8, borderRadius: 6, overflowX: "auto" }}>
                  {JSON.stringify(rfq.requirementData, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Items</p>
            {rfq.items.length === 0 ? (
              <p className={styles.fieldLabel}>No items yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {rfq.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
            <form onSubmit={onAddItem} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              <label style={{ display: "grid", gap: 4, fontSize: 12.5, flex: "1 1 240px" }}>
                <span className={styles.fieldLabel}>Add described item</span>
                <input
                  className={styles.input}
                  value={itemDescription}
                  onChange={(event) => setItemDescription(event.target.value)}
                  placeholder="Description"
                />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: 12.5, width: 100 }}>
                <span className={styles.fieldLabel}>Qty</span>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(event) => setItemQuantity(event.target.value)}
                />
              </label>
              <button type="submit" className={styles.buttonSecondary} disabled={addingItem}>
                {addingItem ? "Adding…" : "Add item"}
              </button>
            </form>
          </div>

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
                          V{q.version} — <StatusBadge status={q.status} /> · {formatInr(q.grandTotal)} · by{" "}
                          {q.createdBy?.name}
                        </span>
                        <span style={{ display: "flex", gap: 8 }}>
                          <Link className={styles.actionLink} to={`/admin/quotations/${q.id}`}>
                            Open
                          </Link>
                          {ACTIONABLE_QUOTE_STATUSES.includes(q.status) ? (
                            <>
                              <button type="button" className={styles.actionLink} style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => onCreateRevision(q.id)}>
                                Create Revision
                              </button>
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

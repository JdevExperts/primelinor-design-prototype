import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as leadsApi from "../api/leads";
import StatusBadge from "../components/StatusBadge";
import styles from "../components/adminDetail.module.css";

const LEAD_STATUSES = ["NEW", "IN_REVIEW", "CONVERTED", "CLOSED"];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");

  const [message, setMessage] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const load = () => {
    leadsApi
      .getLead(id)
      .then(({ lead: data }) => {
        setLead(data);
        setMessage(data.message);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, [id]);

  const onStatusChange = async (event) => {
    const nextStatus = event.target.value;
    setStatusSaving(true);
    setStatusError(null);
    try {
      const { lead: updated } = await leadsApi.updateLead(id, { status: nextStatus });
      setLead(updated);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusSaving(false);
    }
  };

  const onConvert = async (event) => {
    event.preventDefault();
    setConverting(true);
    setConvertError(null);
    try {
      const payload = { message };
      if (itemDescription.trim()) {
        payload.items = [
          {
            description: itemDescription.trim(),
            quantity: itemQuantity ? Number(itemQuantity) : undefined,
          },
        ];
      }
      const { rfq } = await leadsApi.convertLead(id, payload);
      navigate(`/admin/rfqs/${rfq.id}`);
    } catch (err) {
      setConvertError(err.message);
    } finally {
      setConverting(false);
    }
  };

  if (loadStatus === "loading") return <p>Loading…</p>;
  if (loadStatus === "error" || !lead) return <p>Couldn&rsquo;t load this lead.</p>;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin/leads">← Leads</Link>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {lead.reference}
          <StatusBadge status={lead.status} />
        </h1>
        <select className={styles.select} style={{ width: 160 }} value={lead.status} onChange={onStatusChange} disabled={statusSaving || lead.status === "CONVERTED"}>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s} disabled={s === "CONVERTED"}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {statusError ? <p className={styles.errorMessage}>{statusError}</p> : null}

      <div className={styles.layout}>
        <div style={{ display: "grid", gap: 16 }}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Contact</p>
            <div className={styles.fieldGrid}>
              <div>
                <div className={styles.fieldLabel}>Name</div>
                <div className={styles.fieldValue}>{lead.contact.name}</div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Phone</div>
                <div className={styles.fieldValue}>{lead.contact.phone}</div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Email</div>
                <div className={styles.fieldValue}>{lead.contact.email || "—"}</div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Company</div>
                <div className={styles.fieldValue}>{lead.contact.company?.name || lead.contact.companyNameRaw || "—"}</div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Request</p>
            <div className={styles.fieldGrid}>
              <div>
                <div className={styles.fieldLabel}>Source</div>
                <div className={styles.fieldValue}>
                  {lead.sourceType} · {lead.sourcePath}
                </div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Created</div>
                <div className={styles.fieldValue}>{new Date(lead.createdAt).toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div>
              <div className={styles.fieldLabel}>Message</div>
              <p style={{ fontSize: 13, marginTop: 4 }}>{lead.message}</p>
            </div>
          </div>

          {lead.status === "CONVERTED" ? (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Converted</p>
              <p style={{ fontSize: 13 }}>
                This lead has been converted.{" "}
                <Link className={styles.artworkLink} to={`/admin/rfqs/${lead.convertedRfqId}`}>
                  View RFQ →
                </Link>
              </p>
            </div>
          ) : (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Convert to RFQ</p>
              <form onSubmit={onConvert} style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 4, fontSize: 12.5 }}>
                  <span className={styles.fieldLabel}>Message / requirement</span>
                  <textarea
                    className={styles.textarea}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </label>
                <p className={styles.fieldLabel}>
                  Optional initial item — you can also add items later on the RFQ.
                </p>
                <label style={{ display: "grid", gap: 4, fontSize: 12.5 }}>
                  <span className={styles.fieldLabel}>Description</span>
                  <input
                    className={styles.input}
                    value={itemDescription}
                    onChange={(event) => setItemDescription(event.target.value)}
                    placeholder="e.g. Branded notebook, custom cover print"
                  />
                </label>
                <label style={{ display: "grid", gap: 4, fontSize: 12.5, maxWidth: 160 }}>
                  <span className={styles.fieldLabel}>Quantity</span>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(event) => setItemQuantity(event.target.value)}
                  />
                </label>
                {convertError ? <p className={styles.errorMessage}>{convertError}</p> : null}
                <div className={styles.buttonRow}>
                  <button type="submit" className={styles.button} disabled={converting}>
                    {converting ? "Converting…" : "Convert to RFQ"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className={styles.side} />
      </div>
    </div>
  );
}

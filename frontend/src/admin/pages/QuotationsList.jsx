import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as quotationsApi from "../api/quotations";
import * as staffApi from "../api/staff";
import { useUrlFilters } from "../utils/useUrlFilters";
import PeriodSelect from "../components/PeriodSelect";
import StatusBadge from "../components/StatusBadge";
import styles from "../components/adminTable.module.css";
import { formatDate, formatDateTime } from "../utils/datetime";

const STATUSES = ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "SUPERSEDED", "CANCELLED"];
const ORIGINS = [
  ["RFQ", "From RFQ"],
  ["MANUAL", "Manual"],
  ["PHONE", "Phone"],
  ["WHATSAPP", "WhatsApp"],
  ["OFFLINE", "Offline"],
];

function formatInr(value) {
  if (value == null) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function QuotationsList() {
  const { value, patch } = useUrlFilters();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [staff, setStaff] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const limit = 20;

  const status = value("status");
  const origin = value("origin");
  const createdBy = value("createdBy");
  const expired = value("expired") === "true";
  const pendingRevision = value("pendingRevision") === "1";
  const thread = value("thread"); // "" | "active"
  const search = value("search");
  const period = value("period", "30d");
  const page = Number(value("page", "1")) || 1;
  const setFilter = (updates) => patch({ ...updates, page: null });

  useEffect(() => {
    staffApi.listStaff().then(({ staff: list }) => setStaff(list)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    quotationsApi
      .listQuotations({
        page,
        limit,
        status: status || undefined,
        origin: origin || undefined,
        createdBy: createdBy || undefined,
        expired: expired ? "true" : undefined,
        pendingRevision: pendingRevision ? "1" : undefined,
        thread: thread || undefined,
        period,
        search: search.trim() || undefined,
      })
      .then(({ quotations, total: count }) => {
        if (cancelled) return;
        setRows(quotations);
        setTotal(count);
        setLoadState("ready");
      })
      .catch(() => !cancelled && setLoadState("error"));
    return () => {
      cancelled = true;
    };
  }, [page, status, origin, createdBy, expired, pendingRevision, thread, period, search]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);
  const specialFilter =
    (pendingRevision && "Pending revision requests") || (thread === "active" && "Active threads") || null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quotations</h1>
        <Link
          to="/admin/quotations/new"
          style={{
            background: "#101828",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + New Quotation
        </Link>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search quotation no, RFQ, customer, phone or product code…"
          value={search}
          onChange={(event) => setFilter({ search: event.target.value })}
          style={{ minWidth: 320 }}
        />
        <select value={status} onChange={(event) => setFilter({ status: event.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={origin} onChange={(event) => setFilter({ origin: event.target.value })}>
          <option value="">Any origin</option>
          {ORIGINS.map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
        <select value={createdBy} onChange={(event) => setFilter({ createdBy: event.target.value })}>
          <option value="">Anyone</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={expired}
            onChange={(event) => setFilter({ expired: event.target.checked ? "true" : null })}
          />
          Expired only
        </label>
        {specialFilter ? (
          <button
            type="button"
            className={styles.clearChip}
            onClick={() => setFilter({ pendingRevision: null, thread: null })}
          >
            {specialFilter} ✕
          </button>
        ) : null}
        <PeriodSelect value={period} onChange={(p) => setFilter({ period: p === "30d" ? null : p })} />
      </div>

      {loadState === "loading" ? (
        <p>Loading…</p>
      ) : loadState === "error" ? (
        <p>Couldn&rsquo;t load quotations.</p>
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No quotations match these filters.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Ver</th>
                <th>Versions</th>
                <th>Party</th>
                <th>Origin</th>
                <th>RFQ</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Grand Total</th>
                <th>Valid Until</th>
                <th>Created By</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id}>
                  <td>
                    <Link className={styles.rowLink} to={`/admin/quotations/${q.id}`}>
                      {q.reference}
                    </Link>
                  </td>
                  <td>V{q.latestVersion ?? q.version}</td>
                  <td className={styles.muted}>
                    {(q.versionCount ?? 1) > 1 ? `${q.versionCount} versions` : "1 version"}
                  </td>
                  <td>{q.party?.name || "—"}</td>
                  <td>
                    {(ORIGINS.find(([v]) => v === q.originType)?.[1]) || q.originType}
                    {q.originDetail ? (
                      <span className={styles.muted} style={{ display: "block", fontSize: 10.5 }}>{q.originDetail}</span>
                    ) : null}
                  </td>
                  <td className={styles.muted}>
                    {q.rfqReference ? (
                      <Link className={styles.rowLink} to={`/admin/rfqs/${q.rfqId}`}>{q.rfqReference}</Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <StatusBadge status={q.status} />
                    {q.isExpired ? (
                      <span style={{ display: "block", marginTop: 3, fontSize: 10.5, fontWeight: 700, color: "#b45309" }}>
                        EXPIRED
                      </span>
                    ) : null}
                    {q.pendingRevision ? (
                      <span
                        style={{
                          display: "block",
                          marginTop: 3,
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: "#b45309",
                        }}
                      >
                        REVISION REQUESTED
                      </span>
                    ) : null}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {q.status === "DRAFT" && (q.linesNeedingRate ?? 0) > 0 ? (
                      <span style={{ color: "#b45309", fontSize: 12 }}>Pricing incomplete</span>
                    ) : (
                      formatInr(q.grandTotal)
                    )}
                  </td>
                  <td className={styles.muted}>{formatDate(q.validUntil)}</td>
                  <td className={styles.muted}>{q.createdBy?.name || "—"}</td>
                  <td className={styles.muted} style={{ whiteSpace: "nowrap" }}>{formatDateTime(q.createdAt)}</td>
                  <td className={styles.muted} style={{ whiteSpace: "nowrap" }}>{formatDateTime(q.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 ? (
        <div className={styles.pager}>
          <button type="button" disabled={page <= 1} onClick={() => patch({ page: page - 1 })}>
            ← Prev
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button type="button" disabled={page >= pageCount} onClick={() => patch({ page: page + 1 })}>
            Next →
          </button>
        </div>
      ) : null}
    </div>
  );
}

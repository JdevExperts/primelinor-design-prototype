import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as leadsApi from "../api/leads";
import { useUrlFilters } from "../utils/useUrlFilters";
import PeriodSelect from "../components/PeriodSelect";
import StatusBadge from "../components/StatusBadge";
import styles from "../components/adminTable.module.css";
import { formatDate, formatDateTime } from "../utils/datetime";

const LEAD_STATUSES = ["NEW", "IN_REVIEW", "CONVERTED", "CLOSED"];
const SOURCE_TYPES = [
  "HEADER_QUOTE",
  "PDP",
  "CUSTOMIZATION_STUDIO",
  "CORPORATE_GIFTING",
  "KIT_BUILDER",
  "SOLUTION",
  "CONTACT",
  "ABOUT",
  "OTHER",
];

export default function LeadsInbox() {
  const { value, patch } = useUrlFilters();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadStatus, setLoadStatus] = useState("loading");
  const limit = 20;

  const status = value("status");
  const source = value("source");
  const search = value("search");
  const dateFrom = value("dateFrom");
  const dateTo = value("dateTo");
  const period = value("period", "30d");
  const page = Number(value("page", "1")) || 1;
  const setFilter = (updates) => patch({ ...updates, page: null });
  const dateFilterActive = Boolean(dateFrom || dateTo);

  useEffect(() => {
    let cancelled = false;
    leadsApi
      .listLeads({
        page,
        limit,
        status: status || undefined,
        source: source || undefined,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        period,
      })
      .then(({ leads: list, total: count }) => {
        if (cancelled) return;
        setLeads(list);
        setTotal(count);
        setLoadStatus("ready");
      })
      .catch(() => !cancelled && setLoadStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [page, status, source, search, dateFrom, dateTo, period]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Leads</h1>
        <span className={styles.pageMeta}>{total} total</span>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search reference, name, phone, email, company…"
          value={search}
          onChange={(event) => setFilter({ search: event.target.value })}
        />
        <select value={status} onChange={(event) => setFilter({ status: event.target.value })}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={source} onChange={(event) => setFilter({ source: event.target.value })}>
          <option value="">All sources</option>
          {SOURCE_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {dateFilterActive ? (
          <button type="button" className={styles.clearChip} onClick={() => setFilter({ dateFrom: null, dateTo: null })}>
            Created {dateFrom ? formatDate(dateFrom) : "…"} – {dateTo ? formatDate(dateTo) : "now"} ✕
          </button>
        ) : null}
        <PeriodSelect
          value={period}
          disabled={dateFilterActive}
          onChange={(p) => setFilter({ period: p === "30d" ? null : p })}
        />
      </div>

      <div className={styles.tableWrap}>
        {loadStatus === "loading" ? (
          <p className={styles.empty}>Loading…</p>
        ) : loadStatus === "error" ? (
          <p className={styles.empty}>Couldn&rsquo;t load leads.</p>
        ) : leads.length === 0 ? (
          <p className={styles.empty}>No leads match these filters.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Name</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <Link className={styles.rowLink} to={`/admin/leads/${lead.id}`}>
                      {lead.reference}
                    </Link>
                  </td>
                  <td>
                    {lead.contactName}
                    <br />
                    <span className={styles.muted}>{lead.contactPhone}</span>
                  </td>
                  <td className={styles.muted}>{lead.companyName || "—"}</td>
                  <td className={styles.muted}>{lead.sourceType}</td>
                  <td>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className={styles.muted}>{formatDateTime(lead.createdAt)}</td>
                  <td>
                    <Link className={styles.actionLink} to={`/admin/leads/${lead.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 ? (
        <div className={styles.pager}>
          <button type="button" disabled={page <= 1} onClick={() => patch({ page: page - 1 })}>
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button type="button" disabled={page >= pages} onClick={() => patch({ page: page + 1 })}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

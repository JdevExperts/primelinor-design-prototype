import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as rfqsApi from "../api/rfqs";
import * as staffApi from "../api/staff";
import { useAdminAuth } from "../context/useAdminAuth";
import StatusBadge from "../components/StatusBadge";
import styles from "../components/adminTable.module.css";

const RFQ_STATUSES = ["NEW", "IN_PROGRESS", "QUOTED", "NEGOTIATING", "WON", "LOST", "CANCELLED"];
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

function formatInr(value) {
  if (value == null) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function RfqsInbox() {
  const { staffUser } = useAdminAuth();
  const [rfqs, setRfqs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [search, setSearch] = useState("");
  const [loadStatus, setLoadStatus] = useState("loading");
  const limit = 20;

  useEffect(() => {
    staffApi.listStaff().then(({ staff: list }) => setStaff(list)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    rfqsApi
      .listRfqs({ page, limit, status, source, assignedTo, search: search || undefined })
      .then(({ rfqs: list, total: count }) => {
        if (cancelled) return;
        setRfqs(list);
        setTotal(count);
        setLoadStatus("ready");
      })
      .catch(() => !cancelled && setLoadStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [page, status, source, assignedTo, search]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>RFQs</h1>
        <span className={styles.pageMeta}>{total} total</span>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search reference, name, phone, email, company…"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
        >
          <option value="">All statuses</option>
          {RFQ_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={source}
          onChange={(event) => {
            setPage(1);
            setSource(event.target.value);
          }}
        >
          <option value="">All sources</option>
          {SOURCE_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={assignedTo}
          onChange={(event) => {
            setPage(1);
            setAssignedTo(event.target.value);
          }}
        >
          <option value="">Anyone</option>
          <option value="unassigned">Unassigned</option>
          {staffUser ? <option value={staffUser.id}>Assigned to me</option> : null}
          {staff
            .filter((member) => member.id !== staffUser?.id)
            .map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loadStatus === "loading" ? (
          <p className={styles.empty}>Loading…</p>
        ) : loadStatus === "error" ? (
          <p className={styles.empty}>Couldn&rsquo;t load RFQs.</p>
        ) : rfqs.length === 0 ? (
          <p className={styles.empty}>No RFQs match these filters.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Company</th>
                <th>Source</th>
                <th>Items</th>
                <th>Estimate</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => (
                <tr key={rfq.id}>
                  <td>
                    <Link className={styles.rowLink} to={`/admin/rfqs/${rfq.id}`}>
                      {rfq.reference}
                    </Link>
                  </td>
                  <td>
                    {rfq.contactName}
                    <br />
                    <span className={styles.muted}>{rfq.contactPhone}</span>
                  </td>
                  <td className={styles.muted}>{rfq.companyName || "—"}</td>
                  <td className={styles.muted}>{rfq.sourceType}</td>
                  <td>{rfq.itemCount}</td>
                  <td>{formatInr(rfq.estimatedTotal)}</td>
                  <td>
                    <StatusBadge status={rfq.status} />
                  </td>
                  <td className={styles.muted}>{rfq.assignedTo?.name || "Unassigned"}</td>
                  <td className={styles.muted}>{new Date(rfq.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <Link className={styles.actionLink} to={`/admin/rfqs/${rfq.id}`}>
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
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

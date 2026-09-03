import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as quotationsApi from "../api/quotations";
import ProductPicker from "../components/ProductPicker";
import styles from "../components/adminDetail.module.css";

let keySeq = 0;
const nextKey = () => `l${(keySeq += 1)}`;

function formatInr(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function lineAmount(line) {
  if ((line.lineType === "PRODUCT" || line.lineType === "SHIPPING") && line.quantity !== "" && line.unitPrice !== "") {
    return Number(line.quantity) * Number(line.unitPrice);
  }
  if (line.lineTotal !== "") return Number(line.lineTotal);
  return null;
}

export default function NewQuotation() {
  const navigate = useNavigate();
  const [party, setParty] = useState({ name: "", contactPerson: "", phone: "", email: "", gstin: "", address: "" });
  const [origin, setOrigin] = useState("MANUAL");
  const [originDetail, setOriginDetail] = useState("");
  const [lines, setLines] = useState([]);
  const [validUntil, setValidUntil] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const setPartyField = (key) => (event) => setParty((p) => ({ ...p, [key]: event.target.value }));
  const updateLine = (key, patch) => setLines((cur) => cur.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key) => setLines((cur) => cur.filter((l) => l.key !== key));

  const addProduct = (product) => {
    setLines((cur) => {
      const existing = cur.find((l) => l.productId === product.id);
      if (existing) {
        return cur.map((l) =>
          l.key === existing.key ? { ...l, quantity: String(Number(l.quantity || 0) + Math.max(1, product.moq || 1)) } : l,
        );
      }
      return [
        ...cur,
        {
          key: nextKey(),
          lineType: "PRODUCT",
          productId: product.id,
          productCode: product.productCode,
          description: product.name,
          moq: product.moq,
          quantity: String(product.moq || 1),
          unit: product.unit || "piece",
          // Pre-fill the catalogue rate as an editable starting value; blank
          // for QUOTE_ONLY (effectivePrice is null) -> "Rate required".
          unitPrice: product.effectivePrice != null ? String(product.effectivePrice) : "",
          lineTotal: "",
        },
      ];
    });
  };

  const addLine = (lineType) =>
    setLines((cur) => [
      ...cur,
      { key: nextKey(), lineType, description: "", quantity: "", unit: "", unitPrice: "", lineTotal: "" },
    ]);

  const grandTotal = useMemo(
    () => lines.reduce((sum, l) => sum + (lineAmount(l) ?? 0), 0),
    [lines],
  );
  const needRate = lines.filter(
    (l) => (l.lineType === "PRODUCT" || l.lineType === "SHIPPING") && l.quantity !== "" && l.unitPrice === "" && l.lineTotal === "",
  ).length;
  const canSave = party.name.trim().length > 0;

  const onCreate = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        origin,
        originDetail: originDetail.trim() || undefined,
        party: {
          name: party.name.trim(),
          contactPerson: party.contactPerson.trim() || undefined,
          phone: party.phone.trim() || undefined,
          email: party.email.trim() || undefined,
          gstin: party.gstin.trim() || undefined,
          address: party.address.trim() || undefined,
        },
        validUntil: validUntil || undefined,
        customerNotes: customerNotes.trim() || undefined,
        lines: lines
          .filter((l) => l.description.trim())
          .map((l, index) => ({
            lineType: l.lineType,
            productId: l.productId || undefined,
            productCode: l.productCode || undefined,
            description: l.description.trim(),
            quantity: l.quantity === "" ? undefined : Number(l.quantity),
            unit: l.unit || undefined,
            unitPrice: l.unitPrice === "" ? undefined : Number(l.unitPrice),
            lineTotal: l.lineTotal === "" ? undefined : Number(l.lineTotal),
            sortOrder: index,
          })),
      };
      const { quotation } = await quotationsApi.createManualQuotation(payload);
      navigate(`/admin/quotations/${quotation.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin/quotations">← Quotations</Link>
      </nav>
      <div className={styles.header}>
        <h1 style={{ margin: 0, fontSize: 20 }}>New Quotation</h1>
      </div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.card}>
        <p className={styles.cardTitle}>Source</p>
        <div className={styles.fieldGrid} style={{ gridTemplateColumns: "1fr 2fr" }}>
          <label>
            <div className={styles.fieldLabel}>Origin</div>
            <select className={styles.select} value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option value="MANUAL">Manual</option>
              <option value="PHONE">Phone</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </label>
          <label>
            <div className={styles.fieldLabel}>Source detail (optional)</div>
            <input
              className={styles.input}
              value={originDetail}
              placeholder="e.g. WhatsApp enquiry from +91…, Office meeting"
              onChange={(e) => setOriginDetail(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className={styles.card}>
        <p className={styles.cardTitle}>Party details</p>
        <div className={styles.fieldGrid} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <label>
            <div className={styles.fieldLabel}>Customer / Company name *</div>
            <input className={styles.input} value={party.name} onChange={setPartyField("name")} />
          </label>
          <label>
            <div className={styles.fieldLabel}>Contact person</div>
            <input className={styles.input} value={party.contactPerson} onChange={setPartyField("contactPerson")} />
          </label>
          <label>
            <div className={styles.fieldLabel}>Phone</div>
            <input className={styles.input} value={party.phone} onChange={setPartyField("phone")} />
          </label>
          <label>
            <div className={styles.fieldLabel}>Email</div>
            <input className={styles.input} value={party.email} onChange={setPartyField("email")} />
          </label>
          <label>
            <div className={styles.fieldLabel}>GSTIN</div>
            <input className={styles.input} value={party.gstin} onChange={setPartyField("gstin")} />
          </label>
          <label>
            <div className={styles.fieldLabel}>Address</div>
            <input className={styles.input} value={party.address} onChange={setPartyField("address")} />
          </label>
        </div>
      </div>

      <div className={styles.card}>
        <p className={styles.cardTitle}>Products &amp; charges</p>
        <div style={{ maxWidth: 460, marginBottom: 12 }}>
          <ProductPicker onSelect={addProduct} />
        </div>

        {lines.length === 0 ? (
          <p className={styles.fieldLabel}>No products added yet. Search above, or add a shipping / discount line.</p>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.lineTable}>
              <thead>
                <tr>
                  <th>Product / Description</th>
                  <th>Code</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.key}>
                    <td>
                      <input
                        className={styles.input}
                        value={line.description}
                        placeholder={line.lineType === "PRODUCT" ? "Product" : line.lineType}
                        onChange={(event) => updateLine(line.key, { description: event.target.value })}
                      />
                      {line.moq && line.quantity !== "" && Number(line.quantity) < line.moq ? (
                        <div style={{ fontSize: 11, color: "#b45309" }}>Below standard MOQ: {line.moq}</div>
                      ) : null}
                    </td>
                    <td className={styles.muted} style={{ whiteSpace: "nowrap" }}>{line.productCode || "—"}</td>
                    <td data-label="Qty">
                      <input
                        className={styles.input}
                        style={{ width: 64 }}
                        type="number"
                        value={line.quantity}
                        onChange={(event) => updateLine(line.key, { quantity: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.input}
                        style={{ width: 72 }}
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
                        placeholder={line.lineType === "PRODUCT" ? "rate" : ""}
                        onChange={(event) => updateLine(line.key, { unitPrice: event.target.value })}
                      />
                      {(line.lineType === "SHIPPING" || line.lineType === "DISCOUNT" || line.lineType === "ADJUSTMENT") ? (
                        <input
                          className={styles.input}
                          style={{ width: 90, marginTop: 4 }}
                          type="number"
                          value={line.lineTotal}
                          placeholder="amount"
                          onChange={(event) => updateLine(line.key, { lineTotal: event.target.value })}
                        />
                      ) : null}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {lineAmount(line) == null ? (
                        <span style={{ color: "#b45309", fontSize: 12 }}>Rate required</span>
                      ) : (
                        formatInr(lineAmount(line))
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
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

        <div className={styles.buttonRow} style={{ marginTop: 10 }}>
          {["SHIPPING", "DISCOUNT", "ADJUSTMENT"].map((t) => (
            <button key={t} type="button" className={styles.buttonSecondary} onClick={() => addLine(t)}>
              + {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Terms</p>
          <div className={styles.fieldGrid}>
            <label>
              <div className={styles.fieldLabel}>Valid until</div>
              <input className={styles.input} type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>Defaults to 7 days from today if left blank.</div>
            </label>
          </div>
          <label style={{ display: "grid", gap: 4 }}>
            <span className={styles.fieldLabel}>Customer notes</span>
            <textarea className={styles.textarea} value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
          </label>
        </div>
        <div className={styles.side}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Totals</p>
            {needRate > 0 ? (
              <>
                <div style={{ fontWeight: 600 }}>Estimated Total</div>
                <div style={{ color: "#b45309", fontWeight: 600 }}>Pricing incomplete</div>
                <div className={styles.fieldLabel}>
                  {needRate === 1 ? "1 line needs a rate" : `${needRate} lines need a rate`}
                </div>
              </>
            ) : (
              <div>Estimated grand total: {formatInr(grandTotal)}</div>
            )}
          </div>
          <div className={styles.card}>
            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.button}
                disabled={!canSave || saving}
                onClick={onCreate}
              >
                {saving ? "Creating…" : "Create draft"}
              </button>
            </div>
            <p className={styles.fieldLabel}>
              You can add rates and send the quotation on the next screen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

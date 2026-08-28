import { useState } from "react";
import { addSolutionProduct, updateSolutionProduct, removeSolutionProduct } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";
import tableStyles from "../../../components/adminTable.module.css";

function MappedRow({ solutionId, mapping, onChanged, onRemoved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const patch = async (fields) => {
    setSaving(true);
    setError(null);
    try {
      const { solution } = await updateSolutionProduct(solutionId, mapping.productId, fields);
      onChanged(solution);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { solution } = await removeSolutionProduct(solutionId, mapping.productId);
      onRemoved(solution);
    } catch (err) {
      setError(err.message);
      setSaving(false);
      setConfirmingRemove(false);
    }
  };

  return (
    <tr>
      <td>
        {mapping.product.name}
        <br />
        <span className={tableStyles.muted}>{mapping.product.slug}</span>
      </td>
      <td>{mapping.product.active ? "Active" : <span style={{ color: "#b42318" }}>Inactive</span>}</td>
      <td>
        <input
          className={styles.input}
          style={{ width: 70 }}
          type="number"
          defaultValue={mapping.sortOrder}
          onBlur={(e) => Number(e.target.value) !== mapping.sortOrder && patch({ sortOrder: Number(e.target.value) })}
          disabled={saving}
        />
      </td>
      <td>
        <input type="checkbox" checked={mapping.featured} onChange={(e) => patch({ featured: e.target.checked })} disabled={saving} />
      </td>
      <td>
        <button type="button" className={tableStyles.actionLink} onClick={handleRemove} disabled={saving} style={{ color: "#b42318" }}>
          {confirmingRemove ? "Confirm remove?" : "Remove"}
        </button>
        {error ? <div style={{ color: "#b42318", fontSize: 11, maxWidth: 260 }}>{error}</div> : null}
      </td>
    </tr>
  );
}

/**
 * Mapping mutations hit their own subresource endpoints immediately
 * (add/reorder/feature/remove) rather than a bulk save — same reasoning
 * ProductAsset/PlacementZone already use on the Product editor: the
 * backend enforces the active-invariant on every one of these calls
 * (Solutions Phase A §5), so an immediate round trip is what actually
 * surfaces "you can't remove the last active product" as it happens,
 * not after a batched save.
 */
export default function ProductsTab({ solution, allProducts, onSaved }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  const mappedIds = new Set(solution.products.map((p) => p.productId));
  const candidates = allProducts.filter(
    (p) => !mappedIds.has(p.id) && (search === "" || p.name.toLowerCase().includes(search.toLowerCase())),
  );
  const sortedMappings = [...solution.products].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAdd = async (productId) => {
    setAdding(true);
    setError(null);
    try {
      const { solution: updated } = await addSolutionProduct(solution.id, { productId });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.card}>
        <div className={styles.cardTitle}>Mapped Products ({sortedMappings.length})</div>
        {sortedMappings.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#6b7280" }}>No products mapped yet — add one below.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th>Sort Order</th>
                <th>Featured</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedMappings.map((mapping) => (
                <MappedRow key={mapping.productId} solutionId={solution.id} mapping={mapping} onChanged={onSaved} onRemoved={onSaved} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Add a Product</div>
        <input className={styles.input} placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div style={{ maxHeight: 220, overflowY: "auto", display: "grid", gap: 4, marginTop: 8 }}>
          {candidates.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" }}>
              <span>
                {p.name} <span style={{ color: "#6b7280" }}>({p.slug})</span>
                {!p.active ? <span style={{ marginLeft: 6, color: "#b42318" }}>Inactive</span> : null}
              </span>
              <button type="button" className={styles.buttonSecondary} onClick={() => handleAdd(p.id)} disabled={adding}>
                Add
              </button>
            </div>
          ))}
          {candidates.length === 0 ? <p style={{ fontSize: 12, color: "#6b7280" }}>No products match.</p> : null}
        </div>
      </div>
    </div>
  );
}

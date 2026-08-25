import { useEffect, useState } from "react";
import { listColorsAdmin, createColorAdmin, updateColorAdmin } from "../../api/catalog";
import { useAdminAuth } from "../../context/useAdminAuth";
import { slugify } from "./productEditor/fieldSets";
import tableStyles from "../../components/adminTable.module.css";
import styles from "../../components/adminDetail.module.css";

function CreateForm({ onCreated }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [hex, setHex] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { color } = await createColorAdmin({ name: name.trim(), slug: slug.trim(), hex: hex.trim() || undefined });
      onCreated(color);
      setName("");
      setSlug("");
      setSlugTouched(false);
      setHex("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardTitle}>Add Color</div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className={styles.input}
          style={{ width: 180 }}
          placeholder="Name (Navy)"
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            setName(v);
            if (!slugTouched) setSlug(slugify(v));
          }}
        />
        <input className={styles.input} style={{ width: 160 }} placeholder="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
        <input className={styles.input} style={{ width: 110 }} placeholder="#22304A" value={hex} onChange={(e) => setHex(e.target.value)} />
        {hex ? <span style={{ width: 20, height: 20, borderRadius: "50%", background: hex, border: "1px solid #ddd", display: "inline-block" }} /> : null}
        <button type="submit" className={styles.button} disabled={saving || !name.trim() || !slug.trim()}>
          {saving ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}

function ColorRow({ color, onUpdated, isAdmin }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const patch = async (fields) => {
    setSaving(true);
    setError(null);
    try {
      const { color: updated } = await updateColorAdmin(color.id, fields);
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td>
        {color.hex ? <span style={{ width: 14, height: 14, borderRadius: "50%", background: color.hex, border: "1px solid #ddd", display: "inline-block", marginRight: 6, verticalAlign: "middle" }} /> : null}
        {color.name}
      </td>
      <td className={tableStyles.muted}>{color.slug}</td>
      <td className={tableStyles.muted}>{color.hex || "—"}</td>
      <td>
        <input
          className={styles.input}
          style={{ width: 70 }}
          type="number"
          defaultValue={color.sortOrder}
          onBlur={(e) => Number(e.target.value) !== color.sortOrder && patch({ sortOrder: Number(e.target.value) })}
          disabled={saving || !isAdmin}
        />
      </td>
      <td>
        <button
          type="button"
          className={color.active ? tableStyles.actionLink : tableStyles.muted}
          onClick={() => patch({ active: !color.active })}
          disabled={saving || !isAdmin}
          style={{ border: "none", background: "none", cursor: isAdmin ? "pointer" : "default" }}
        >
          {color.active ? "Active" : "Inactive"}
        </button>
      </td>
      {error ? (
        <td>
          <span style={{ color: "#b42318", fontSize: 11 }}>{error}</span>
        </td>
      ) : null}
    </tr>
  );
}

export default function ColorsAdmin() {
  const { staffUser } = useAdminAuth();
  const isAdmin = staffUser?.role === "ADMIN";
  const [colors, setColors] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");

  const load = () => {
    listColorsAdmin()
      .then(({ colors: list }) => {
        setColors(list);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, []);

  return (
    <div className={tableStyles.page}>
      <div className={tableStyles.pageHeader}>
        <h1 className={tableStyles.pageTitle}>Colors</h1>
      </div>

      {isAdmin ? <CreateForm onCreated={(c) => setColors((current) => [...current, c])} /> : null}

      <div className={tableStyles.tableWrap}>
        {loadStatus === "loading" ? (
          <p className={tableStyles.empty}>Loading…</p>
        ) : loadStatus === "error" ? (
          <p className={tableStyles.empty}>Couldn&rsquo;t load colors.</p>
        ) : colors.length === 0 ? (
          <p className={tableStyles.empty}>No colors yet — add one above.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Hex</th>
                <th>Sort Order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((c) => (
                <ColorRow
                  key={c.id}
                  color={c}
                  onUpdated={(updated) => setColors((current) => current.map((x) => (x.id === updated.id ? updated : x)))}
                  isAdmin={isAdmin}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

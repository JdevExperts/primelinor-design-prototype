import { useEffect, useState } from "react";
import { listCategoriesAdmin, createCategoryAdmin, updateCategoryAdmin } from "../../api/catalog";
import { useAdminAuth } from "../../context/useAdminAuth";
import { slugify } from "./productEditor/fieldSets";
import tableStyles from "../../components/adminTable.module.css";
import styles from "../../components/adminDetail.module.css";

function CreateForm({ categories, onCreated }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { category } = await createCategoryAdmin({ name: name.trim(), slug: slug.trim(), parentCategoryId: parentCategoryId || undefined });
      onCreated(category);
      setName("");
      setSlug("");
      setSlugTouched(false);
      setParentCategoryId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardTitle}>Add Category</div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className={styles.input}
          style={{ width: 200 }}
          placeholder="Name"
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            setName(v);
            if (!slugTouched) setSlug(slugify(v));
          }}
        />
        <input className={styles.input} style={{ width: 180 }} placeholder="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
        <select className={styles.select} style={{ width: 200 }} value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)}>
          <option value="">No parent (top-level)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.button} disabled={saving || !name.trim() || !slug.trim()}>
          {saving ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}

function CategoryRow({ category, categories, onUpdated, isAdmin }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const patch = async (fields) => {
    setSaving(true);
    setError(null);
    try {
      const { category: updated } = await updateCategoryAdmin(category.id, fields);
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const parent = categories.find((c) => c.id === category.parentCategoryId);

  return (
    <tr>
      <td>{category.name}</td>
      <td className={tableStyles.muted}>{category.slug}</td>
      <td className={tableStyles.muted}>{parent ? parent.name : "—"}</td>
      <td>
        <input
          className={styles.input}
          style={{ width: 70 }}
          type="number"
          defaultValue={category.sortOrder}
          onBlur={(e) => Number(e.target.value) !== category.sortOrder && patch({ sortOrder: Number(e.target.value) })}
          disabled={saving || !isAdmin}
        />
      </td>
      <td>
        <button
          type="button"
          className={category.active ? tableStyles.actionLink : tableStyles.muted}
          onClick={() => patch({ active: !category.active })}
          disabled={saving || !isAdmin}
          style={{ border: "none", background: "none", cursor: isAdmin ? "pointer" : "default" }}
        >
          {category.active ? "Active" : "Inactive"}
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

export default function CategoriesAdmin() {
  const { staffUser } = useAdminAuth();
  const isAdmin = staffUser?.role === "ADMIN";
  const [categories, setCategories] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");

  const load = () => {
    listCategoriesAdmin()
      .then(({ categories: list }) => {
        setCategories(list);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, []);

  return (
    <div className={tableStyles.page}>
      <div className={tableStyles.pageHeader}>
        <h1 className={tableStyles.pageTitle}>Categories</h1>
      </div>

      {isAdmin ? (
        <CreateForm categories={categories} onCreated={(c) => setCategories((current) => [...current, c])} />
      ) : null}

      <div className={tableStyles.tableWrap}>
        {loadStatus === "loading" ? (
          <p className={tableStyles.empty}>Loading…</p>
        ) : loadStatus === "error" ? (
          <p className={tableStyles.empty}>Couldn&rsquo;t load categories.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Sort Order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  categories={categories}
                  onUpdated={(updated) => setCategories((current) => current.map((x) => (x.id === updated.id ? updated : x)))}
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

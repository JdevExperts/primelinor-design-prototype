import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSolutionsAdmin, createSolutionAdmin } from "../../api/catalog";
import { useAdminAuth } from "../../context/useAdminAuth";
import { slugify } from "./productEditor/fieldSets";
import tableStyles from "../../components/adminTable.module.css";
import styles from "../../components/adminDetail.module.css";

function CreateForm({ onCreated }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [hubDescription, setHubDescription] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroCopy, setHeroCopy] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { solution } = await createSolutionAdmin({
        name: name.trim(),
        slug: slug.trim(),
        hubDescription: hubDescription.trim(),
        heroTitle: heroTitle.trim(),
        heroCopy: heroCopy.trim(),
      });
      onCreated(solution);
      setName("");
      setSlug("");
      setSlugTouched(false);
      setHubDescription("");
      setHeroTitle("");
      setHeroCopy("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = name.trim() && slug.trim() && hubDescription.trim() && heroTitle.trim() && heroCopy.trim();

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardTitle}>Add Solution</div>
      <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 8px" }}>
        Starts as a Draft (inactive) with no mapped products — everything else, including product mapping and the
        rest of the page content, is filled in on the editor page next.
      </p>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
        <input
          className={styles.input}
          placeholder="Name (e.g. Corporate Teams)"
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            setName(v);
            if (!slugTouched) setSlug(slugify(v));
          }}
        />
        <input className={styles.input} placeholder="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
        <input
          className={styles.input}
          style={{ gridColumn: "1 / -1" }}
          placeholder="Hub description (one line, shown on the Solutions card)"
          value={hubDescription}
          onChange={(e) => setHubDescription(e.target.value)}
        />
        <input className={styles.input} placeholder="Hero title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
        <input className={styles.input} placeholder="Hero copy" value={heroCopy} onChange={(e) => setHeroCopy(e.target.value)} />
      </div>
      <div className={styles.buttonRow} style={{ marginTop: 8 }}>
        <button type="submit" className={styles.button} disabled={saving || !canSubmit}>
          {saving ? "Adding…" : "Add Solution"}
        </button>
      </div>
    </form>
  );
}

export default function SolutionsAdmin() {
  const { staffUser } = useAdminAuth();
  const isAdmin = staffUser?.role === "ADMIN";
  const [solutions, setSolutions] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");

  const load = () => {
    listSolutionsAdmin()
      .then(({ solutions: list }) => {
        setSolutions(list);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  };

  useEffect(load, []);

  return (
    <div className={tableStyles.page}>
      <div className={tableStyles.pageHeader}>
        <h1 className={tableStyles.pageTitle}>Solutions</h1>
      </div>

      {isAdmin ? <CreateForm onCreated={(s) => setSolutions((current) => [...current, { ...s, activeProductCount: 0, mappedProductCount: 0 }])} /> : null}

      <div className={tableStyles.tableWrap}>
        {loadStatus === "loading" ? (
          <p className={tableStyles.empty}>Loading…</p>
        ) : loadStatus === "error" ? (
          <p className={tableStyles.empty}>Couldn&rsquo;t load solutions.</p>
        ) : solutions.length === 0 ? (
          <p className={tableStyles.empty}>No solutions yet.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Status</th>
                <th>Active Products</th>
                <th>Featured on Home</th>
                <th>Sort Order</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {solutions.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.image ? (
                      <img src={s.image.url} alt={s.image.alt || s.name} width={40} height={40} style={{ objectFit: "cover", borderRadius: 4 }} />
                    ) : (
                      <span style={{ fontSize: 10, color: "#98a2b3" }}>None</span>
                    )}
                  </td>
                  <td>
                    <Link className={tableStyles.rowLink} to={`/admin/catalog/solutions/${s.id}`}>
                      {s.name}
                    </Link>
                    <br />
                    <span className={tableStyles.muted}>{s.slug}</span>
                  </td>
                  <td>{s.active ? "Active" : "Draft"}</td>
                  <td className={tableStyles.muted}>
                    {s.activeProductCount}
                    {s.activeProductCount === 0 ? (
                      <span style={{ marginLeft: 6, fontSize: 10, color: "#b42318", fontWeight: 600 }}>NO PRODUCTS</span>
                    ) : null}
                    {!s.image ? <span style={{ marginLeft: 6, fontSize: 10, color: "#92400e", fontWeight: 600 }}>NO IMAGE</span> : null}
                  </td>
                  <td className={tableStyles.muted}>{s.featuredOnHome ? "Yes" : "No"}</td>
                  <td className={tableStyles.muted}>{s.sortOrder}</td>
                  <td>
                    <Link className={tableStyles.actionLink} to={`/admin/catalog/solutions/${s.id}`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

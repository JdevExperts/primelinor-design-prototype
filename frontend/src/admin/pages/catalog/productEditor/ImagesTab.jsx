import { useState } from "react";
import { uploadProductAsset, createProductAssetFromUrl, updateProductAsset, deleteProductAsset } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";

const ASSET_TYPES = [
  "CATALOG",
  "GALLERY_FRONT",
  "GALLERY_BACK",
  "DETAIL",
  "CUSTOMIZATION_FRONT",
  "CUSTOMIZATION_BACK",
  "MODEL",
  "TEAM",
  "LIFESTYLE",
];

function AssetRow({ asset, colors, onChanged, onDeleted }) {
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState(null);

  const patch = async (fields) => {
    setSaving(true);
    setError(null);
    try {
      const { asset: updated } = await updateProductAsset(asset.productId, asset.id, fields);
      onChanged(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await deleteProductAsset(asset.productId, asset.id);
      onDeleted(asset.id);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className={styles.itemCard} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <img src={asset.url} alt={asset.alt || ""} width={64} height={64} style={{ objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
      <div style={{ display: "grid", gap: 6, flex: 1 }}>
        {error ? <p className={styles.errorMessage}>{error}</p> : null}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className={styles.select} style={{ width: 200 }} value={asset.type} onChange={(e) => patch({ type: e.target.value })} disabled={saving}>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            style={{ width: 140 }}
            value={asset.colorId || ""}
            onChange={(e) => patch({ colorId: e.target.value || null })}
            disabled={saving}
          >
            <option value="">No color</option>
            {colors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label style={{ fontSize: 12 }}>
            <input type="checkbox" checked={asset.active} onChange={(e) => patch({ active: e.target.checked })} disabled={saving} /> Active
          </label>
          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={asset.supportsArtworkOverlay}
              onChange={(e) => patch({ supportsArtworkOverlay: e.target.checked })}
              disabled={saving}
            />{" "}
            Supports artwork overlay
          </label>
        </div>
        <input
          className={styles.input}
          placeholder="Alt text"
          defaultValue={asset.alt || ""}
          onBlur={(e) => {
            if (e.target.value !== (asset.alt || "")) patch({ alt: e.target.value || null });
          }}
          disabled={saving}
        />
        <div style={{ fontSize: 11, color: "#6b7280" }}>
          {asset.isManagedUpload ? "Managed upload" : "External reference — never auto-deleted from storage"}
        </div>
      </div>
      <button type="button" className={styles.buttonDanger} onClick={handleDelete} disabled={saving}>
        {confirmingDelete ? "Confirm Delete?" : "Delete"}
      </button>
    </div>
  );
}

function AddByUrlForm({ productId, colors, onCreated }) {
  const [type, setType] = useState("CATALOG");
  const [colorId, setColorId] = useState("");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { asset } = await createProductAssetFromUrl(productId, { type, colorId: colorId || null, url: url.trim(), alt: alt.trim() || null });
      onCreated(asset);
      setUrl("");
      setAlt("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
      <div className={styles.cardTitle} style={{ fontSize: 12 }}>
        Add Existing Asset URL
      </div>
      <p style={{ fontSize: 11.5, color: "#6b7280" }}>
        For recreating the catalogue from already-live production images without re-uploading them. Only http/https
        URLs are accepted; this reference is never deleted from storage by this admin.
      </p>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select className={styles.select} style={{ width: 200 }} value={type} onChange={(e) => setType(e.target.value)}>
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select className={styles.select} style={{ width: 140 }} value={colorId} onChange={(e) => setColorId(e.target.value)}>
          <option value="">No color</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <input className={styles.input} placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} required />
      <input className={styles.input} placeholder="Alt text" value={alt} onChange={(e) => setAlt(e.target.value)} />
      <button type="submit" className={styles.buttonSecondary} disabled={saving || !url.trim()} style={{ width: "fit-content" }}>
        {saving ? "Adding…" : "Add Asset"}
      </button>
    </form>
  );
}

function UploadForm({ productId, colors, onCreated }) {
  const [type, setType] = useState("CATALOG");
  const [colorId, setColorId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { asset } = await uploadProductAsset(productId, file, { type, colorId: colorId || undefined });
      onCreated(asset);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div className={styles.cardTitle} style={{ fontSize: 12 }}>
        Upload Image
      </div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select className={styles.select} style={{ width: 200 }} value={type} onChange={(e) => setType(e.target.value)}>
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select className={styles.select} style={{ width: 140 }} value={colorId} onChange={(e) => setColorId(e.target.value)}>
          <option value="">No color</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} disabled={uploading} />
      </div>
      {uploading ? <p style={{ fontSize: 12 }}>Uploading…</p> : null}
      <p style={{ fontSize: 11, color: "#6b7280" }}>PNG, JPG or WEBP, up to 8 MB.</p>
    </div>
  );
}

export default function ImagesTab({ product, colors, onSaved }) {
  const assets = (product.assets || []).map((a) => ({ ...a, productId: product.id }));

  const handleChanged = (updatedAsset) => {
    onSaved({ ...product, assets: assets.map((a) => (a.id === updatedAsset.id ? { ...updatedAsset, productId: product.id } : a)) });
  };
  const handleCreated = (newAsset) => {
    onSaved({ ...product, assets: [...assets, { ...newAsset, productId: product.id }] });
  };
  const handleDeleted = (assetId) => {
    onSaved({ ...product, assets: assets.filter((a) => a.id !== assetId) });
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Images ({assets.length})</div>
        {assets.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#6b7280" }}>No images yet — upload one or add an existing URL below.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {assets.map((asset) => (
              <AssetRow key={asset.id} asset={asset} colors={colors} onChanged={handleChanged} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.card}>
        <UploadForm productId={product.id} colors={colors} onCreated={handleCreated} />
      </div>
      <div className={styles.card}>
        <AddByUrlForm productId={product.id} colors={colors} onCreated={handleCreated} />
      </div>
    </div>
  );
}

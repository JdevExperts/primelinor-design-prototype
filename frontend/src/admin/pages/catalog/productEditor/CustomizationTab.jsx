import { useMemo, useRef, useState } from "react";
import { createPlacementZone, updatePlacementZone, deletePlacementZone } from "../../../api/catalog";
import styles from "../../../components/adminDetail.module.css";

let keySeq = 0;
function newKey() {
  keySeq += 1;
  return `zone-${keySeq}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function zonesFromProduct(product) {
  return (product.placementZones || []).map((z) => ({ ...z, key: newKey(), isNew: false }));
}

/**
 * Placement zone visual editor — Phase 5 §35-38. Rectangles are positioned
 * `left: cx%, top: cy%, width: width%, height: height%` — the SAME
 * coordinate model the customer-facing Studio already uses
 * (CustomizationPreview.jsx), so a zone calibrated here previews correctly
 * once Studio reads real backend zones (Phase 5 §51).
 */
function ZonePreview({ imageUrl, zones, selectedKey, onSelect, onDrag }) {
  const stageRef = useRef(null);
  const dragState = useRef(null);

  const startDrag = (event, zone, mode) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(zone.key);
    const rect = stageRef.current.getBoundingClientRect();
    dragState.current = { key: zone.key, mode, rect, startX: event.clientX, startY: event.clientY, zone: { ...zone } };

    const handleMove = (moveEvent) => {
      const { rect: r, mode: m, zone: z } = dragState.current;
      const dxPct = ((moveEvent.clientX - dragState.current.startX) / r.width) * 100;
      const dyPct = ((moveEvent.clientY - dragState.current.startY) / r.height) * 100;
      if (m === "move") {
        onDrag(dragState.current.key, {
          cx: clamp(Number(z.cx) + dxPct, 0, 100 - Number(z.width)),
          cy: clamp(Number(z.cy) + dyPct, 0, 100 - Number(z.height)),
        });
      } else {
        onDrag(dragState.current.key, {
          width: clamp(Number(z.width) + dxPct, 2, 100 - Number(z.cx)),
          height: clamp(Number(z.height) + dyPct, 2, 100 - Number(z.cy)),
        });
      }
    };
    const handleUp = () => {
      dragState.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  return (
    <div
      ref={stageRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        aspectRatio: "1 / 1",
        background: "#f0f1f4 url(" + JSON.stringify(imageUrl || "") + ") center/contain no-repeat",
        borderRadius: 8,
        border: "1px solid var(--color-border, #e5e7eb)",
        overflow: "hidden",
      }}
    >
      {!imageUrl ? (
        <p style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#6b7280", padding: 12, textAlign: "center" }}>
          Upload or select a customization image on the Images tab to calibrate zones visually. You can still add
          zones numerically below.
        </p>
      ) : null}
      {zones.map((zone) => (
        <div
          key={zone.key}
          onMouseDown={(e) => startDrag(e, zone, "move")}
          style={{
            position: "absolute",
            left: `${zone.cx}%`,
            top: `${zone.cy}%`,
            width: `${zone.width}%`,
            height: `${zone.height}%`,
            border: `2px solid ${zone.key === selectedKey ? "#0f1b2d" : "rgba(15,27,45,0.5)"}`,
            background: zone.key === selectedKey ? "rgba(15,27,45,0.12)" : "rgba(15,27,45,0.04)",
            cursor: "move",
          }}
        >
          <span style={{ position: "absolute", top: -18, left: 0, fontSize: 10, fontWeight: 700, color: "#0f1b2d", whiteSpace: "nowrap" }}>
            {zone.label || "Untitled"}
          </span>
          <div
            onMouseDown={(e) => startDrag(e, zone, "resize")}
            style={{ position: "absolute", right: -4, bottom: -4, width: 10, height: 10, background: "#0f1b2d", borderRadius: 2, cursor: "nwse-resize" }}
          />
        </div>
      ))}
    </div>
  );
}

function ZoneCard({ zone, onChange, onSave, onDelete, colors }) {
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (event) => onChange(zone.key, { [key]: event.target.value });
  const setNum = (key) => (event) => onChange(zone.key, { [key]: event.target.value === "" ? "" : Number(event.target.value) });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(zone);
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
      await onDelete(zone);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className={styles.itemCard}>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select className={styles.select} style={{ width: 100 }} value={zone.view} onChange={set("view")}>
          <option value="FRONT">Front</option>
          <option value="BACK">Back</option>
        </select>
        <input className={styles.input} style={{ width: 140 }} placeholder="Label (Left Chest)" value={zone.label} onChange={set("label")} />
        <input
          className={styles.input}
          style={{ width: 160 }}
          placeholder="Key (front-left-chest)"
          value={zone.placementKey}
          onChange={(e) => onChange(zone.key, { placementKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })}
        />
        <select className={styles.select} style={{ width: 130 }} value={zone.colorId || ""} onChange={(e) => onChange(zone.key, { colorId: e.target.value || null })}>
          <option value="">Any color</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label style={{ fontSize: 11 }}>
          cx <input className={styles.input} style={{ width: 70 }} type="number" step="0.1" value={zone.cx} onChange={setNum("cx")} />
        </label>
        <label style={{ fontSize: 11 }}>
          cy <input className={styles.input} style={{ width: 70 }} type="number" step="0.1" value={zone.cy} onChange={setNum("cy")} />
        </label>
        <label style={{ fontSize: 11 }}>
          width <input className={styles.input} style={{ width: 70 }} type="number" step="0.1" value={zone.width} onChange={setNum("width")} />
        </label>
        <label style={{ fontSize: 11 }}>
          height <input className={styles.input} style={{ width: 70 }} type="number" step="0.1" value={zone.height} onChange={setNum("height")} />
        </label>
        <label style={{ fontSize: 12 }}>
          <input type="checkbox" checked={zone.active} onChange={(e) => onChange(zone.key, { active: e.target.checked })} /> Active
        </label>
      </div>
      <div className={styles.buttonRow}>
        <button type="button" className={styles.button} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : zone.isNew ? "Create Zone" : "Save"}
        </button>
        <button type="button" className={styles.buttonDanger} onClick={handleDelete} disabled={saving}>
          {confirmingDelete ? "Confirm Delete?" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default function CustomizationTab({ product, colors, onSaved }) {
  const [zones, setZones] = useState(() => zonesFromProduct(product));
  const [view, setView] = useState("FRONT");
  const [selectedKey, setSelectedKey] = useState(null);

  const customizationAssets = (product.assets || []).filter((a) => a.type === "CUSTOMIZATION_FRONT" || a.type === "CUSTOMIZATION_BACK");
  const previewAsset = useMemo(() => {
    const wantType = view === "FRONT" ? "CUSTOMIZATION_FRONT" : "CUSTOMIZATION_BACK";
    return customizationAssets.find((a) => a.type === wantType) || null;
  }, [customizationAssets, view]);

  const visibleZones = zones.filter((z) => z.view === view);

  const updateZone = (key, patch) => {
    setZones((current) => current.map((z) => (z.key === key ? { ...z, ...patch } : z)));
  };

  const addZone = () => {
    const key = newKey();
    setZones((current) => [
      ...current,
      { key, isNew: true, view, placementKey: "", label: "", cx: 40, cy: 40, width: 15, height: 15, colorId: null, assetId: previewAsset?.id || null, active: true, sortOrder: current.length },
    ]);
    setSelectedKey(key);
  };

  /** Applies the server's saved zone to local state, then reports the plain (server-shape) list up to ProductEditor via the fresh post-update state — not the stale outer closure. */
  const applyServerResult = (localKey, serverZone) => {
    setZones((current) => {
      const next = current.map((z) => (z.key === localKey ? { ...serverZone, key: localKey, isNew: false } : z));
      onSaved({ ...product, placementZones: next.map(({ key: _key, isNew: _isNew, ...rest }) => rest) });
      return next;
    });
  };

  const saveZone = async (zone) => {
    const payload = {
      view: zone.view,
      placementKey: zone.placementKey.trim(),
      label: zone.label.trim(),
      cx: Number(zone.cx),
      cy: Number(zone.cy),
      width: Number(zone.width),
      height: Number(zone.height),
      colorId: zone.colorId || null,
      assetId: zone.assetId || null,
      active: zone.active,
      sortOrder: zone.sortOrder ?? 0,
    };
    if (zone.isNew) {
      const { placementZone } = await createPlacementZone(product.id, payload);
      applyServerResult(zone.key, placementZone);
    } else {
      const { placementZone } = await updatePlacementZone(product.id, zone.id, payload);
      applyServerResult(zone.key, placementZone);
    }
  };

  const deleteZone = async (zone) => {
    if (!zone.isNew) {
      await deletePlacementZone(product.id, zone.id);
    }
    setZones((current) => {
      const next = current.filter((z) => z.key !== zone.key);
      onSaved({ ...product, placementZones: next.map(({ key: _key, isNew: _isNew, ...rest }) => rest) });
      return next;
    });
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {product.customizable && customizationAssets.length === 0 ? (
        <p className={styles.errorMessage} style={{ background: "#fef3c7", color: "#92400e" }}>
          This product is marked Customizable but has no CUSTOMIZATION_FRONT/BACK image yet — add one on the Images
          tab so customers see Try Your Logo correctly.
        </p>
      ) : null}

      <div className={styles.card}>
        <div className={styles.cardTitle}>Placement Zones — {view === "FRONT" ? "Front" : "Back"}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className={view === "FRONT" ? styles.button : styles.buttonSecondary} onClick={() => setView("FRONT")}>
            Front
          </button>
          <button type="button" className={view === "BACK" ? styles.button : styles.buttonSecondary} onClick={() => setView("BACK")}>
            Back
          </button>
        </div>
        <ZonePreview imageUrl={previewAsset?.url} zones={visibleZones} selectedKey={selectedKey} onSelect={setSelectedKey} onDrag={updateZone} />
        <p style={{ fontSize: 11, color: "#6b7280" }}>Drag a zone to move it, drag its corner handle to resize — or edit the numbers below.</p>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {visibleZones.map((zone) => (
          <ZoneCard key={zone.key} zone={zone} onChange={updateZone} onSave={saveZone} onDelete={deleteZone} colors={colors} />
        ))}
      </div>
      <button type="button" className={styles.buttonSecondary} onClick={addZone} style={{ width: "fit-content" }}>
        + Add Zone
      </button>
    </div>
  );
}

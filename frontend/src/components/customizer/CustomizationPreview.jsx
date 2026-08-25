import { useState } from "react";
import GarmentMockup from "./GarmentMockup";
import { printPlacements } from "../../data/mockData";
import { isLight } from "../../utils/color";
import styles from "./CustomizationPreview.module.css";

function ZoneMark({ zone, logo, emptyLabel, altLabel, hideEmpty }) {
  if (!zone) return null;
  if (!logo && hideEmpty) return null;

  return (
    <span
      className={`${styles.zone} ${logo ? styles.zoneFilled : ""}`}
      style={{
        left: `${zone.cx}%`,
        top: `${zone.cy}%`,
        width: `${zone.w}%`,
        height: `${zone.h}%`,
      }}
    >
      {logo ? (
        <img className={styles.logo} src={logo.url} alt={altLabel} />
      ) : (
        <span className={styles.zoneLabel}>{emptyLabel}</span>
      )}
    </span>
  );
}

/**
 * Three stacked layers sharing one coordinate space:
 *
 *   1. mockup layer      — product photo, or GarmentMockup SVG as fallback
 *   2. print-zone layer  — the active zone for this side
 *   3. logo layer        — artwork contained inside the active zone
 */
export default function CustomizationPreview({
  product,
  colorHex,
  colorLabel,
  placementKey,
  logo,
  emptyLabel = "Logo",
  photo = null,
  zone: zoneOverride = null,
  zones: zonesOverride = null,
  hideEmptyZone = false,
  view: viewOverride = null,
  blankMessage = null,
  priority = false,
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const view = viewOverride || printPlacements[placementKey]?.view || "front";
  const pale = isLight(colorHex);
  const zone = zoneOverride || product.zones?.[placementKey];
  const label = printPlacements[placementKey]?.label || "";
  const usePhoto = Boolean(photo?.src) && !photoFailed;
  const zoneList = zonesOverride || (zone ? [zone] : []);
  const altLabel = `Artwork previewed on the ${label.toLowerCase()}`;

  const overlay = (
    <>
      {zoneList.map((item, index) => (
        <ZoneMark
          key={`${item.cx}-${item.cy}-${index}`}
          zone={item}
          logo={logo}
          emptyLabel={emptyLabel}
          altLabel={altLabel}
          hideEmpty={hideEmptyZone}
        />
      ))}
      {!zoneList.length && blankMessage ? (
        <span className={styles.blankNote}>{blankMessage}</span>
      ) : null}
    </>
  );

  if (usePhoto) {
    return (
      <div className={`${styles.stage} ${styles.photoStage}`}>
        <div className={styles.photoFrame}>
          <img
            className={styles.photo}
            src={photo.src}
            alt={photo.alt || `${colorLabel} ${product.name}, ${view} view`}
            onError={() => setPhotoFailed(true)}
            fetchPriority={priority ? "high" : "low"}
            decoding="async"
          />
          <div className={styles.photoOverlay}>{overlay}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.stage} ${pale ? styles.paleProduct : ""}`}>
      <GarmentMockup
        mockup={product.mockup}
        color={colorHex}
        view={view}
        label={`${colorLabel} ${product.name}, ${view} view`}
      >
        {overlay}
      </GarmentMockup>
    </div>
  );
}

import { useState } from "react";
import CustomizationPreview from "./CustomizationPreview";
import {
  hasPreviewKind,
  resolveLifestyle,
  resolveModelPlacementZone,
  resolvePlacementZone,
  resolveProductPhoto,
  resolveTeamPlacementZones,
  studioGalleryItems,
  studioPlacementLabel,
} from "../../utils/studioAssets";
import styles from "./StudioStage.module.css";

function PlacementZoom({ photo, zone, logo, label }) {
  if (!photo?.src || !zone) return null;

  const span = Math.max(zone.w, zone.h, 4);
  const zoom = Math.min(6.5, Math.max(3.2, 32 / span));

  return (
    <figure className={styles.zoom}>
      <div className={styles.zoomClip}>
        <img
          className={styles.zoomPhoto}
          src={photo.src}
          alt=""
          style={{
            width: `${zoom * 100}%`,
            height: `${zoom * 100}%`,
            left: `${50 - zone.cx * zoom}%`,
            top: `${50 - zone.cy * zoom}%`,
          }}
        />
        <span
          className={`${styles.zoomMark} ${logo ? styles.zoomMarkOn : ""}`}
          style={{
            width: `${Math.min(46, zone.w * zoom)}%`,
            height: `${Math.min(46, zone.h * zoom)}%`,
          }}
        >
          {logo ? (
            <img src={logo.url} alt="" />
          ) : (
            <span className={styles.zoomLabel}>Artwork</span>
          )}
        </span>
      </div>
      <figcaption className={styles.zoomCaption}>{label}</figcaption>
    </figure>
  );
}

function ThumbButton({ item, selected, onSelect }) {
  const [broken, setBroken] = useState(false);
  const [brokenBack, setBrokenBack] = useState(false);
  const showPhoto = item.src && !broken;
  const showBack = item.srcBack && !brokenBack;

  return (
    <button
      type="button"
      className={`${styles.thumb} ${selected ? styles.thumbOn : ""}`}
      aria-pressed={selected}
      aria-label={`${item.label} view`}
      onClick={onSelect}
    >
      {item.split ? (
        <span className={styles.thumbSplit}>
          {showPhoto ? (
            <img
              src={item.src}
              alt=""
              loading="lazy"
              onError={() => setBroken(true)}
            />
          ) : (
            <span className={styles.thumbFallback}>F</span>
          )}
          {showBack ? (
            <img
              src={item.srcBack}
              alt=""
              loading="lazy"
              onError={() => setBrokenBack(true)}
            />
          ) : (
            <span className={styles.thumbFallback}>B</span>
          )}
        </span>
      ) : showPhoto ? (
        <img
          className={
            item.previewKind === "model" || item.previewKind === "lifestyle"
              ? styles.thumbLife
              : undefined
          }
          src={item.src}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className={styles.thumbFallback}>{item.label[0]}</span>
      )}
      <span className={styles.thumbLabel}>{item.label}</span>
    </button>
  );
}

function ProductPane({
  preview,
  color,
  colorKey,
  assets,
  side,
  placementKey,
  artwork,
  emptyLabel,
  hideZone = false,
  priority,
  caption,
}) {
  const photo = resolveProductPhoto(
    assets,
    colorKey,
    side === "back" ? "productBack" : "productFront",
  );
  const zone = resolvePlacementZone({
    assets,
    colorKey,
    side: side === "back" ? "productBack" : "productFront",
    placementKey,
    vectorZones: preview.zones,
    usingPhoto: Boolean(photo?.src),
  });

  return (
    <div className={styles.pane}>
      <CustomizationPreview
        key={`${colorKey}-${photo?.src || "vector"}-${side}`}
        product={preview}
        colorHex={color.hex}
        colorLabel={color.label}
        placementKey={placementKey}
        logo={artwork}
        emptyLabel={emptyLabel}
        photo={photo}
        zone={hideZone ? null : zone}
        view={side}
        priority={priority}
      />
      {caption ? <p className={styles.paneCaption}>{caption}</p> : null}
    </div>
  );
}

export default function StudioStage({
  listing,
  preview,
  assets,
  color,
  colorKey,
  previewKind,
  productView,
  onPreviewKind,
  onProductView,
  frontDesign,
  backDesign,
  supportsBackPrint,
}) {
  const gallery = studioGalleryItems(assets, colorKey, {
    hasBack: supportsBackPrint,
  });
  const lifestyle =
    resolveLifestyle(assets, colorKey, "team") ||
    resolveLifestyle(assets, colorKey, "lifestyle");
  const model = resolveLifestyle(assets, colorKey, "model");
  const modelZone = resolveModelPlacementZone(
    assets,
    colorKey,
    frontDesign.placement,
  );
  const teamZones = resolveTeamPlacementZones(
    assets,
    colorKey,
    frontDesign.placement,
  );
  const overlayModel = Boolean(model && modelZone);
  const overlayTeam = Boolean(lifestyle?.type === "team" && teamZones);
  const frontPhoto = resolveProductPhoto(assets, colorKey, "productFront");
  const backPhoto = resolveProductPhoto(assets, colorKey, "productBack");
  const frontZone = resolvePlacementZone({
    assets,
    colorKey,
    side: "productFront",
    placementKey: frontDesign.placement,
    vectorZones: preview.zones,
    usingPhoto: Boolean(frontPhoto?.src),
  });
  const backZone = resolvePlacementZone({
    assets,
    colorKey,
    side: "productBack",
    placementKey: backDesign.placement,
    vectorZones: preview.zones,
    usingPhoto: Boolean(backPhoto?.src),
  });

  const frontLabel = studioPlacementLabel(frontDesign.placement);
  const backLabel = studioPlacementLabel(backDesign.placement);

  const status = (() => {
    if (previewKind === "model") {
      return overlayModel ? `Model · ${frontLabel}` : "Model Preview";
    }
    if (previewKind === "lifestyle") {
      if (lifestyle?.type === "team") {
        return overlayTeam ? `Team · ${frontLabel}` : "Team Preview";
      }
      return "Lifestyle Preview";
    }
    if (productView === "both") return "Front + Back";
    if (productView === "back") {
      return backDesign.enabled ? `Back · ${backLabel}` : "Back";
    }
    return `Front · ${frontLabel}`;
  })();

  const selectedThumb = (() => {
    if (previewKind === "model") return "model";
    if (previewKind === "lifestyle") return lifestyle?.id || "team";
    if (productView === "both") return "both";
    return productView === "back" ? "back" : "front";
  })();

  const lifeBadge =
    previewKind === "lifestyle" && !overlayTeam
      ? lifestyle?.type === "team"
        ? "Team Preview"
        : "Lifestyle Preview"
      : previewKind === "model" && !overlayModel
        ? "Model Preview"
        : null;

  const activeKind =
    previewKind === "model" && hasPreviewKind(assets, colorKey, "model")
      ? "model"
      : previewKind === "lifestyle" && hasPreviewKind(assets, colorKey, "lifestyle")
        ? "lifestyle"
        : "product";

  return (
    <div className={styles.stageWrap}>
      <div
        className={`${styles.previewStage} ${
          activeKind === "product" && productView === "both"
            ? styles.previewBoth
            : activeKind === "lifestyle"
              ? styles.previewWide
              : styles.previewPortrait
        }`}
      >
        {activeKind === "model" && model ? (
          <CustomizationPreview
            key={model.src}
            product={preview}
            colorHex={color.hex}
            colorLabel={color.label}
            placementKey={frontDesign.placement}
            logo={frontDesign.artwork}
            emptyLabel="Artwork"
            photo={{
              src: model.src,
              alt: model.alt,
              aspectRatio: model.aspectRatio,
            }}
            zone={modelZone}
            view="front"
            priority
          />
        ) : activeKind === "lifestyle" && lifestyle && overlayTeam ? (
          <CustomizationPreview
            key={lifestyle.src}
            product={preview}
            colorHex={color.hex}
            colorLabel={color.label}
            placementKey={frontDesign.placement}
            logo={frontDesign.artwork}
            photo={{
              src: lifestyle.src,
              alt: lifestyle.alt,
              aspectRatio: lifestyle.aspectRatio,
            }}
            emptyLabel="Artwork"
            zones={teamZones}
            view="front"
            priority
          />
        ) : activeKind === "lifestyle" && lifestyle ? (
          <img
            className={styles.lifeImage}
            src={lifestyle.src}
            alt={lifestyle.alt}
            loading="lazy"
          />
        ) : productView === "both" ? (
          <div className={styles.bothGrid}>
            <ProductPane
              preview={preview}
              color={color}
              colorKey={colorKey}
              assets={assets}
              side="front"
              placementKey={frontDesign.placement}
              artwork={frontDesign.artwork}
              emptyLabel="Artwork"
              caption="Front"
              priority
            />
            <ProductPane
              preview={preview}
              color={color}
              colorKey={colorKey}
              assets={assets}
              side="back"
              placementKey={backDesign.placement}
              artwork={backDesign.enabled ? backDesign.artwork : null}
              emptyLabel="Artwork"
              caption="Back"
            />
            <div className={styles.zoomCol}>
              <PlacementZoom
                photo={frontPhoto}
                zone={frontZone}
                logo={frontDesign.artwork}
                label={`Front · ${frontLabel}`}
              />
              <PlacementZoom
                photo={backPhoto}
                zone={backZone}
                logo={backDesign.enabled ? backDesign.artwork : null}
                label={backDesign.enabled ? `Back · ${backLabel}` : "Back"}
              />
            </div>
          </div>
        ) : productView === "back" ? (
          <ProductPane
            preview={preview}
            color={color}
            colorKey={colorKey}
            assets={assets}
            side="back"
            placementKey={backDesign.placement}
            artwork={backDesign.enabled ? backDesign.artwork : null}
            emptyLabel="Artwork"
            hideZone={!backDesign.enabled}
            priority
          />
        ) : (
          <ProductPane
            preview={preview}
            color={color}
            colorKey={colorKey}
            assets={assets}
            side="front"
            placementKey={frontDesign.placement}
            artwork={frontDesign.artwork}
            emptyLabel="Artwork"
            priority
          />
        )}
        {lifeBadge ? <p className={styles.lifeBadge}>{lifeBadge}</p> : null}
      </div>

      <p className={styles.orientation} aria-live="polite">
        {status}
      </p>
      <p className={styles.disclaimer}>
        Preview is indicative. Final artwork placement will be confirmed before
        production.
      </p>

      <ul className={styles.thumbs} aria-label={`${listing.name} views`}>
        {gallery.map((item) => (
            <li key={`${item.id}-${item.src || "none"}-${item.srcBack || ""}`}>
              <ThumbButton
              item={item}
              selected={item.id === selectedThumb}
              onSelect={() => {
                if (item.previewKind === "product") {
                  onPreviewKind("product");
                  onProductView(item.productView);
                } else {
                  onPreviewKind(item.previewKind);
                }
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

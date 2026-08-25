import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import CustomizationPreview from "../customizer/CustomizationPreview";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import {
  customizableProducts,
  printPlacements,
  productColors,
  viewLabels,
} from "../../data/mockData";
import { demoProductToCatalogue } from "../../utils/studio";
import styles from "./TryYourLogo.module.css";

/**
 * Homepage demo only — placement is previewed, not edited. The primary
 * CTA opens the full customization studio for the selected product.
 *
 * Everything positional lives in mockData (print zones) and the customizer
 * components; this file only manages selection state and the controls.
 */
export default function TryYourLogo() {
  const [productId, setProductId] = useState(customizableProducts[0].id);
  const [colorKey, setColorKey] = useState(customizableProducts[0].colors[0]);
  const [placementKey, setPlacementKey] = useState(
    Object.keys(customizableProducts[0].zones)[0]
  );
  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);

  const product =
    customizableProducts.find((item) => item.id === productId) ||
    customizableProducts[0];
  const color = productColors[colorKey];
  const placements = Object.keys(product.zones);
  const placement = printPlacements[placementKey];

  useEffect(() => {
    return () => {
      if (logo?.url) URL.revokeObjectURL(logo.url);
    };
  }, [logo]);

  const handleProductChange = (nextId) => {
    const next = customizableProducts.find((item) => item.id === nextId);
    setProductId(nextId);
    if (!next.colors.includes(colorKey)) setColorKey(next.colors[0]);
    if (!next.zones[placementKey]) setPlacementKey(Object.keys(next.zones)[0]);
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (logo?.url) URL.revokeObjectURL(logo.url);
    setLogo({ url: URL.createObjectURL(file), name: file.name });
  };

  const clearLogo = () => {
    if (logo?.url) URL.revokeObjectURL(logo.url);
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Section
      id="try-your-logo"
      tone="studio"
      ariaLabelledBy="try-logo-title"
    >
      <SectionHeader
        titleId="try-logo-title"
        eyebrow="Try your logo"
        title="See your brand before you order"
        description="Upload your logo and preview how your branding could look on popular products."
      />

      <div className={styles.layout}>
        <div className={styles.previewPanel}>
          <div className={styles.previewStage}>
            <CustomizationPreview
              product={product}
              colorHex={color.hex}
              colorLabel={color.label}
              placementKey={placementKey}
              logo={logo}
            />
          </div>

          <div className={styles.previewCaption}>
            <p className={styles.previewTitle}>
              {color.label} {product.name}
            </p>
            <p className={styles.previewMeta}>
              <span className={styles.previewBadge}>
                {viewLabels[placement.view]} · {placement.label}
              </span>
              <span className={styles.previewNote}>
                Illustrative preview — artwork is confirmed with you before
                production.
              </span>
            </p>
          </div>
        </div>

        <div className={styles.controls}>
          <fieldset className={styles.field}>
            <legend className={styles.legend}>
              <span className={styles.step}>1</span> Choose product
            </legend>
            <div className={styles.chips}>
              {customizableProducts.map((item) => (
                <label
                  key={item.id}
                  className={`${styles.chip} ${
                    item.id === productId ? styles.chipActive : ""
                  }`}
                >
                  <input
                    className={styles.srInput}
                    type="radio"
                    name="try-logo-product"
                    value={item.id}
                    checked={item.id === productId}
                    onChange={() => handleProductChange(item.id)}
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend className={styles.legend}>
              <span className={styles.step}>2</span> Product colour
            </legend>
            <div className={styles.swatches}>
              {product.colors.map((key) => {
                const swatch = productColors[key];
                return (
                  <label
                    key={key}
                    className={`${styles.swatch} ${
                      key === colorKey ? styles.swatchActive : ""
                    }`}
                    title={swatch.label}
                  >
                    <input
                      className={styles.srInput}
                      type="radio"
                      name="try-logo-colour"
                      value={key}
                      checked={key === colorKey}
                      onChange={() => setColorKey(key)}
                    />
                    <span
                      className={styles.swatchDot}
                      style={{ backgroundColor: swatch.hex }}
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">{swatch.label}</span>
                  </label>
                );
              })}
              <span className={styles.swatchLabel}>{color.label}</span>
            </div>
          </fieldset>

          <div className={styles.field}>
            <p className={styles.legend}>
              <span className={styles.step}>3</span> Upload logo
            </p>
            {logo ? (
              <div className={styles.fileChip}>
                <Icon name="check" size={16} className={styles.fileIcon} />
                <span className={styles.fileName}>{logo.name}</span>
                <button
                  type="button"
                  className={styles.fileRemove}
                  onClick={clearLogo}
                >
                  <Icon name="close" size={16} />
                  <span className="visually-hidden">Remove uploaded logo</span>
                </button>
              </div>
            ) : (
              <label className={styles.dropzone}>
                <input
                  ref={fileInputRef}
                  className={styles.srInput}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleFile}
                />
                <Icon name="upload" size={20} className={styles.dropIcon} />
                <span className={styles.dropTitle}>
                  Upload PNG, JPG or SVG
                </span>
                <span className={styles.dropHint}>
                  Stays in your browser — nothing is sent anywhere.
                </span>
              </label>
            )}
          </div>

          <fieldset className={styles.field}>
            <legend className={styles.legend}>
              <span className={styles.step}>4</span> Logo placement
            </legend>
            <div className={styles.chips}>
              {placements.map((key) => (
                <label
                  key={key}
                  className={`${styles.chip} ${
                    key === placementKey ? styles.chipActive : ""
                  }`}
                >
                  <input
                    className={styles.srInput}
                    type="radio"
                    name="try-logo-placement"
                    value={key}
                    checked={key === placementKey}
                    onChange={() => setPlacementKey(key)}
                  />
                  {printPlacements[key].label}
                </label>
              ))}
            </div>
            <p className={styles.fieldHint}>
              Named from the wearer&rsquo;s perspective, so their left appears
              on the right of a front view. Back placements switch the preview
              to a back view.
            </p>
          </fieldset>

          <div className={styles.actions}>
            <Button
              as={Link}
              to={`/customize/${demoProductToCatalogue[productId] || "cotton-round-neck"}`}
              variant="accent"
              size="lg"
              icon="upload"
              fullWidth
            >
              Try Your Logo
            </Button>
            <p className={styles.actionsNote}>
              Also available for bottles, notebooks, caps and gift kits.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

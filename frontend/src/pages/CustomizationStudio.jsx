import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StudioStage from "../components/customizer/StudioStage";
import Dialog from "../components/product/Dialog";
import ProductStickyCta from "../components/product/ProductStickyCta";
import QuoteModal from "../components/product/QuoteModal";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import Seo from "../components/layout/Seo";
import { getPublicConfig } from "../api/config";
import { submitRfq } from "../api/rfqs";
import { uploadArtwork } from "../api/uploads";
import { productColors } from "../data/mockData";
import { buildStudioWhatsAppMessage, buildWhatsAppUrl } from "../utils/whatsapp";
import { validateArtworkFile } from "../utils/artworkValidation";
import { formatInr, pluralUnit, quoteForQuantity } from "../utils/pricing";
import { visibleQuickQuantities } from "../utils/productDetail";
import {
  demoProductToCatalogue,
  resolveStudioSetup,
  studioSwitchProducts,
} from "../utils/studio";
import { buildRealStudioSetup, DEFAULT_COLOR_KEY, fetchCustomizableProducts, fetchStudioProduct } from "../utils/studioReal";
import { hasPreviewKind, studioPlacementLabel } from "../utils/studioAssets";
import styles from "./CustomizationStudio.module.css";

function StudioLoading() {
  useEffect(() => {
    document.title = "Loading — PrimeLinor";
  }, []);

  return (
    <main id="main" className={styles.page}>
      <div className={`container ${styles.missing}`}>
        <p className="eyebrow">Try Your Logo</p>
        <h1 className={styles.missingTitle}>Loading…</h1>
      </div>
    </main>
  );
}

function Unavailable({ listing, productId }) {
  useEffect(() => {
    document.title = "Logo preview — PrimeLinor";
  }, []);

  return (
    <main id="main" className={styles.page}>
      <div className={`container ${styles.missing}`}>
        <p className="eyebrow">Try Your Logo</p>
        <h1 className={styles.missingTitle}>
          This product is not available for logo preview.
        </h1>
        <p className={styles.missingCopy}>
          V1 previews branding on T-shirts, polo T-shirts, hoodies and tote
          bags.
          {listing
            ? ` ${listing.name} can still be quoted from its product page.`
            : ""}
        </p>
        <div className={styles.missingActions}>
          {listing ? (
            <Button as={Link} to={`/products/${listing.id}`} variant="primary" size="md">
              View Product
            </Button>
          ) : null}
          <Button as={Link} to="/products" variant="secondary" size="md">
            Browse Products
          </Button>
        </div>
        {!listing && productId ? (
          <p className={styles.missingMeta}>
            Requested: <code>{productId}</code>
          </p>
        ) : null}
      </div>
    </main>
  );
}

function ArtworkUpload({ id, title, file, error, onFile, onClear }) {
  const inputRef = useRef(null);
  const replaceRef = useRef(null);

  return (
    <div className={styles.field}>
      <p className={styles.subLegend} id={id}>
        {title}
      </p>
      {error ? (
        <p className={styles.fileError} role="alert">
          {error}
        </p>
      ) : null}
      {file ? (
        <div className={styles.fileRow}>
          <div className={styles.fileChip}>
            <Icon name={file.uploading ? "upload" : "check"} size={16} className={styles.fileIcon} />
            <span className={styles.fileName}>
              {file.name}
              {file.uploading ? " · Uploading…" : ""}
            </span>
          </div>
          <div className={styles.fileActions}>
            <label className={styles.textBtn}>
              Replace artwork
              <input
                ref={replaceRef}
                className={styles.sr}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg"
                aria-labelledby={id}
                onChange={(event) => {
                  onFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              className={styles.textBtn}
              onClick={() => {
                onClear();
                if (inputRef.current) inputRef.current.value = "";
                if (replaceRef.current) replaceRef.current.value = "";
              }}
            >
              Remove artwork
            </button>
          </div>
        </div>
      ) : (
        <label className={styles.dropzone}>
          <input
            ref={inputRef}
            className={styles.sr}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg"
            aria-labelledby={id}
            onChange={(event) => onFile(event.target.files?.[0])}
          />
          <Icon name="upload" size={20} className={styles.dropIcon} />
          <span className={styles.dropTitle}>Upload PNG, JPG or SVG</span>
          <span className={styles.dropHint}>
            Uploaded securely — only used to prepare your quote.
          </span>
        </label>
      )}
    </div>
  );
}

function StudioView({
  setup,
  artwork,
  artworkErrors,
  onFrontFile,
  onBackFile,
  onClearFront,
  onClearBack,
}) {
  const navigate = useNavigate();
  const {
    listing,
    preview,
    colors,
    assets,
    frontPlacements,
    backPlacements,
    supportsBackPrint,
  } = setup;

  const [colorKey, setColorKey] = useState(colors[0]);
  const [frontPlacement, setFrontPlacement] = useState(frontPlacements[0]);
  const [backPlacement, setBackPlacement] = useState(
    backPlacements.includes("back-center")
      ? "back-center"
      : backPlacements[0] || "back-center",
  );
  const [backEnabled, setBackEnabled] = useState(false);
  const [previewKind, setPreviewKind] = useState("product");
  const [productView, setProductView] = useState("front");
  const [quantity, setQuantity] = useState(listing.moq);
  const [qtyDraft, setQtyDraft] = useState(String(listing.moq));
  const [moqHint, setMoqHint] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [waUrl, setWaUrl] = useState(null);
  const [waChecked, setWaChecked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [realSwitcher, setRealSwitcher] = useState(null);

  useEffect(() => {
    document.title = `Try Your Logo — ${listing.name}`;
  }, [listing.name]);

  useEffect(() => {
    let cancelled = false;
    fetchCustomizableProducts().then((list) => {
      if (!cancelled && list.length) setRealSwitcher(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const colorMeta = setup.colorMeta || productColors;
  const color = colorMeta[colorKey] || productColors[colorKey] || productColors.white;

  useEffect(() => {
    if (!waOpen) return;
    setWaChecked(false);
    getPublicConfig()
      .then((cfg) => {
        setWaUrl(
          cfg.whatsappEnabled
            ? buildWhatsAppUrl(
                cfg.whatsappNumber,
                buildStudioWhatsAppMessage(
                  listing.name,
                  color.label,
                  quantity,
                  pluralUnit(listing.unit, quantity),
                  listing.productCode,
                ),
              )
            : null,
        );
        setWaChecked(true);
      })
      .catch(() => setWaChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waOpen]);
  const labelFor = (key) => setup.placementLabels?.[key] || studioPlacementLabel(key);
  const quote = quoteForQuantity(listing, quantity);
  const chips = visibleQuickQuantities(listing.moq);
  const switcher = realSwitcher || studioSwitchProducts();
  const apparelSizes =
    listing.variantType === "size" && listing.variants?.length
      ? `${listing.variants[0].label}–${listing.variants[listing.variants.length - 1].label}`
      : null;
  const modalOpen = quoteOpen || waOpen;

  const frontDesign = {
    enabled: true,
    artwork: artwork.front,
    placement: frontPlacement,
  };
  const backDesign = {
    enabled: backEnabled,
    artwork: artwork.back,
    placement: backPlacement,
  };
  const activeKind =
    previewKind === "model" && hasPreviewKind(assets, colorKey, "model")
      ? "model"
      : previewKind === "lifestyle" && hasPreviewKind(assets, colorKey, "lifestyle")
        ? "lifestyle"
        : "product";

  const clampQuantity = (value) => {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isFinite(numeric) || numeric < listing.moq) {
      setMoqHint(true);
      return listing.moq;
    }
    setMoqHint(false);
    return numeric;
  };

  const applyQuantity = (value) => {
    const next = clampQuantity(value);
    setQuantity(next);
    setQtyDraft(String(next));
  };

  const copySummary = async () => {
    const lines = [
      "PrimeLinor design reference",
      listing.name,
      `Color: ${color.label}`,
      `Front: ${artwork.front ? artwork.front.name : "None"} · ${labelFor(frontPlacement)}`,
      `Back: ${
        backEnabled
          ? `${artwork.back ? artwork.back.name : "No artwork"} · ${labelFor(backPlacement)}`
          : "None"
      }`,
      `Quantity: ${quantity} ${pluralUnit(listing.unit, quantity)}`,
      quote.kind === "priced"
        ? `Estimated: ${formatInr(quote.total)} (${formatInr(quote.unitPrice)} / ${listing.unit})`
        : quote.headline,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const extraSummary = [
    `Front Artwork: ${artwork.front ? artwork.front.name : "None"}`,
    `Front Placement: ${labelFor(frontPlacement)}`,
    backEnabled
      ? `Back Artwork: ${artwork.back ? artwork.back.name : "None"}`
      : "Back Artwork: None",
    backEnabled
      ? `Back Placement: ${labelFor(backPlacement)}`
      : null,
    quote.kind === "priced"
      ? `Unit price: ${formatInr(quote.unitPrice)} / ${listing.unit}`
      : null,
  ].filter(Boolean);

  return (
    <main
      id="main"
      className={`${styles.page} ${modalOpen ? styles.modalOpen : ""}`}
    >
      {/* Workflow/UI page, not a landing page (Phase 6B §38) — canonical
          points back at the real product PDP rather than being indexed
          under its own URL. */}
      <Seo noindex title={`Try Your Logo — ${listing.name}`} />
      <div className={`container ${styles.shell}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li className={styles.crumbMid}>
              <Link to={`/products/${listing.id}`}>{listing.name}</Link>
            </li>
            <li aria-current="page">Customize</li>
          </ol>
        </nav>

        <header className={styles.intro}>
          <div>
            <h1 className={styles.title}>Try Your Logo</h1>
            <p className={styles.lede}>
              Preview your branding before requesting a quote.
            </p>
          </div>
          <Link to={`/products/${listing.id}`} className={styles.back}>
            View product
          </Link>
        </header>

        <div className={styles.workspace}>
          <section className={styles.previewCol} aria-label="Product preview">
            <StudioStage
              listing={listing}
              preview={preview}
              assets={assets}
              color={color}
              colorKey={colorKey}
              previewKind={activeKind}
              productView={productView}
              onPreviewKind={setPreviewKind}
              onProductView={setProductView}
              frontDesign={frontDesign}
              backDesign={backDesign}
              supportsBackPrint={supportsBackPrint}
            />
          </section>

          <aside className={styles.panel}>
            <div className={styles.panelBody}>
              <fieldset className={styles.field}>
                <legend className={styles.legend}>
                  <span className={styles.step}>1</span> Product
                </legend>
                <p className={styles.productName}>{listing.name}</p>
                {apparelSizes ? (
                  <p className={styles.hint}>Sizes available: {apparelSizes}</p>
                ) : null}
                <p className={styles.changeLabel} id="studio-product-label">
                  Change product
                </p>
                <div className={styles.chips}>
                  {switcher.map((item) => (
                    <label
                      key={item.id}
                      className={`${styles.chip} ${
                        item.id === listing.id ? styles.chipOn : ""
                      }`}
                    >
                      <input
                        className={styles.sr}
                        type="radio"
                        name="studio-product"
                        checked={item.id === listing.id}
                        onChange={() =>
                          navigate(`/customize/${item.id}`, { replace: true })
                        }
                      />
                      {item.switchLabel}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className={styles.field}>
                <legend className={styles.legend}>
                  <span className={styles.step}>2</span> Color
                  <span className={styles.legendValue}>{color.label}</span>
                </legend>
                <div className={styles.swatches}>
                  {colors.map((key) => {
                    const swatch = colorMeta[key] || productColors[key];
                    return (
                      <label
                        key={key}
                        className={`${styles.swatch} ${
                          key === colorKey ? styles.swatchOn : ""
                        }`}
                        title={swatch.label}
                      >
                        <input
                          className={styles.sr}
                          type="radio"
                          name="studio-color"
                          checked={key === colorKey}
                          onChange={() => {
                            setColorKey(key);
                            if (
                              previewKind === "model" &&
                              !hasPreviewKind(assets, key, "model")
                            ) {
                              setPreviewKind("product");
                            }
                            if (
                              previewKind === "lifestyle" &&
                              !hasPreviewKind(assets, key, "lifestyle")
                            ) {
                              setPreviewKind("product");
                            }
                          }}
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
                </div>
              </fieldset>

              <fieldset className={styles.field}>
                <legend className={styles.legend}>
                  <span className={styles.step}>3</span> Front Design
                </legend>
                <ArtworkUpload
                  id="studio-front-upload"
                  title="Front Logo / Artwork"
                  file={artwork.front}
                  error={artworkErrors.front}
                  onFile={onFrontFile}
                  onClear={onClearFront}
                />
                <p className={styles.subLegend} id="studio-front-place">
                  Placement
                </p>
                <div className={styles.chips} role="radiogroup" aria-labelledby="studio-front-place">
                  {frontPlacements.map((key) => (
                    <label
                      key={key}
                      className={`${styles.chip} ${
                        key === frontPlacement ? styles.chipOn : ""
                      }`}
                    >
                      <input
                        className={styles.sr}
                        type="radio"
                        name="studio-front-placement"
                        checked={key === frontPlacement}
                        onChange={() => setFrontPlacement(key)}
                      />
                      {labelFor(key)}
                    </label>
                  ))}
                </div>
                <p className={styles.hint}>
                  Choose where your artwork should appear.
                </p>
              </fieldset>

              {supportsBackPrint ? (
                <fieldset className={styles.field}>
                  <legend className={styles.legend}>
                    <span className={styles.step}>4</span> Back Design
                    <span className={styles.legendValue}>
                      {backEnabled ? "On" : "Optional"}
                    </span>
                  </legend>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={backEnabled}
                      onChange={(event) => {
                        const next = event.target.checked;
                        setBackEnabled(next);
                        if (next && productView !== "both") {
                          setPreviewKind("product");
                          setProductView("back");
                        }
                      }}
                    />
                    Add Back Print
                  </label>
                  {backEnabled ? (
                    <div className={styles.backBlock}>
                      <ArtworkUpload
                        id="studio-back-upload"
                        title="Back Artwork"
                        file={artwork.back}
                        error={artworkErrors.back}
                        onFile={onBackFile}
                        onClear={onClearBack}
                      />
                      <p className={styles.subLegend} id="studio-back-place">
                        Placement
                      </p>
                      <div className={styles.chips} role="radiogroup" aria-labelledby="studio-back-place">
                        {backPlacements.map((key) => (
                          <label
                            key={key}
                            className={`${styles.chip} ${
                              key === backPlacement ? styles.chipOn : ""
                            }`}
                          >
                            <input
                              className={styles.sr}
                              type="radio"
                              name="studio-back-placement"
                              checked={key === backPlacement}
                              onChange={() => setBackPlacement(key)}
                            />
                            {labelFor(key)}
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </fieldset>
              ) : null}

              <div className={styles.field}>
                <p className={styles.legend} id="studio-qty-label">
                  <span className={styles.step}>{supportsBackPrint ? 5 : 4}</span>{" "}
                  Quantity
                </p>
                <div className={styles.stepper}>
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={() => applyQuantity(quantity - 1)}
                    disabled={quantity <= listing.moq}
                    aria-label="Decrease quantity"
                  >
                    <Icon name="minus" size={16} />
                  </button>
                  <input
                    className={styles.qtyInput}
                    type="number"
                    inputMode="numeric"
                    min={listing.moq}
                    value={qtyDraft}
                    aria-labelledby="studio-qty-label"
                    onChange={(event) => setQtyDraft(event.target.value)}
                    onBlur={() => applyQuantity(qtyDraft)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                    }}
                  />
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={() => applyQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <p className={styles.hint}>
                  Minimum order: {listing.moq}{" "}
                  {pluralUnit(listing.unit, listing.moq)}
                  {moqHint ? " — quantity was adjusted to the MOQ." : ""}
                </p>
                <div className={styles.quick} role="group" aria-label="Quick quantities">
                  {chips.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.qtyChip} ${
                        value === quantity ? styles.qtyChipOn : ""
                      }`}
                      onClick={() => applyQuantity(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.priceBox} aria-live="polite">
                <p className={styles.legend}>
                  <span className={styles.step}>{supportsBackPrint ? 6 : 5}</span>{" "}
                  Price &amp; quote
                </p>
                {quote.kind === "priced" ? (
                  <>
                    <p className={styles.unitPrice}>
                      {formatInr(quote.unitPrice)}
                      <span> / {listing.unit}</span>
                    </p>
                    {quote.rangeNote ? (
                      <p className={styles.hint}>{quote.rangeNote}</p>
                    ) : null}
                    <p className={styles.totalLabel}>Estimated total</p>
                    <p className={styles.totalValue}>{formatInr(quote.total)}</p>
                    <p className={styles.hint}>
                      {quantity} × {formatInr(quote.unitPrice)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={styles.totalValue}>{quote.headline}</p>
                    <p className={styles.hint}>Request a quote for this volume.</p>
                  </>
                )}
                <p className={styles.hint}>
                  Estimated price based on selected product, quantity and
                  configuration. Final quotation will be confirmed by our team.
                </p>
              </div>

              <div className={styles.summary}>
                <p className={styles.summaryTitle}>Your configuration</p>
                <ul>
                  <li>{listing.name}</li>
                  <li>{color.label}</li>
                  <li>
                    Front: {labelFor(frontPlacement)}
                    {artwork.front ? " · Artwork uploaded" : " · No artwork"}
                  </li>
                  <li>
                    Back:{" "}
                    {backEnabled
                      ? `${labelFor(backPlacement)}${
                          artwork.back ? " · Artwork uploaded" : " · No artwork"
                        }`
                      : "None"}
                  </li>
                  <li>
                    {quantity} {pluralUnit(listing.unit, quantity)}
                  </li>
                </ul>
                <p className={styles.summaryPrice}>
                  Estimated:{" "}
                  {quote.kind === "priced" ? formatInr(quote.total) : quote.headline}
                </p>
                <button type="button" className={styles.textBtn} onClick={copySummary}>
                  {copied ? "Copied" : "Copy design reference"}
                </button>
              </div>
            </div>

            <div className={styles.ctas}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setQuoteOpen(true)}
              >
                Request a Quote
              </Button>
              <button type="button" className={styles.chat} onClick={() => setWaOpen(true)}>
                <Icon name="chat" size={16} />
                Chat with Expert on WhatsApp
              </button>
            </div>
          </aside>
        </div>
      </div>

      {!modalOpen ? (
        <ProductStickyCta
          quote={quote}
          quantity={quantity}
          unit={listing.unit}
          onQuote={() => setQuoteOpen(true)}
        />
      ) : null}

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={listing}
        colorId={colorKey}
        quantity={quantity}
        quote={quote}
        extraSummary={extraSummary}
        onSubmit={(contact) => {
          if (artwork.front?.uploading || (backEnabled && artwork.back?.uploading)) {
            return Promise.reject(new Error("Please wait for artwork to finish uploading."));
          }
          return submitRfq({
            contact: {
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              companyName: contact.company,
            },
            message: contact.notes,
            deliveryCity: contact.city,
            sourceType: "CUSTOMIZATION_STUDIO",
            sourceContext: { productSlug: listing.id },
            items: [
              {
                productId: listing.id,
                // DEFAULT_COLOR_KEY (utils/studioReal.js) is a synthetic
                // stand-in for a product with no registered ProductColor
                // rows — it isn't a real color slug, so the backend
                // rightly rejects it ("Color 'default' is not available
                // for this product."). Omit it rather than send a value
                // that doesn't correspond to any real color.
                colorId: colorKey === DEFAULT_COLOR_KEY ? undefined : colorKey,
                quantity,
                customizationData: {
                  front: {
                    enabled: true,
                    placementKey: frontPlacement,
                    artworkAssetId: artwork.front?.artworkAssetId || undefined,
                  },
                  back: backEnabled
                    ? {
                        enabled: true,
                        placementKey: backPlacement,
                        artworkAssetId: artwork.back?.artworkAssetId || undefined,
                      }
                    : undefined,
                },
              },
            ],
          });
        }}
      />

      <Dialog
        open={waOpen}
        onClose={() => setWaOpen(false)}
        titleId="studio-wa-title"
        title="Continue on WhatsApp"
      >
        <p className={styles.waCopy}>
          {waUrl
            ? "You'll be taken to WhatsApp to chat with our team about this configuration."
            : waChecked
              ? "WhatsApp chat isn't set up yet — please use Request a Quote instead."
              : "Checking WhatsApp availability…"}
        </p>
        <p className={styles.waMeta}>
          {listing.name} · {color.label} · {quantity}{" "}
          {pluralUnit(listing.unit, quantity)}
        </p>
        {waUrl ? (
          <Button
            as="a"
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            variant="primary"
            size="md"
            onClick={() => setWaOpen(false)}
          >
            Open WhatsApp
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={() => setWaOpen(false)}>
            Close
          </Button>
        )}
      </Dialog>
    </main>
  );
}

function revokeIfOrphan(url, otherUrl) {
  if (url && url !== otherUrl) URL.revokeObjectURL(url);
}

export default function CustomizationStudio() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState({ front: null, back: null });
  const [artworkErrors, setArtworkErrors] = useState({ front: null, back: null });

  const artworkRef = useRef(artwork);

  useEffect(() => {
    artworkRef.current = artwork;
  }, [artwork]);

  useEffect(() => {
    const mapped = demoProductToCatalogue[productId];
    if (mapped && mapped !== productId) {
      navigate(`/customize/${mapped}`, { replace: true });
    }
  }, [productId, navigate]);

  useEffect(() => {
    return () => {
      const current = artworkRef.current;
      revokeIfOrphan(current.front?.url, current.back?.url);
      revokeIfOrphan(current.back?.url, current.front?.url);
    };
  }, []);

  const applySide = async (side, file) => {
    if (!file) {
      setArtworkErrors((current) => ({ ...current, [side]: null }));
      setArtwork((current) => {
        const other = current[side === "front" ? "back" : "front"];
        revokeIfOrphan(current[side]?.url, other?.url);
        return { ...current, [side]: null };
      });
      return;
    }

    const validation = validateArtworkFile(file);
    if (!validation.ok) {
      setArtworkErrors((current) => ({ ...current, [side]: validation.message }));
      return;
    }

    setArtworkErrors((current) => ({ ...current, [side]: null }));
    setArtwork((current) => {
      const prev = current[side];
      const other = current[side === "front" ? "back" : "front"];
      revokeIfOrphan(prev?.url, other?.url);
      return {
        ...current,
        [side]: { url: URL.createObjectURL(file), name: file.name, artworkAssetId: null, uploading: true },
      };
    });

    // Uploaded immediately on pick — not deferred to quote submit — so
    // the backend's PENDING ArtworkAsset row exists ready to attach
    // (Phase 2 §22 lifecycle), and a bad/oversized file fails fast here
    // rather than at the end of the quote form.
    try {
      const uploaded = await uploadArtwork(file);
      setArtwork((current) =>
        current[side]?.name === file.name
          ? { ...current, [side]: { ...current[side], artworkAssetId: uploaded.id, uploading: false } }
          : current,
      );
    } catch (err) {
      setArtworkErrors((current) => ({ ...current, [side]: err.message || "Upload failed. Please try again." }));
      setArtwork((current) => {
        const other = current[side === "front" ? "back" : "front"];
        revokeIfOrphan(current[side]?.url, other?.url);
        return { ...current, [side]: null };
      });
    }
  };

  const [setup, setSetup] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setSetup(null);
    const resolvedSlug = demoProductToCatalogue[productId] || productId;
    // Real backend data takes priority whenever the product exists there at
    // all (Phase 5 §51-52) — the legacy mock resolver is only a fallback
    // for content that has no backend equivalent yet (§59), so a product
    // that's real but not (yet) previewable still shows real listing data
    // on the Unavailable screen rather than silently falling back to mock.
    fetchStudioProduct(resolvedSlug)
      .then((product) => {
        if (cancelled) return;
        setSetup(product ? buildRealStudioSetup(product) : resolveStudioSetup(productId));
      })
      .catch(() => {
        if (cancelled) return;
        setSetup(resolveStudioSetup(productId));
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!setup) return <StudioLoading />;
  if (setup.status !== "ok") {
    return <Unavailable listing={setup.listing} productId={productId} />;
  }

  return (
    <StudioView
      key={setup.listing.id}
      setup={setup}
      artwork={artwork}
      artworkErrors={artworkErrors}
      onFrontFile={(file) => applySide("front", file)}
      onBackFile={(file) => applySide("back", file)}
      onClearFront={() => applySide("front", null)}
      onClearBack={() => applySide("back", null)}
    />
  );
}

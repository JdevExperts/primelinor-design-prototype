import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductBySlug } from "../api/catalog";
import { submitRfq } from "../api/rfqs";
import ProductGallery from "../components/product/ProductGallery";
import ProductStickyCta from "../components/product/ProductStickyCta";
import QuoteModal from "../components/product/QuoteModal";
import SizeGuideModal from "../components/product/SizeGuideModal";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import ProductCard from "../components/ui/ProductCard";
import Seo from "../components/layout/Seo";
import { formatInr, pluralUnit, quoteForQuantity } from "../utils/pricing";
import { getColorMeta, getPlacementLabel, visibleQuickQuantities } from "../utils/productDetail";
import { track } from "../analytics/track";
import styles from "./ProductDetail.module.css";

/**
 * Highlights used to be a separate bullet list, but on the real catalogue
 * it was always just `specifications.map(s => s.value)` — the same rows,
 * stripped of their labels (PDP Content Cleanup §1/§4). Merging them into
 * one "Product Details" list is therefore just: render specifications
 * once. This dedupes exact-duplicate rows (same label AND value) as a
 * defensive backstop in case Admin data ever has one, not because the
 * old Highlights/Specifications split could produce one on its own.
 */
function dedupeSpecifications(specifications) {
  const seen = new Set();
  const rows = [];
  for (const row of specifications) {
    const key = `${row.label}|${row.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows;
}

function ProductNotFound() {
  useEffect(() => {
    document.title = "Product not found — PrimeLinor";
  }, []);

  return (
    <main id="main" className={styles.page}>
      <div className={`container ${styles.missing}`}>
        <p className="eyebrow">Products</p>
        <h1 className={styles.title}>Product not found</h1>
        <p className={styles.lede}>
          That item doesn&rsquo;t exist or may have been removed. Browse the
          listing to pick another product.
        </p>
        <Button as={Link} to="/products" variant="primary" size="md">
          Browse Products
        </Button>
      </div>
    </main>
  );
}

function ProductLoading() {
  return (
    <main id="main" className={styles.page}>
      <div className={`container ${styles.missing}`}>
        <p className="eyebrow">Products</p>
        <h1 className={styles.title}>Loading…</h1>
      </div>
    </main>
  );
}

function ProductLoadError({ message, onRetry }) {
  useEffect(() => {
    document.title = "Couldn't load product — PrimeLinor";
  }, []);

  return (
    <main id="main" className={styles.page}>
      <div className={`container ${styles.missing}`}>
        <p className="eyebrow">Products</p>
        <h1 className={styles.title}>Couldn&rsquo;t load this product</h1>
        <p className={styles.lede}>{message}</p>
        <div className={styles.missingActions}>
          <Button variant="primary" size="md" onClick={onRetry}>
            Try Again
          </Button>
          <Button as={Link} to="/products" variant="secondary" size="md">
            Browse Products
          </Button>
        </div>
      </div>
    </main>
  );
}

function ProductDetailView({ product }) {
  const related = product.relatedProducts || [];
  const colors = product.colors || [];
  const [view, setView] = useState("front");
  const [colorId, setColorId] = useState(colors[0] || "white");
  const [quantity, setQuantity] = useState(product.moq);
  const [qtyDraft, setQtyDraft] = useState(String(product.moq));
  const [moqHint, setMoqHint] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    track("PRODUCT_VIEW", {
      productId: product.id,
      productCode: product.productCode,
      categoryId: product.categoryId || undefined,
    });
  }, [product?.id, product?.productCode, product?.categoryId]);

  const color = getColorMeta(colorId);
  const quote = quoteForQuantity(product, quantity);
  const hasSizes = product.variantType === "size" && product.variants.length > 0;
  const availableSizeLabels = hasSizes ? product.variants.map((item) => item.label) : [];
  const productDetailRows = dedupeSpecifications(product.specifications || []);
  const chips = visibleQuickQuantities(product.moq);
  const unitWord = pluralUnit(product.unit, quantity);

  const seoTitle = product.seoTitle || `${product.name} — PrimeLinor`;
  const seoDescription =
    product.seoDescription || product.description || product.longSpec || undefined;

  const clampQuantity = (value) => {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isFinite(numeric) || numeric < product.moq) {
      setMoqHint(true);
      return product.moq;
    }
    setMoqHint(false);
    return numeric;
  };

  const applyQuantity = (value) => {
    const next = clampQuantity(value);
    setQuantity(next);
    setQtyDraft(String(next));
  };

  return (
    <main
      id="main"
      className={`${styles.page} ${quoteOpen || sizeOpen ? styles.modalOpen : ""}`}
    >
      <Seo title={seoTitle} description={seoDescription} ogType="product" ogImage={product.image} />
      <div className={`container ${styles.top}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li className={styles.crumbCat}>
              <Link to="/products" state={{ category: product.category }}>
                {product.categoryLabel}
              </Link>
            </li>
            <li className={styles.crumbCurrent} aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className={styles.hero}>
          <ProductGallery
            product={product}
            colorHex={color.hex}
            activeView={view}
            onViewChange={setView}
          />

          <div className={styles.config}>
            <p className="eyebrow">{product.categoryLabel}</p>
            <h1 className={styles.title}>{product.name}</h1>
            {product.productCode ? (
              <p className={styles.productCode}>
                Product Code: <span>{product.productCode}</span>
              </p>
            ) : null}
            <p className={styles.spec}>{product.longSpec}</p>

            <div className={styles.priceBlock} aria-live="polite">
              {quote.kind === "priced" ? (
                <>
                  <p className={styles.price}>
                    {formatInr(quote.unitPrice)}
                    <span className={styles.priceUnit}> / {product.unit}</span>
                  </p>
                  {quote.rangeNote ? (
                    <p className={styles.priceNote}>{quote.rangeNote}</p>
                  ) : null}
                </>
              ) : (
                <p className={styles.price}>{quote.headline}</p>
              )}
              <p className={styles.moq}>MOQ {product.moq}</p>
            </div>
            <p className={styles.disclaimer}>
              Estimated price based on selected quantity and configuration.
              Final quotation will be confirmed by our team.
            </p>

            {colors.length > 0 ? (
              <fieldset className={styles.group}>
                <legend className={styles.label}>
                  Color: <span>{color.label}</span>
                </legend>
                <div className={styles.swatches}>
                  {colors.map((id) => {
                    const swatch = getColorMeta(id);
                    const selected = id === colorId;
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`${styles.swatch} ${selected ? styles.swatchOn : ""}`}
                        style={{ backgroundColor: swatch.hex }}
                        onClick={() => setColorId(id)}
                        aria-pressed={selected}
                        title={swatch.label}
                      >
                        <span className="visually-hidden">{swatch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {hasSizes ? (
              <div className={styles.group}>
                <p className={styles.sizesLine}>
                  <span>
                    <span className={styles.sizesLabel}>Available Sizes:</span>{" "}
                    <span className={styles.sizesValue}>
                      {availableSizeLabels.join(", ")}
                    </span>
                  </span>
                  {product.sizeGuide ? (
                    <button
                      type="button"
                      className={styles.textLink}
                      onClick={() => setSizeOpen(true)}
                    >
                      View Size Guide
                    </button>
                  ) : null}
                </p>
                <p className={styles.hint}>
                  Size-wise quantities can be finalized before order confirmation.
                </p>
              </div>
            ) : null}

            <div className={styles.group}>
              <p className={styles.label} id="quantity-label">
                Quantity
              </p>
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.step}
                  onClick={() => applyQuantity(quantity - 1)}
                  disabled={quantity <= product.moq}
                  aria-label="Decrease quantity"
                >
                  <Icon name="minus" size={16} />
                </button>
                <input
                  className={styles.qtyInput}
                  type="number"
                  inputMode="numeric"
                  min={product.moq}
                  value={qtyDraft}
                  aria-labelledby="quantity-label"
                  onChange={(event) => setQtyDraft(event.target.value)}
                  onBlur={() => applyQuantity(qtyDraft)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.step}
                  onClick={() => applyQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Icon name="plus" size={16} />
                </button>
              </div>
              <p className={styles.hint}>
                Minimum order: {product.moq} {pluralUnit(product.unit, product.moq)}
                {moqHint ? " — quantity was adjusted to the MOQ." : ""}
              </p>
              {chips.length > 0 ? (
                <div className={styles.quick} role="group" aria-label="Quick quantities">
                  {chips.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.chip} ${
                        value === quantity ? styles.chipOn : ""
                      }`}
                      onClick={() => applyQuantity(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={styles.total} aria-live="polite">
              <p className={styles.totalLabel}>Estimated total</p>
              {quote.kind === "priced" ? (
                <>
                  <p className={styles.totalValue}>{formatInr(quote.total)}</p>
                  <p className={styles.totalMeta}>
                    {quantity} × {formatInr(quote.unitPrice)}
                  </p>
                </>
              ) : (
                <p className={styles.totalValue}>{quote.headline}</p>
              )}
              <p className={styles.tax}>
                Taxes, delivery and final commercial terms confirmed in
                quotation.
              </p>
            </div>

            <p className={styles.dispatch}>
              Estimated dispatch: {product.dispatchEstimate}
            </p>

            <ul className={styles.trust}>
              <li>Flexible quantities</li>
              <li>Logo preview before confirmation</li>
              <li>PAN India supply</li>
            </ul>

            <div className={styles.ctas}>
              {product.studioReady ? (
                <Button
                  as={Link}
                  to={`/customize/${product.id}`}
                  variant="accent"
                  size="lg"
                  icon="upload"
                  fullWidth
                >
                  Try Your Logo
                </Button>
              ) : null}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  track("QUOTE_CTA_CLICK", {
                    productId: product.id,
                    productCode: product.productCode,
                    metadata: { placement: "pdp_primary" },
                  });
                  setQuoteOpen(true);
                }}
              >
                Request a Quote
              </Button>
              <button type="button" className={styles.chat}>
                <Icon name="chat" size={16} />
                Chat with Product Expert
              </button>
            </div>
          </div>
        </div>
      </div>

      {productDetailRows.length > 0 ? (
        <section className={styles.section} aria-labelledby="details-title">
          <div className="container">
            <h2 id="details-title" className={styles.sectionTitle}>
              Product Details
            </h2>
            <dl className={styles.specs}>
              {productDetailRows.map((row) => (
                <div key={row.label} className={styles.specRow}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {product.customizable ? (
        <section className={styles.band} aria-labelledby="customize-title">
          <div className="container">
            <h2 id="customize-title" className={styles.sectionTitle}>
              Customize this product
            </h2>
            <p className={styles.copy}>
              Upload your logo, choose a placement, preview branding, then
              request a quotation. You do not need to pick a printing method —
              our team will recommend the right option for your artwork and
              quantity.
            </p>
            {product.placements.length > 0 ? (
              <ul className={styles.placements} aria-label="Available placements">
                {product.placements.map((id) => (
                  <li key={id}>{getPlacementLabel(id)}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.copy}>
                Branding is confirmed with the quotation for this product type.
              </p>
            )}
            {product.studioReady ? (
              <Button
                as={Link}
                to={`/customize/${product.id}`}
                variant="accent"
                size="md"
                icon="upload"
              >
                Try Your Logo
              </Button>
            ) : (
              <p className={styles.copy}>Logo preview coming soon for this product.</p>
            )}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className={styles.section} aria-labelledby="related-title">
          <div className="container">
            <h2 id="related-title" className={styles.sectionTitle}>
              You may also like
            </h2>
            <ul className={styles.related}>
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard
                    product={item}
                    showSwatches
                    detailsTo={`/products/${item.id}`}
                    tryHref={`/customize/${item.id}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className={styles.final} aria-labelledby="detail-final-title">
        <div className="container">
          <h2 id="detail-final-title" className={styles.finalTitle}>
            Ready to brand {quantity} {unitWord}?
          </h2>
          <p className={styles.copy}>
            Share this configuration and we will confirm artwork, pricing and
            dispatch.
          </p>
          <div className={styles.finalCtas}>
            {product.studioReady ? (
              <Button
                as={Link}
                to={`/customize/${product.id}`}
                variant="accent"
                size="lg"
                icon="upload"
              >
                Try Your Logo
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="lg"
              onClick={() => setQuoteOpen(true)}
            >
              Request a Quote
            </Button>
          </div>
        </div>
      </section>

      {!quoteOpen && !sizeOpen ? (
        <ProductStickyCta
          quote={quote}
          quantity={quantity}
          unit={product.unit}
          onQuote={() => setQuoteOpen(true)}
        />
      ) : null}

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={product}
        colorId={colorId}
        quantity={quantity}
        quote={quote}
        extraSummary={
          hasSizes ? [`Available sizes: ${availableSizeLabels.join(", ")}`] : []
        }
        onSubmit={(contact) =>
          submitRfq({
            contact: {
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              companyName: contact.company,
            },
            message: contact.notes,
            deliveryCity: contact.city,
            sourceType: "PDP",
            sourceContext: { productSlug: product.id },
            // Bulk apparel doesn't commit to one size (PDP Bulk Size UX
            // Cleanup) — the buyer's real mix is confirmed with sales, so no
            // variantId is sent. Sizes offered are recorded neutrally here
            // instead of as a false single-size selection.
            requirementData: hasSizes
              ? { availableSizes: availableSizeLabels, sizeBreakdown: "To be confirmed" }
              : undefined,
            items: [
              {
                productId: product.id,
                // Only send a colour when the product actually offers a
                // colour choice. Products with no ProductColor rows never
                // show the swatch picker, so `colorId` is still its
                // placeholder default ("white") — submitting that makes the
                // backend reject the item as an unavailable colour.
                ...(colors.length > 0 ? { colorId } : {}),
                quantity,
              },
            ],
          })
        }
      />
      <SizeGuideModal
        open={sizeOpen}
        onClose={() => setSizeOpen(false)}
        product={product}
      />
    </main>
  );
}

/**
 * Keyed by `${id}:${retryToken}` in the parent below so a new product slug
 * (route navigation) or a retry click both fully remount this component —
 * `status` starts fresh at "loading" from its own initial state rather
 * than being reset imperatively inside the effect.
 */
function ProductDetailLoader({ id, onRetry }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "not-found" | "error"
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getProductBySlug(id)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setProduct(result);
          setStatus("ready");
        } else {
          setStatus("not-found");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") return <ProductLoading />;
  if (status === "error") return <ProductLoadError message={loadError} onRetry={onRetry} />;
  if (status === "not-found") return <ProductNotFound />;
  return <ProductDetailView key={product.id} product={product} />;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [retryToken, setRetryToken] = useState(0);

  return (
    <ProductDetailLoader
      key={`${id}:${retryToken}`}
      id={id}
      onRetry={() => setRetryToken((token) => token + 1)}
    />
  );
}

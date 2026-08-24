import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductGallery from "../components/product/ProductGallery";
import ProductStickyCta from "../components/product/ProductStickyCta";
import QuoteModal from "../components/product/QuoteModal";
import SizeGuideModal from "../components/product/SizeGuideModal";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import ProductCard from "../components/ui/ProductCard";
import { formatInr, pluralUnit, quoteForQuantity } from "../utils/pricing";
import {
  getColorMeta,
  getPlacementLabel,
  getProductDetail,
  getRelatedProducts,
  visibleQuickQuantities,
} from "../utils/productDetail";
import styles from "./ProductDetail.module.css";

function defaultVariant(product) {
  if (!product.variants?.length) return "";
  return product.variants.find((item) => item.id === "m")?.id || product.variants[0].id;
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
          That item is not in this prototype catalogue. Browse the listing to
          pick another product.
        </p>
        <Button as={Link} to="/products" variant="primary" size="md">
          Browse Products
        </Button>
      </div>
    </main>
  );
}

function ProductDetailView({ product }) {
  const related = useMemo(() => getRelatedProducts(product), [product]);
  const colors = product.colors || [];
  const [view, setView] = useState("front");
  const [colorId, setColorId] = useState(colors[0] || "white");
  const [variantId, setVariantId] = useState(defaultVariant(product));
  const [quantity, setQuantity] = useState(product.moq);
  const [qtyDraft, setQtyDraft] = useState(String(product.moq));
  const [moqHint, setMoqHint] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  const color = getColorMeta(colorId);
  const quote = quoteForQuantity(product, quantity);
  const variantLabel = product.variants.find((item) => item.id === variantId)?.label;
  const chips = visibleQuickQuantities(product.moq);
  const unitWord = pluralUnit(product.unit, quantity);

  useEffect(() => {
    document.title = `${product.name} — PrimeLinor`;
  }, [product.name]);

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

            {product.variantType === "size" && product.variants.length > 0 ? (
              <fieldset className={styles.group}>
                <legend className={styles.label}>
                  Size
                  {product.sizeGuide ? (
                    <button
                      type="button"
                      className={styles.textLink}
                      onClick={() => setSizeOpen(true)}
                    >
                      View Size Guide
                    </button>
                  ) : null}
                </legend>
                <div className={styles.sizes}>
                  {product.variants.map((item) => {
                    const selected = item.id === variantId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`${styles.size} ${selected ? styles.sizeOn : ""}`}
                        onClick={() => setVariantId(item.id)}
                        aria-pressed={selected}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
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
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setQuoteOpen(true)}
              >
                Request a Quote
              </Button>
              <Button
                as={Link}
                to={`/customize/${product.id}`}
                variant="accent"
                size="lg"
                icon="upload"
                fullWidth
              >
                See With Your Logo
              </Button>
              <button type="button" className={styles.chat}>
                <Icon name="chat" size={16} />
                Chat with Product Expert
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.band} aria-labelledby="highlights-title">
        <div className="container">
          <h2 id="highlights-title" className={styles.sectionTitle}>
            Highlights
          </h2>
          <ul className={styles.highlights}>
            {product.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="specs-title">
        <div className="container">
          <h2 id="specs-title" className={styles.sectionTitle}>
            Specifications
          </h2>
          <dl className={styles.specs}>
            {product.specifications.map((row) => (
              <div key={row.label} className={styles.specRow}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

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
          <Button
            as={Link}
            to={`/customize/${product.id}`}
            variant="accent"
            size="md"
            icon="upload"
          >
            See With Your Logo
          </Button>
        </div>
      </section>

      {product.sizeGuide ? (
        <section
          className={styles.section}
          aria-labelledby="size-guide-heading"
          id="size-guide"
        >
          <div className="container">
            <div className={styles.sectionHead}>
              <h2 id="size-guide-heading" className={styles.sectionTitle}>
                Size guide
              </h2>
              <button
                type="button"
                className={styles.textLink}
                onClick={() => setSizeOpen(true)}
              >
                View larger
              </button>
            </div>
            <p className={styles.copy}>{product.sizeGuide.note}</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {product.sizeGuide.columns.map((column) => (
                      <th key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {product.sizeGuide.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) =>
                        index === 0 ? (
                          <th key={cell} scope="row">
                            {cell}
                          </th>
                        ) : (
                          <td key={`${row[0]}-${cell}`}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <Button
              variant="primary"
              size="lg"
              onClick={() => setQuoteOpen(true)}
            >
              Request a Quote
            </Button>
            <Button
              as={Link}
              to={`/customize/${product.id}`}
              variant="accent"
              size="lg"
              icon="upload"
            >
              See With Your Logo
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
        variantLabel={variantLabel}
        quantity={quantity}
        quote={quote}
      />
      <SizeGuideModal
        open={sizeOpen}
        onClose={() => setSizeOpen(false)}
        product={product}
      />
    </main>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductDetail(id);
  if (!product) return <ProductNotFound />;
  return <ProductDetailView key={product.id} product={product} />;
}

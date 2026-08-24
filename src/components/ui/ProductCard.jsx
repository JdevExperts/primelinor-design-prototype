import { Link } from "react-router-dom";
import { productColors } from "../../data/mockData";
import Button from "./Button";
import Icon from "./Icon";
import ProductVisual from "./ProductVisual";
import styles from "./ProductCard.module.css";

const inr = (value) => `₹${value.toLocaleString("en-IN")}`;
const SWATCH_LIMIT = 4;

export default function ProductCard({
  product,
  showSwatches = false,
  detailsTo,
  tryHref = "#try-your-logo",
  compactMobile = false,
}) {
  const {
    name,
    spec,
    art,
    color,
    image,
    price,
    priceType,
    priceNote,
    moq,
    unit,
    colors = [],
  } = product;

  const detailHref = detailsTo || `/products/${product.id}`;

  const visibleColors = colors.slice(0, SWATCH_LIMIT);
  const extraColors = Math.max(0, colors.length - SWATCH_LIMIT);
  const tryIsRoute = tryHref.startsWith("/");
  const tryTo = tryIsRoute
    ? tryHref.includes("#")
      ? {
          pathname: tryHref.slice(0, tryHref.indexOf("#")) || "/",
          hash: tryHref.slice(tryHref.indexOf("#")),
        }
      : tryHref
    : null;

  return (
    <article
      className={`${styles.card} ${compactMobile ? styles.compactMobile : ""}`}
    >
      <div className={styles.media}>
        <div className={styles.mediaInner}>
          <ProductVisual
            art={art}
            color={color}
            src={image}
            alt={`${name} — product photography placeholder`}
            ratio="4 / 3.1"
            scale={0.96}
          />
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.spec}>{spec}</p>

        <div className={styles.priceBlock}>
          <div className={styles.priceRow}>
            {priceType === "quote" ? (
              <span className={styles.quotePrice}>Price on request</span>
            ) : (
              <span className={styles.price}>
                {inr(price)}
                <span className={styles.priceUnit}> / {unit}</span>
              </span>
            )}
            <span className={styles.moq}>MOQ {moq}</span>
          </div>
          {priceNote ? <p className={styles.priceNote}>{priceNote}</p> : null}
        </div>

        {showSwatches && visibleColors.length > 0 ? (
          <ul className={styles.swatches} aria-label={`Colours for ${name}`}>
            {visibleColors.map((id) => {
              const swatch = productColors[id];
              if (!swatch) return null;
              return (
                <li key={id}>
                  <span
                    className={styles.swatch}
                    style={{ backgroundColor: swatch.hex }}
                    title={swatch.label}
                  >
                    <span className="visually-hidden">{swatch.label}</span>
                  </span>
                </li>
              );
            })}
            {extraColors > 0 ? (
              <li className={styles.swatchMore} title={`${extraColors} more colours`}>
                +{extraColors}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      {/* View Details leads; Try Your Logo stays available as an accent text
          action so a grid of cards is not a wall of amber buttons */}
      <div className={styles.actions}>
        <Button
          as={Link}
          to={detailHref}
          variant="secondary"
          size="sm"
          trailingIcon="arrowRight"
          className={styles.details}
        >
          View Details
        </Button>
        {tryIsRoute ? (
          <Link to={tryTo} className={styles.tryAction}>
            <Icon name="upload" size={14} />
            <span>Try logo</span>
            <span className="visually-hidden"> on {name}</span>
          </Link>
        ) : (
          <a href={tryHref} className={styles.tryAction}>
            <Icon name="upload" size={14} />
            <span>Try logo</span>
            <span className="visually-hidden"> on {name}</span>
          </a>
        )}
      </div>
    </article>
  );
}

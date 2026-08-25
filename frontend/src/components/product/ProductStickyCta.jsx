import Button from "../ui/Button";
import { formatInr, pluralUnit } from "../../utils/pricing";
import styles from "./ProductStickyCta.module.css";

export default function ProductStickyCta({ quote, quantity, unit, onQuote }) {
  const context =
    quote.kind === "priced"
      ? `${formatInr(quote.total)} · ${quantity} ${pluralUnit(unit, quantity)}`
      : quote.headline;

  return (
    <div className={styles.bar}>
      <p className={styles.price}>{context}</p>
      <Button variant="primary" size="md" onClick={onQuote}>
        Request a Quote
      </Button>
    </div>
  );
}

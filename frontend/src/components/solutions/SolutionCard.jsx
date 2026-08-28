import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import ProductVisual from "../ui/ProductVisual";
import styles from "./SolutionCard.module.css";

export default function SolutionCard({ solution }) {
  return (
    <Link to={`/solutions/${solution.slug}`} className={styles.card}>
      <div className={styles.media}>
        <ProductVisual
          art={solution.art}
          color={solution.color}
          src={solution.heroImage}
          alt={solution.heroImage ? solution.heroAlt : `${solution.label} — photography placeholder`}
          ratio="4 / 2.8"
          scale={0.94}
        />
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{solution.label}</h3>
        <p className={styles.description}>{solution.hubDescription}</p>
        <p className={styles.hints}>{solution.categoryHints.join(" • ")}</p>
        <span className={styles.cta}>
          Explore Solution
          <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Link>
  );
}

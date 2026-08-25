import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { giftingUseCases } from "../../data/corporateGiftingData";
import styles from "./GiftingUseCases.module.css";

/**
 * Answers "what kind of gifting project are you working on?" — solution
 * entry points, not products yet. Each card scrolls to the section that
 * actually answers it (Explore Gift Collections, or the Welcome Kit
 * feature for that specific use case).
 */
export default function GiftingUseCases() {
  return (
    <Section tone="muted" ariaLabelledBy="gifting-use-cases-title">
      <SectionHeader
        titleId="gifting-use-cases-title"
        eyebrow="Corporate gifting"
        title="What are you gifting for?"
        description="Start from the occasion — we will show the right products and kits."
      />

      <ul className={styles.grid}>
        {giftingUseCases.map((item) => (
          <li key={item.id}>
            <Link to={{ hash: `#${item.anchor}` }} className={styles.card}>
              <div className={styles.media}>
                <ProductVisual
                  art={item.art}
                  color={item.color}
                  src={item.image}
                  alt=""
                  ratio="4 / 2.6"
                  scale={0.94}
                />
              </div>
              <div className={styles.body}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
                <span className={styles.discover}>
                  Discover
                  <Icon name="arrowRight" size={16} />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

import Icon from "../ui/Icon";
import ProductVisual from "../ui/ProductVisual";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { creationTypes } from "../../data/mockData";
import styles from "./CreationTypes.module.css";

export default function CreationTypes() {
  return (
    <Section id="solutions" ariaLabelledBy="creation-types-title">
      <SectionHeader
        titleId="creation-types-title"
        eyebrow="Shop by need"
        title="What are you creating today?"
        description="Four broad project types. Pick the one closest to what you are making and we will narrow the catalogue."
      />

      <ul className={styles.grid}>
        {creationTypes.map((type) => (
          <li key={type.id}>
            <article className={styles.card}>
              <div className={styles.media}>
                <div className={styles.mediaInner}>
                  <ProductVisual
                    art={type.art}
                    color={type.color}
                    src={type.image}
                    alt={`${type.title} — photography placeholder`}
                    ratio="4 / 3.4"
                    scale={0.92}
                  />
                </div>
              </div>

              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <h3 className={styles.title}>
                    <button type="button" className={styles.trigger}>
                      {type.title}
                    </button>
                  </h3>
                  <span className={styles.arrow} aria-hidden="true">
                    <Icon name="arrowRight" size={16} />
                  </span>
                </div>
                <p className={styles.description}>{type.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}

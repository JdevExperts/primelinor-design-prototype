import Button from "../ui/Button";
import CategoryCard from "../ui/CategoryCard";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { categories } from "../../data/mockData";
import styles from "./CategoryGrid.module.css";

export default function CategoryGrid() {
  return (
    <Section id="categories" tone="muted" ariaLabelledBy="categories-title">
      <SectionHeader
        titleId="categories-title"
        eyebrow="Shop by category"
        title="Everything your brand can be printed on"
        description="Apparel, drinkware, stationery, bags and gifting — all customizable with your logo."
        action={
          <Button variant="secondary" size="md" trailingIcon="arrowRight">
            View all categories
          </Button>
        }
      />

      <ul className={styles.grid}>
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

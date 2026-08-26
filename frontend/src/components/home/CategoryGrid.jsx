import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../api/catalog";
import Button from "../ui/Button";
import CategoryCard from "../ui/CategoryCard";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { categories as curatedCategories } from "../../data/mockData";
import { flattenToLeafCategories } from "../../utils/categories";
import styles from "./CategoryGrid.module.css";

/**
 * Merges the curated merchandising list (which categories, what order,
 * vector fallback) with real backend category data (name, image, alt) by
 * slug. A curated entry whose `targetCategory` isn't found among the
 * fetched leaves yet (still loading, or briefly stale) falls back to its
 * own `id` as a display label with no image — the existing vector
 * fallback — rather than rendering broken or blank.
 */
function mergeCategoriesWithRealData(curated, realLeaves) {
  const bySlug = new Map(realLeaves.map((c) => [c.slug, c]));
  return curated.map((item) => {
    const real = bySlug.get(item.targetCategory);
    return {
      ...item,
      name: real?.name || item.id,
      image: real?.image?.url || null,
      alt: real?.image?.alt || real?.name || item.id,
    };
  });
}

export default function CategoryGrid() {
  const [realCategories, setRealCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((fetched) => {
        if (!cancelled) setRealCategories(flattenToLeafCategories(fetched));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = mergeCategoriesWithRealData(curatedCategories, realCategories);

  return (
    <Section id="categories" tone="muted" ariaLabelledBy="categories-title">
      <SectionHeader
        titleId="categories-title"
        eyebrow="Shop by category"
        title="Everything your brand can be printed on"
        description="Apparel, drinkware, stationery, bags and gifting — all customizable with your logo."
        action={
          // No dedicated categories page exists — /products lists (and
          // filters by) every real category already, so it's the correct
          // target rather than a route built just for this button.
          <Button as={Link} to="/products" variant="secondary" size="md" trailingIcon="arrowRight">
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

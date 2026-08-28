import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import SolutionCard from "../solutions/SolutionCard";
import { getSolutions } from "../../api/catalog";
import styles from "./SolutionsForEveryTeam.module.css";

/**
 * Homepage preview of the real Solutions system, not a second concept
 * (Solutions Phase A §17). Backend is now the source of truth for which
 * Solutions are featured on the homepage and in what order (`featured=true`
 * → active && featuredOnHome, ordered by homeSortOrder) — no frontend
 * `homeSolutionSlugs` config to keep in sync anymore.
 */
export default function SolutionsForEveryTeam() {
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getSolutions({ featured: true })
      .then((list) => {
        if (!cancelled) setSolutions(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!solutions.length) return null;

  return (
    <Section tone="muted" ariaLabelledBy="home-solutions-title">
      <SectionHeader
        titleId="home-solutions-title"
        eyebrow="Solutions"
        title="Solutions for Every Team"
        description="Find the right products for your people, industry, event or everyday business needs."
        action={
          <Button
            as={Link}
            to="/solutions"
            variant="secondary"
            size="md"
            trailingIcon="arrowRight"
          >
            View All Solutions
          </Button>
        }
      />

      <ul className={styles.grid}>
        {solutions.map((solution) => (
          <li key={solution.slug}>
            <SolutionCard solution={solution} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

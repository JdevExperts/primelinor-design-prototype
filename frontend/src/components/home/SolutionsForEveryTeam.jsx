import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import SolutionCard from "../solutions/SolutionCard";
import { homeSolutionSlugs } from "../../data/homeData";
import { getSolution } from "../../data/solutionsData";
import styles from "./SolutionsForEveryTeam.module.css";

/**
 * Homepage preview of the real Solutions system, not a second concept
 * (Solutions Phase 1 §2/§23). Reuses the same `SolutionCard` the /solutions
 * hub renders, resolved against the canonical `solutions` data by slug —
 * title, copy, art and the `/solutions/:slug` link all come from one place.
 */
export default function SolutionsForEveryTeam() {
  const solutions = homeSolutionSlugs.map(getSolution).filter(Boolean);
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

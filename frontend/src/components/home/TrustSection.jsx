import Icon from "../ui/Icon";
import Button from "../ui/Button";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import { trust } from "../../data/homeData";
import styles from "./TrustSection.module.css";

function Stars({ rating }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Icon key={index} name="star" size={15} fill="currentColor" />
      ))}
      <span className="visually-hidden">{rating} out of 5 stars</span>
    </span>
  );
}

const featuredReviews = trust.reviews.filter((review) => review.featuredOnHome);

/**
 * Real, verified Google Reviews content for PrimeLinor (rating, review
 * cards and the CTA all come from `trust` in homeData.js) — nothing here
 * is an invented quote or a placeholder slot.
 */
export default function TrustSection() {
  const { rating } = trust;

  return (
    <Section tone="muted" ariaLabelledBy="trust-title">
      <SectionHeader
        titleId="trust-title"
        eyebrow="Trusted by customers"
        title="Proof, not promises"
        description={rating.label}
      />

      <div className={styles.summary}>
        <span className={styles.summaryScore}>{rating.value}</span>
        <Stars rating={rating.value} />
        <span className={styles.summaryCount}>{rating.count} reviews</span>
        <span className={styles.summarySource}>{rating.source}</span>
      </div>

      <ul className={styles.reviews}>
        {featuredReviews.map((review) => (
          <li key={review.id} className={styles.review}>
            <Stars rating={review.rating} />
            <p className={styles.reviewText}>{review.text}</p>
            <div className={styles.reviewMeta}>
              <span className={styles.reviewName}>{review.name}</span>
              <span className={styles.reviewTime}>{review.timeAgo}</span>
            </div>
            <span className={styles.reviewSource}>Google Review</span>
          </li>
        ))}
      </ul>

      <div className={styles.cta}>
        <Button
          as="a"
          href={rating.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="md"
          trailingIcon="arrowRight"
        >
          View all Google Reviews
        </Button>
      </div>
    </Section>
  );
}

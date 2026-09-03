import Hero from "../components/home/Hero";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductExplorer from "../components/home/ProductExplorer";
import SolutionsForEveryTeam from "../components/home/SolutionsForEveryTeam";
import HowItWorks from "../components/home/HowItWorks";
import TrustSection from "../components/home/TrustSection";
import FinalCTA from "../components/home/FinalCTA";
import Seo from "../components/layout/Seo";

export default function Home() {
  return (
    <main id="main">
      <Seo
        title="PrimeLinor — Custom Products for Your Brand"
        description="Custom apparel, corporate gifts, promotional products and kits for corporate teams, startups, schools, events and more. Request a quote — no minimums surprise, no hidden fees."
      />
      <Hero />
      <ProductExplorer />
      <CategoryGrid />
      <SolutionsForEveryTeam />
      <HowItWorks />
      <TrustSection />
      <FinalCTA />
    </main>
  );
}

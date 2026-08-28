import Hero from "../components/home/Hero";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductExplorer from "../components/home/ProductExplorer";
import SolutionsForEveryTeam from "../components/home/SolutionsForEveryTeam";
import HowItWorks from "../components/home/HowItWorks";
import TrustSection from "../components/home/TrustSection";
import FinalCTA from "../components/home/FinalCTA";

export default function Home() {
  return (
    <main id="main">
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

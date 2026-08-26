import Hero from "../components/home/Hero";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductExplorer from "../components/home/ProductExplorer";
import BusinessUseCases from "../components/home/BusinessUseCases";
import CorporateGifting from "../components/home/CorporateGifting";
import HowItWorks from "../components/home/HowItWorks";
import TrustSection from "../components/home/TrustSection";
import FinalCTA from "../components/home/FinalCTA";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <ProductExplorer />
      <CategoryGrid />
      <BusinessUseCases />
      <CorporateGifting />
      <HowItWorks />
      <TrustSection />
      <FinalCTA />
    </main>
  );
}

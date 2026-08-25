import Hero from "../components/home/Hero";
import CreationTypes from "../components/home/CreationTypes";
import CategoryGrid from "../components/home/CategoryGrid";
import TryYourLogo from "../components/home/TryYourLogo";
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
      <TryYourLogo />
      <CreationTypes />
      <BusinessUseCases />
      <CorporateGifting />
      <HowItWorks />
      <TrustSection />
      <FinalCTA />
    </main>
  );
}

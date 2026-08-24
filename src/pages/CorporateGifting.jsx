import { useEffect, useState } from "react";
import BrandingPackaging from "../components/gifting/BrandingPackaging";
import GiftCollections from "../components/gifting/GiftCollections";
import GiftingBenefits from "../components/gifting/GiftingBenefits";
import GiftingFinalCta from "../components/gifting/GiftingFinalCta";
import GiftingHero from "../components/gifting/GiftingHero";
import GiftingOccasions from "../components/gifting/GiftingOccasions";
import GiftingTrust from "../components/gifting/GiftingTrust";
import GiftingUseCases from "../components/gifting/GiftingUseCases";
import KitBuilder from "../components/gifting/KitBuilder";
import PopularGiftingProducts from "../components/gifting/PopularGiftingProducts";
import WelcomeKitFeature from "../components/gifting/WelcomeKitFeature";
import QuoteModal from "../components/product/QuoteModal";
import { kitDefaultQuantity } from "../data/corporateGiftingData";
import { buildKitQuotePayload } from "../utils/giftKit";

const EMPTY_QUOTE = { product: null, quantity: 0, quote: null, extraSummary: [] };

export default function CorporateGifting() {
  const [kitAudience, setKitAudience] = useState(null);
  const [kitItems, setKitItems] = useState([]);
  const [kitBudget, setKitBudget] = useState(null);
  const [kitQuantity, setKitQuantity] = useState(kitDefaultQuantity);

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePayload, setQuotePayload] = useState(EMPTY_QUOTE);

  useEffect(() => {
    document.title = "Corporate Gifting — PrimeLinor";
  }, []);

  const toggleKitItem = (id) => {
    setKitItems((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const openQuote = (payload) => {
    setQuotePayload(payload);
    setQuoteOpen(true);
  };

  const openKitQuote = () => {
    openQuote(
      buildKitQuotePayload({
        audience: kitAudience,
        items: kitItems,
        budget: kitBudget,
        quantity: kitQuantity,
      }),
    );
  };

  return (
    <main id="main">
      <GiftingHero onRequestQuote={openKitQuote} />
      <GiftingUseCases />
      <GiftCollections onRequestQuote={openQuote} />
      <WelcomeKitFeature />
      <KitBuilder
        audience={kitAudience}
        onAudience={setKitAudience}
        items={kitItems}
        onToggleItem={toggleKitItem}
        budget={kitBudget}
        onBudget={setKitBudget}
        quantity={kitQuantity}
        onQuantity={setKitQuantity}
        onRequestQuote={openKitQuote}
      />
      <PopularGiftingProducts />
      <GiftingOccasions />
      <BrandingPackaging onRequestQuote={openKitQuote} />
      <GiftingBenefits />
      <GiftingTrust />
      <GiftingFinalCta onRequestQuote={openKitQuote} />

      {quotePayload.product ? (
        <QuoteModal
          open={quoteOpen}
          onClose={() => setQuoteOpen(false)}
          product={quotePayload.product}
          quantity={quotePayload.quantity}
          quote={quotePayload.quote}
          extraSummary={quotePayload.extraSummary}
        />
      ) : null}
    </main>
  );
}

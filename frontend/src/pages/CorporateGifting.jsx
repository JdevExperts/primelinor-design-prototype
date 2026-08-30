import { useState } from "react";
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
import Seo from "../components/layout/Seo";
import { submitRfq } from "../api/rfqs";
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
      <Seo
        title="Corporate Gifting — Employee Welcome Kits & Client Gifts | PrimeLinor"
        description="Curated corporate gifting for employee welcome kits, festival gifting and client gifts — build a kit or request a quote for your team."
      />
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
          onSubmit={(contact) =>
            submitRfq({
              contact: {
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
                companyName: contact.company,
              },
              message: contact.notes,
              deliveryCity: contact.city,
              sourceType: "CORPORATE_GIFTING",
              // Corporate Gifting's kit/collection browsing is local mock
              // data, not fetched from the real catalogue (unlike PDP/
              // Listing) — every item here is submitted as a described
              // item rather than a productId lookup, since the frontend
              // can't guarantee the referenced slug exists as a real
              // backend Product. Structured context (audience/items/
              // budget, or a collection's contents) travels in
              // requirementData; no price is ever submitted.
              requirementData: {
                audience: kitAudience || undefined,
                kitItems: kitItems.length ? kitItems : undefined,
                budget: kitBudget || undefined,
                summary: quotePayload.extraSummary,
              },
              items: [
                {
                  description: `${quotePayload.product.name}${
                    quotePayload.extraSummary.length ? ` — ${quotePayload.extraSummary.join("; ")}` : ""
                  }`,
                  quantity: quotePayload.quantity || undefined,
                },
              ],
            })
          }
        />
      ) : null}
    </main>
  );
}

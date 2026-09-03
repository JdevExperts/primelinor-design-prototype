import { useEffect, useMemo, useState } from "react";
import GiftCollections from "../components/gifting/GiftCollections";
import GiftingBenefits from "../components/gifting/GiftingBenefits";
import GiftingFinalCta from "../components/gifting/GiftingFinalCta";
import GiftingHero from "../components/gifting/GiftingHero";
import GiftingUseCases from "../components/gifting/GiftingUseCases";
import KitBuilder from "../components/gifting/KitBuilder";
import PopularGiftingProducts from "../components/gifting/PopularGiftingProducts";
import WelcomeKitFeature from "../components/gifting/WelcomeKitFeature";
import QuoteModal from "../components/product/QuoteModal";
import Seo from "../components/layout/Seo";
import { getCategories, getProducts } from "../api/catalog";
import { submitRfq } from "../api/rfqs";
import { kitDefaultQuantity } from "../data/corporateGiftingData";
import { buildKitQuotePayload } from "../utils/giftKit";
import { indexCategoryImages, indexProductsBySlug } from "../utils/giftingCatalogue";

const EMPTY_QUOTE = { product: null, quantity: 0, quote: null, extraSummary: [] };

/**
 * Corporate Gifting is a curated view over the ONE Product catalogue. The
 * page loads the real product + category data once (same public APIs as the
 * Products listing) and hands every product/category-backed section the
 * canonical records to resolve its curation slugs against — so images,
 * codes and prices here always match the Products tab. A load failure
 * degrades to the composed placeholders rather than a broken page.
 */
export default function CorporateGifting() {
  const [kitAudience, setKitAudience] = useState(null);
  const [kitItems, setKitItems] = useState([]);
  const [kitBudget, setKitBudget] = useState(null);
  const [kitQuantity, setKitQuantity] = useState(kitDefaultQuantity);

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePayload, setQuotePayload] = useState(EMPTY_QUOTE);

  const [catalogue, setCatalogue] = useState({ products: [], categories: [] });

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProducts({ limit: 100 }), getCategories()])
      .then(([productsResult, categories]) => {
        if (cancelled) return;
        setCatalogue({ products: productsResult.products || [], categories: categories || [] });
      })
      .catch(() => {
        // Keep the page usable — every section falls back to its placeholder.
        if (!cancelled) setCatalogue({ products: [], categories: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const productsBySlug = useMemo(() => indexProductsBySlug(catalogue.products), [catalogue.products]);
  const categoryImages = useMemo(() => indexCategoryImages(catalogue.categories), [catalogue.categories]);
  const resolverContext = useMemo(
    () => ({ productsBySlug, categoryImages }),
    [productsBySlug, categoryImages],
  );

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
      <GiftingHero onRequestQuote={openKitQuote} resolverContext={resolverContext} />
      <GiftingUseCases resolverContext={resolverContext} />
      <GiftCollections onRequestQuote={openQuote} productsBySlug={productsBySlug} />
      <WelcomeKitFeature productsBySlug={productsBySlug} />
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
      <PopularGiftingProducts productsBySlug={productsBySlug} />
      <GiftingBenefits />
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
              // A curated collection card passes a real catalogue product
              // (its slug is the public RFQ item's `productId`); a custom
              // Build-Your-Kit request has no SKU yet, so it travels as a
              // described item plus structured context (audience / item
              // types / budget) that the team prices.
              requirementData: {
                audience: kitAudience || undefined,
                kitItems: kitItems.length ? kitItems : undefined,
                budget: kitBudget || undefined,
                summary: quotePayload.extraSummary,
              },
              items: [
                {
                  ...(quotePayload.productSlug
                    ? { productId: quotePayload.productSlug }
                    : {
                        description: `${quotePayload.product.name}${
                          quotePayload.extraSummary.length
                            ? ` — ${quotePayload.extraSummary.join("; ")}`
                            : ""
                        }`,
                      }),
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

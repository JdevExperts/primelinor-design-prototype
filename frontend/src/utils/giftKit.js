import {
  giftKitItems,
  kitAudiences,
  kitBudgetOptions,
} from "../data/corporateGiftingData";

export const audienceLabelById = Object.fromEntries(
  kitAudiences.map((item) => [item.id, item.label]),
);
export const itemLabelById = Object.fromEntries(
  giftKitItems.map((item) => [item.id, item.label]),
);
export const budgetLabelById = Object.fromEntries(
  kitBudgetOptions.map((item) => [item.id, item.label]),
);

const KIT_QUOTE = {
  kind: "quote",
  unitPrice: null,
  total: null,
  rangeNote: null,
  headline: "Price on request",
};

/**
 * Builds the QuoteModal payload for a custom (Build Your Kit) request.
 * Never computes a price — see the "no fake kit pricing engine" rule in the
 * Corporate Gifting brief. The team prices it after the enquiry.
 */
export function buildKitQuotePayload({ audience, items, budget, quantity }) {
  return {
    product: {
      name: items.length ? "Custom Corporate Kit" : "Corporate Gifting Enquiry",
      unit: "kit",
    },
    quantity,
    quote: KIT_QUOTE,
    extraSummary: [
      audience ? `For: ${audienceLabelById[audience]}` : null,
      items.length
        ? `Items: ${items.map((id) => itemLabelById[id]).join(", ")}`
        : null,
      budget ? `Budget: ${budgetLabelById[budget]}` : null,
    ].filter(Boolean),
  };
}

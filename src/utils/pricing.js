export function formatInr(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function pluralUnit(unit, count = 2) {
  if (count === 1) return unit;
  if (unit === "piece") return "pieces";
  if (unit.endsWith("s")) return unit;
  return `${unit}s`;
}

export function findTier(product, quantity) {
  if (!product.tiers?.length) return null;
  return (
    product.tiers.find((tier) => {
      if (quantity < tier.from) return false;
      if (tier.to == null) return true;
      return quantity <= tier.to;
    }) || null
  );
}

export function quoteForQuantity(product, quantity) {
  if (product.priceType === "quote") {
    return {
      kind: "quote",
      unitPrice: null,
      total: null,
      rangeNote: null,
      headline: "Price on request",
    };
  }

  const tier = findTier(product, quantity);

  if (product.priceType === "tiered") {
    if (!tier || tier.price == null) {
      return {
        kind: "volume-quote",
        unitPrice: null,
        total: null,
        rangeNote: null,
        headline: "Custom volume pricing",
      };
    }

    const range =
      tier.to == null
        ? `${tier.from}+ ${pluralUnit(product.unit)}`
        : `${tier.from}–${tier.to} ${pluralUnit(product.unit)}`;

    return {
      kind: "priced",
      unitPrice: tier.price,
      total: tier.price * quantity,
      rangeNote: `for ${range}`,
      headline: null,
    };
  }

  if (product.price != null) {
    return {
      kind: "priced",
      unitPrice: product.price,
      total: product.price * quantity,
      rangeNote: null,
      headline: null,
    };
  }

  return {
    kind: "quote",
    unitPrice: null,
    total: null,
    rangeNote: null,
    headline: "Price on request",
  };
}

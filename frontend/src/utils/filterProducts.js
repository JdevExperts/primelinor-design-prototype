import {
  listingCategories,
  listingFilterOptions,
  productColors,
} from "../data/mockData";

export const EMPTY_FILTERS = {
  categories: [],
  materials: [],
  gsm: [],
  colors: [],
  moq: [],
  price: [],
  useCases: [],
  customizable: false,
};

const categoryLabelById = Object.fromEntries(
  listingCategories.map((item) => [item.id, item.label]),
);

const materialLabelById = Object.fromEntries(
  listingFilterOptions.materials.map((item) => [item.id, item.label]),
);

const gsmById = Object.fromEntries(
  listingFilterOptions.gsm.map((item) => [item.id, item]),
);

const moqById = Object.fromEntries(
  listingFilterOptions.moq.map((item) => [item.id, item]),
);

const priceById = Object.fromEntries(
  listingFilterOptions.price.map((item) => [item.id, item]),
);

const useCaseLabelById = Object.fromEntries(
  listingFilterOptions.useCases.map((item) => [item.id, item.label]),
);

function inBand(value, band) {
  if (value == null || band == null || band.quote) return false;
  if (value < band.min) return false;
  if (band.max == null) return true;
  return value <= band.max;
}

function matchesAnyBand(value, selectedIds, lookup) {
  return selectedIds.some((id) => inBand(value, lookup[id]));
}

export function toggleId(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function countActiveFilters(filters) {
  return (
    filters.categories.length +
    filters.materials.length +
    filters.gsm.length +
    filters.colors.length +
    filters.moq.length +
    filters.price.length +
    filters.useCases.length +
    (filters.customizable ? 1 : 0)
  );
}

export function hasActiveFilters(filters) {
  return countActiveFilters(filters) > 0;
}

export function getActiveFilterChips(filters) {
  const chips = [];

  filters.categories.forEach((id) => {
    chips.push({
      key: `categories:${id}`,
      group: "categories",
      id,
      label: categoryLabelById[id] || id,
    });
  });

  filters.materials.forEach((id) => {
    chips.push({
      key: `materials:${id}`,
      group: "materials",
      id,
      label: materialLabelById[id] || id,
    });
  });

  filters.gsm.forEach((id) => {
    chips.push({
      key: `gsm:${id}`,
      group: "gsm",
      id,
      label: gsmById[id]?.label || id,
    });
  });

  filters.colors.forEach((id) => {
    chips.push({
      key: `colors:${id}`,
      group: "colors",
      id,
      label: productColors[id]?.label || id,
    });
  });

  filters.moq.forEach((id) => {
    chips.push({
      key: `moq:${id}`,
      group: "moq",
      id,
      label: `MOQ ${moqById[id]?.label || id}`,
    });
  });

  filters.price.forEach((id) => {
    chips.push({
      key: `price:${id}`,
      group: "price",
      id,
      label: priceById[id]?.label || id,
    });
  });

  filters.useCases.forEach((id) => {
    chips.push({
      key: `useCases:${id}`,
      group: "useCases",
      id,
      label: useCaseLabelById[id] || id,
    });
  });

  if (filters.customizable) {
    chips.push({
      key: "customizable",
      group: "customizable",
      id: true,
      label: "Customizable",
    });
  }

  return chips;
}

export function filterProducts(products, filters, query) {
  const needle = query.trim().toLowerCase();

  return products.filter((product) => {
    if (
      filters.categories.length &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }

    if (
      filters.materials.length &&
      !filters.materials.includes(product.material)
    ) {
      return false;
    }

    if (
      filters.gsm.length &&
      !matchesAnyBand(product.gsm, filters.gsm, gsmById)
    ) {
      return false;
    }

    if (filters.colors.length) {
      const colors = product.colors || [];
      if (!filters.colors.some((id) => colors.includes(id))) return false;
    }

    if (
      filters.moq.length &&
      !matchesAnyBand(product.moq, filters.moq, moqById)
    ) {
      return false;
    }

    if (filters.price.length) {
      const selected = filters.price.map((id) => priceById[id]).filter(Boolean);
      const quoteMatch =
        selected.some((band) => band.quote) && product.priceType === "quote";
      const amountMatch = selected.some((band) => inBand(product.price, band));
      if (!quoteMatch && !amountMatch) return false;
    }

    if (filters.useCases.length) {
      const uses = product.useCases || [];
      if (!filters.useCases.some((id) => uses.includes(id))) return false;
    }

    if (filters.customizable && !product.customizable) return false;

    if (needle) {
      const category = categoryLabelById[product.category] || "";
      const haystack = `${product.name} ${product.spec} ${category}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });
}

export function sortProducts(products, sortId) {
  const list = [...products];

  const byName = (a, b) => a.name.localeCompare(b.name);

  switch (sortId) {
    case "price-asc":
      return list.sort((a, b) => {
        if (a.price == null && b.price == null) return byName(a, b);
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return a.price - b.price || byName(a, b);
      });
    case "price-desc":
      return list.sort((a, b) => {
        if (a.price == null && b.price == null) return byName(a, b);
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return b.price - a.price || byName(a, b);
      });
    case "moq-asc":
      return list.sort((a, b) => a.moq - b.moq || byName(a, b));
    case "newest":
      return list.sort(
        (a, b) => (b.added || 0) - (a.added || 0) || byName(a, b),
      );
    case "recommended":
    default:
      return list.sort(
        (a, b) =>
          (a.recommended || 99) - (b.recommended || 99) || byName(a, b),
      );
  }
}

export function pageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
    .reduce((list, page, index, source) => {
      if (index > 0 && page - source[index - 1] > 1) list.push("ellipsis");
      list.push(page);
      return list;
    }, []);
}

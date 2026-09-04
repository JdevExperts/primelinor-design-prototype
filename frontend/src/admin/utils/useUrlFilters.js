import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Small helper so an admin list page's filters live in the URL query
 * string. This makes dashboard deep-links (e.g. /admin/rfqs?status=NEW or
 * ?dateFrom=…&dateTo=…) work out of the box, and browser Back/Forward
 * restores the previous filter state with no custom navigation code.
 *
 *   const { value, patch } = useUrlFilters();
 *   const status = value("status");
 *   <select value={status} onChange={(e) => patch({ status: e.target.value, page: null })} />
 */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams();

  const value = useCallback((key, fallback = "") => params.get(key) ?? fallback, [params]);

  const patch = useCallback(
    (updates, { replace = true } = {}) => {
      const next = new URLSearchParams(params);
      for (const [key, val] of Object.entries(updates)) {
        if (val === "" || val === null || val === undefined) next.delete(key);
        else next.set(key, String(val));
      }
      setParams(next, { replace });
    },
    [params, setParams],
  );

  return { params, value, patch };
}

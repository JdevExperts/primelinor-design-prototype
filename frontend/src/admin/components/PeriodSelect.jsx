/**
 * Time-period dropdown for an admin list — the last control in the filter
 * row. Reads/writes `?period=` (default 30d); the backend applies the
 * trailing window to createdAt (or, for quotations, to thread creation).
 * Rendered as a bare <select> so it inherits the list's `.filters select`
 * styling.
 */
const PERIODS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "1y", label: "1 Year" },
];

export default function PeriodSelect({ value = "30d", onChange, disabled = false }) {
  const safe = PERIODS.some((p) => p.key === value) ? value : "30d";
  return (
    <select
      value={safe}
      disabled={disabled}
      aria-label="Time period"
      onChange={(event) => onChange(event.target.value)}
    >
      {PERIODS.map((p) => (
        <option key={p.key} value={p.key}>
          {p.label}
        </option>
      ))}
    </select>
  );
}

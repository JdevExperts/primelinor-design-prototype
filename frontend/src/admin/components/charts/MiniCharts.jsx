/**
 * Dependency-free inline-SVG charts for the Admin dashboard. Deliberately
 * minimal (§36) — a line trend, paired bars, a funnel and a donut. All
 * theme-neutral, all responsive via viewBox.
 */

const NAVY = "#0f1b2d";
const MUSTARD = "#e1ad01";
const GREY = "#cbd2dc";

/** Single-series area/line trend. data: number[] */
export function Sparkline({ data = [], height = 60, stroke = NAVY, fill = "rgba(15,27,45,0.08)" }) {
  const pts = data.map((v) => Number(v) || 0);
  if (pts.length < 2) return <div style={{ height, fontSize: 12, color: "#98a2b3" }}>Not enough data yet</div>;
  const max = Math.max(...pts, 1);
  const w = 100;
  const step = w / (pts.length - 1);
  const coords = pts.map((v, i) => [i * step, height - (v / max) * (height - 6) - 3]);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${w},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Integer Y-axis ticks with an adaptive step (1/2/5/10/…). */
export function integerTicks(rawMax) {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000];
  const step = steps.find((s) => rawMax / s <= 5) || Math.ceil(rawMax / 5);
  const yMax = Math.max(step, Math.ceil(rawMax / step) * step);
  const ticks = [];
  for (let t = 0; t <= yMax + 1e-9; t += step) ticks.push(Math.round(t));
  return { yMax, ticks };
}

/**
 * Grouped daily bar chart with real X (date) and Y (integer count) axes,
 * gridlines, adaptive X-label density, a per-day hover tooltip (native
 * SVG <title>, no library) and a legend.
 *   dates:  ["YYYY-MM-DD", …]
 *   series: [{ label, color, data:number[] }]
 */
export function GroupedBarChart({ dates = [], series = [], height = 200 }) {
  const n = dates.length;
  if (!n) return <div style={{ height, fontSize: 12, color: "#98a2b3" }}>No data in this period</div>;

  const PAD_L = 30;
  const PAD_R = 6;
  const PAD_T = 8;
  const PAD_B = 24;
  const chartW = Math.max(560, n * 14 + PAD_L + PAD_R);
  const plotW = chartW - PAD_L - PAD_R;
  const plotH = height - PAD_T - PAD_B;

  const rawMax = Math.max(1, ...series.flatMap((s) => s.data.map((v) => Number(v) || 0)));
  const { yMax, ticks } = integerTicks(rawMax);

  const groupW = plotW / n;
  const barCount = Math.max(series.length, 1);
  const barW = Math.max(1.5, Math.min((groupW * 0.72) / barCount, 10));
  const y = (v) => PAD_T + plotH - (v / yMax) * plotH;
  const labelEvery = Math.max(1, Math.round(n / 7));

  const fmtDay = (iso) => {
    const dt = new Date(iso);
    return Number.isNaN(dt.getTime()) ? iso : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };
  const fmtFull = (iso) => {
    const dt = new Date(iso);
    return Number.isNaN(dt.getTime())
      ? iso
      : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${chartW} ${height}`}
          style={{ width: "100%", minWidth: Math.min(chartW, 560), height, display: "block" }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD_L} x2={chartW - PAD_R} y1={y(t)} y2={y(t)} stroke="#eef2f6" strokeWidth="1" />
              <text x={PAD_L - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#98a2b3">
                {t}
              </text>
            </g>
          ))}
          <line x1={PAD_L} x2={chartW - PAD_R} y1={y(0)} y2={y(0)} stroke="#cbd2dc" strokeWidth="1" />

          {dates.map((iso, gi) => {
            const gx = PAD_L + gi * groupW;
            const innerX = gx + (groupW - barW * barCount) / 2;
            return (
              <g key={iso}>
                <rect x={gx} y={PAD_T} width={groupW} height={plotH} fill="transparent">
                  <title>
                    {`${fmtFull(iso)}\n${series.map((s) => `${s.label}: ${Number(s.data[gi]) || 0}`).join("\n")}`}
                  </title>
                </rect>
                {series.map((s, si) => {
                  const v = Number(s.data[gi]) || 0;
                  return (
                    <rect
                      key={si}
                      x={innerX + si * barW}
                      y={y(v)}
                      width={Math.max(barW - 1, 1)}
                      height={Math.max(0, y(0) - y(v))}
                      fill={s.color}
                      rx="1"
                    />
                  );
                })}
                {gi % labelEvery === 0 || gi === n - 1 ? (
                  <text x={gx + groupW / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="#667085">
                    {fmtDay(iso)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11, color: "#667085", flexWrap: "wrap" }}>
        {series.map((s) => (
          <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 9, height: 9, background: s.color, borderRadius: 2, display: "inline-block" }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Two-series daily bars. series: [{label, color, data:number[]}], labels: string[] */
export function PairedBars({ series = [], labels = [], height = 120 }) {
  const groups = labels.length;
  if (!groups) return <div style={{ height, fontSize: 12, color: "#98a2b3" }}>No data in this period</div>;
  const allVals = series.flatMap((s) => s.data.map((v) => Number(v) || 0));
  const max = Math.max(...allVals, 1);
  const w = Math.max(groups * 14, 100);
  const gw = w / groups;
  const bw = Math.min(gw / (series.length + 1), 8);
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", minWidth: Math.min(groups * 12, 640), height }}>
        {labels.map((_, gi) =>
          series.map((s, si) => {
            const v = Number(s.data[gi]) || 0;
            const barH = (v / max) * (height - 16);
            const x = gi * gw + si * bw + (gw - bw * series.length) / 2;
            return (
              <rect
                key={`${gi}-${si}`}
                x={x}
                y={height - 12 - barH}
                width={Math.max(bw - 1, 1)}
                height={barH}
                fill={s.color}
                rx="1"
              />
            );
          }),
        )}
      </svg>
      <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: 11, color: "#667085" }}>
        {series.map((s) => (
          <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 9, height: 9, background: s.color, borderRadius: 2, display: "inline-block" }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Horizontal funnel. stages: [{label, value}] */
export function Funnel({ stages = [] }) {
  const top = Math.max(...stages.map((s) => Number(s.value) || 0), 1);
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {stages.map((s, i) => {
        const v = Number(s.value) || 0;
        const pct = Math.round((v / top) * 100);
        const prev = i > 0 ? Number(stages[i - 1].value) || 0 : null;
        const drop = prev != null && prev > 0 ? Math.round((v / prev) * 100) : null;
        return (
          <div key={s.label} style={{ display: "grid", gridTemplateColumns: "150px 1fr auto", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#475467" }}>{s.label}</span>
            <span style={{ background: "#eef2f6", borderRadius: 4, height: 20, position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${Math.max(pct, 2)}%`,
                  background: i === stages.length - 1 ? MUSTARD : NAVY,
                  borderRadius: 4,
                }}
              />
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, minWidth: 96, textAlign: "right" }}>
              {v.toLocaleString("en-IN")}
              {drop != null ? <span style={{ color: "#98a2b3", fontWeight: 400 }}> · {drop}%</span> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Device donut. slices: [{label, value, color}] */
export function Donut({ slices = [], size = 120 }) {
  const total = slices.reduce((a, b) => a + (Number(b.value) || 0), 0);
  if (!total) return <div style={{ fontSize: 12, color: "#98a2b3" }}>No visitors yet</div>;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const positive = slices.filter((s) => Number(s.value) > 0);
  const arcs = positive.map((s, i) => {
    const start = positive.slice(0, i).reduce((sum, x) => sum + (Number(x.value) || 0), 0) / total;
    const frac = (Number(s.value) || 0) / total;
    const a0 = start * 2 * Math.PI - Math.PI / 2;
    const a1 = (start + frac) * 2 * Math.PI - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return { d: `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`, color: s.color, label: s.label, frac };
  });
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
        {arcs.map((a) => (
          <path key={a.label} d={a.d} fill={a.color} stroke="#fff" strokeWidth="1" />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#fff" />
      </svg>
      <div style={{ display: "grid", gap: 3, fontSize: 12 }}>
        {slices.map((s) => (
          <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#475467" }}>
            <span style={{ width: 9, height: 9, background: s.color, borderRadius: 2, display: "inline-block" }} />
            {s.label} · {total ? Math.round(((Number(s.value) || 0) / total) * 100) : 0}%
          </span>
        ))}
      </div>
    </div>
  );
}

export const CHART_COLORS = {
  NAVY,
  MUSTARD,
  GREY,
  LEADS: "#5b7fb9", // muted blue
  MOBILE: "#0f1b2d",
  DESKTOP: "#e1ad01",
  TABLET: "#7c93ad",
  OTHER: "#cbd2dc",
};

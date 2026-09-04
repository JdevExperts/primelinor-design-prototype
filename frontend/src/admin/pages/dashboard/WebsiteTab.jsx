import { MetricCard, Panel, fmt } from "./parts";
import { Sparkline, PairedBars, Donut, Funnel, CHART_COLORS } from "../../components/charts/MiniCharts";
import styles from "./dashboard.module.css";

export default function WebsiteTab({ data }) {
  const trend = data.trafficTrend || [];
  const labels = trend.map((d) => d.date.slice(5));
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className={styles.cardGrid}>
        {data.metrics.map((m) => (
          <MetricCard key={m.key} label={m.label} value={m.value} prev={m.prev} changePct={m.changePct} />
        ))}
      </div>

      <div className={styles.two}>
        <Panel title="Traffic trend" note="Daily unique visitors and page views">
          <Sparkline data={trend.map((d) => d.visitors)} />
          <PairedBars
            labels={labels}
            series={[
              { label: "Visitors", color: CHART_COLORS.NAVY, data: trend.map((d) => d.visitors) },
              { label: "Page views", color: CHART_COLORS.MUSTARD, data: trend.map((d) => d.pageViews) },
            ]}
          />
        </Panel>
        <Panel title="Device (approx.)">
          <Donut
            slices={[
              { label: "Mobile", value: data.device.counts.MOBILE, color: CHART_COLORS.MOBILE },
              { label: "Desktop", value: data.device.counts.DESKTOP, color: CHART_COLORS.DESKTOP },
              { label: "Tablet", value: data.device.counts.TABLET, color: CHART_COLORS.TABLET },
              { label: "Other", value: data.device.counts.OTHER, color: CHART_COLORS.OTHER },
            ]}
          />
        </Panel>
      </div>

      <div className={styles.two}>
        <Panel title="Referral / source" note="Attribution shown only where a referrer or UTM was present.">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Source</th>
                <th className={styles.num}>Visitors</th>
              </tr>
            </thead>
            <tbody>
              {data.referrers.length ? (
                data.referrers.map((r) => (
                  <tr key={r.source}>
                    <td>{r.source}</td>
                    <td className={styles.num}>{fmt(r.visitors)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className={styles.muted}>
                    No traffic yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
        <Panel title="Top pages">
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Page</th>
                  <th className={styles.num}>Views</th>
                  <th className={styles.num}>Unique</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.length ? (
                  data.topPages.map((p) => (
                    <tr key={p.path}>
                      <td>{p.path}</td>
                      <td className={styles.num}>{fmt(p.views)}</td>
                      <td className={styles.num}>{fmt(p.uniqueVisitors)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className={styles.muted}>
                      No page views yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className={styles.two}>
        <Panel title="Top searches">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Query</th>
                <th className={styles.num}>Searches</th>
                <th className={styles.num}>Results</th>
              </tr>
            </thead>
            <tbody>
              {data.search.top.length ? (
                data.search.top.map((s) => (
                  <tr key={s.query}>
                    <td>{s.query}</td>
                    <td className={styles.num}>{fmt(s.searches)}</td>
                    <td className={styles.num}>{fmt(s.lastResultCount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.muted}>
                    No searches yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
        <Panel title="Zero-result searches" note="Commercially useful — candidates for new catalogue products.">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Query</th>
                <th className={styles.num}>Searches</th>
                <th className={styles.num}>Results</th>
              </tr>
            </thead>
            <tbody>
              {data.search.zeroResult.length ? (
                data.search.zeroResult.map((s) => (
                  <tr key={s.query}>
                    <td>{s.query}</td>
                    <td className={styles.num}>{fmt(s.searches)}</td>
                    <td className={styles.num}>0</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.muted}>
                    None — every search returned results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel
        title="Approximate location"
        note={
          data.geo.hasGeo
            ? "Derived from an edge/proxy country header — approximate, never exact."
            : "No geo provider configured — country/state/city are not being recorded yet."
        }
      >
        {data.geo.hasGeo ? (
          <div className={styles.two}>
            <GeoList title="Top cities" rows={data.geo.topCities} />
            <GeoList title="Top states" rows={data.geo.topStates} />
            <GeoList title="Countries" rows={data.geo.topCountries} />
          </div>
        ) : (
          <p className={styles.muted} style={{ margin: 0, fontSize: 13 }}>
            Approximate geography will appear here once the hosting/CDN passes a country header (or a geo
            provider is configured in a later phase).
          </p>
        )}
      </Panel>

      <Panel title={data.funnel.label} note={data.funnel.note}>
        <Funnel stages={data.funnel.stages} />
      </Panel>
    </div>
  );
}

function GeoList({ title, rows }) {
  return (
    <div>
      <p className={styles.cardLabel} style={{ marginBottom: 6 }}>
        {title}
      </p>
      {rows.length ? (
        <table className={styles.table}>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td className={styles.num}>{fmt(r.visitors)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.muted} style={{ fontSize: 12 }}>
          —
        </p>
      )}
    </div>
  );
}

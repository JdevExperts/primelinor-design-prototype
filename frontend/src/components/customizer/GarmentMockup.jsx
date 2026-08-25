import { useId } from "react";
import { isLight, mix } from "../../utils/color";
import styles from "./GarmentMockup.module.css";

/**
 * Controlled product mockups for the customization preview.
 *
 * Separate from ui/ProductVisual on purpose. ProductVisual normalises assorted
 * products into one catalogue-friendly footprint, which is the wrong trade-off
 * here — a print preview needs stable, predictable garment geometry instead.
 *
 * Every mockup is drawn inside the same VIEW_BOX with a consistent front-facing
 * (or back-facing) construction, so the print zones in mockData address the same
 * coordinate space no matter which product or view is showing. Nothing here is
 * scaled or re-fitted per product.
 */

const VIEW_BOX = { w: 200, h: 220 };

/**
 * Geometry, in viewBox units, is deliberately spelled out per garment:
 *
 *   shoulder seam y=26/44 · armpit y=88/100 · hem y=192/198
 *   body 46–154 wide at the chest, so 100 is the centre seam
 *
 * The armhole seams are drawn as visible construction lines. Without them the
 * body and sleeve read as one mass and a chest print looks like it is floating
 * on the sleeve.
 */

/* Shared silhouette for the tee and polo — same block, different detailing */
const TEE_BODY =
  "M82 26 C74 26 66 29 60 34 L16 56 L24 96 L46 88 L44 192 " +
  "Q100 199 156 192 L154 88 L176 96 L184 56 L140 34 " +
  "C134 29 126 26 118 26 Z";
const TEE_ARMHOLES = "M60 34 Q50 58 46 88 M140 34 Q150 58 154 88";

/* Long sleeves reaching the hip, unlike the tee block */
const HOODIE_BODY =
  "M76 46 L22 72 L14 152 L40 160 L48 104 L44 200 " +
  "Q100 207 156 200 L152 104 L160 160 L186 152 L178 72 L124 46 Z";
const HOODIE_ARMHOLES = "M76 48 Q56 72 48 104 M124 48 Q144 72 152 104";

const TOTE_BODY =
  "M44 74 L156 74 A5 5 0 0 1 161 79 L165 196 A6 6 0 0 1 159 202 " +
  "L41 202 A6 6 0 0 1 35 196 L39 79 A5 5 0 0 1 44 74 Z";

/**
 * One shading pass over the whole silhouette rather than per-panel masks.
 * Half-body masks left a visible step at the armhole and made the sleeves read
 * as detached; a single sweep keeps the garment one solid object. The stops are
 * plain white/black so every product colour shades identically.
 */
function Shading({ d, uid, outline }) {
  return (
    <>
      <path d={d} fill={`url(#${uid}h)`} />
      <path d={d} fill={`url(#${uid}v)`} />
      <path
        d={d}
        fill="none"
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </>
  );
}

const MOCKUPS = {
  tshirt: {
    hem: 196,
    shadow: 56,
    draw: (p, view) => (
      <>
        <path d={TEE_BODY} fill={p.base} />
        <Shading d={TEE_BODY} uid={p.uid} outline={p.outline} />
        <path d={TEE_ARMHOLES} fill="none" stroke={p.line} strokeWidth="1.5" />
        <path
          d="M24 96 L46 88 M176 96 L154 88"
          fill="none"
          stroke={p.line}
          strokeWidth="1.4"
          opacity="0.7"
        />

        {view === "front" ? (
          <>
            <path d="M82 26 Q100 46 118 26" fill={p.soft} />
            <path
              d="M82 26 Q100 46 118 26"
              fill="none"
              stroke={p.line}
              strokeWidth="4"
            />
          </>
        ) : (
          <>
            <path d="M82 26 Q100 36 118 26" fill={p.soft} />
            <path
              d="M82 26 Q100 36 118 26"
              fill="none"
              stroke={p.line}
              strokeWidth="4"
            />
            <path
              d="M60 34 Q100 50 140 34"
              fill="none"
              stroke={p.line}
              strokeWidth="1.4"
              opacity="0.6"
            />
          </>
        )}
        <path
          d="M44 192 Q100 199 156 192"
          fill="none"
          stroke={p.line}
          strokeWidth="1.4"
          opacity="0.55"
        />
      </>
    ),
  },

  polo: {
    hem: 196,
    shadow: 56,
    draw: (p, view) => (
      <>
        <path d={TEE_BODY} fill={p.base} />
        <Shading d={TEE_BODY} uid={p.uid} outline={p.outline} />
        <path d={TEE_ARMHOLES} fill="none" stroke={p.line} strokeWidth="1.5" />
        <path
          d="M24 96 L46 88 M176 96 L154 88"
          fill="none"
          stroke={p.line}
          strokeWidth="1.4"
          opacity="0.7"
        />

        {view === "front" ? (
          <>
            {/* placket first, fold-down collar layered over its top */}
            <path d="M94 33 L106 33 L106 94 L94 94 Z" fill={p.soft} />
            <path
              d="M94 33 L94 94 M106 33 L106 94"
              fill="none"
              stroke={p.line}
              strokeWidth="1.3"
            />
            <circle cx="100" cy="52" r="2.4" fill={p.line} />
            <circle cx="100" cy="72" r="2.4" fill={p.line} />
            <path
              d="M72 16 L100 50 L128 16 L112 16 L100 31 L88 16 Z"
              fill={p.soft}
            />
            <path
              d="M72 16 L100 50 L128 16 L112 16 L100 31 L88 16 Z"
              fill="none"
              stroke={p.line}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <path d="M80 20 Q100 36 120 20 L120 30 Q100 46 80 30 Z" fill={p.soft} />
            <path
              d="M80 20 Q100 36 120 20 M80 30 Q100 46 120 30"
              fill="none"
              stroke={p.line}
              strokeWidth="1.5"
            />
            <path
              d="M60 38 Q100 54 140 38"
              fill="none"
              stroke={p.line}
              strokeWidth="1.4"
              opacity="0.6"
            />
          </>
        )}
        <path
          d="M44 192 Q100 199 156 192"
          fill="none"
          stroke={p.line}
          strokeWidth="1.4"
          opacity="0.55"
        />
      </>
    ),
  },

  hoodie: {
    hem: 202,
    shadow: 60,
    draw: (p, view) => (
      <>
        <path d={HOODIE_BODY} fill={p.base} />
        <Shading d={HOODIE_BODY} uid={p.uid} outline={p.outline} />
        <path d={HOODIE_ARMHOLES} fill="none" stroke={p.line} strokeWidth="1.5" />
        {/* ribbed cuffs and hem */}
        <path
          d="M15 144 L41 152 M185 144 L159 152"
          fill="none"
          stroke={p.line}
          strokeWidth="2"
          opacity="0.7"
        />
        <path
          d="M44 188 Q100 195 156 188"
          fill="none"
          stroke={p.line}
          strokeWidth="2"
          opacity="0.7"
        />

        <path
          d="M76 44 C76 22 86 12 100 12 C114 12 124 22 124 44 C116 54 110 58 100 58 C90 58 84 54 76 44 Z"
          fill={p.base}
        />
        <path
          d="M76 44 C76 22 86 12 100 12 C114 12 124 22 124 44 C116 54 110 58 100 58 C90 58 84 54 76 44 Z"
          fill="none"
          stroke={p.outline}
          strokeWidth="1.4"
        />
        {view === "front" ? (
          <>
            <path
              d="M83 44 C83 27 90 20 100 20 C110 20 117 27 117 44 C111 51 106 54 100 54 C94 54 89 51 83 44 Z"
              fill={p.dark}
              opacity="0.44"
            />
            <path
              d="M92 54 L92 82 M109 54 L109 78"
              fill="none"
              stroke={p.line}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M66 134 L134 134 A4 4 0 0 1 138 138 L138 170 L62 170 L62 138 A4 4 0 0 1 66 134 Z"
              fill={p.dark}
              opacity="0.13"
            />
            <path
              d="M66 134 L134 134 A4 4 0 0 1 138 138 L138 170 L62 170 L62 138 A4 4 0 0 1 66 134 Z"
              fill="none"
              stroke={p.line}
              strokeWidth="1.8"
            />
          </>
        ) : (
          <>
            <path
              d="M76 44 C84 52 90 56 100 56 C110 56 116 52 124 44"
              fill="none"
              stroke={p.line}
              strokeWidth="2"
            />
            <path
              d="M62 58 Q100 72 138 58"
              fill="none"
              stroke={p.line}
              strokeWidth="1.4"
              opacity="0.6"
            />
          </>
        )}
      </>
    ),
  },

  tote: {
    hem: 202,
    shadow: 58,
    draw: (p) => (
      <>
        <path
          d="M70 78 C70 40 80 26 100 26 C120 26 130 40 130 78"
          fill="none"
          stroke={p.dark}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path d={TOTE_BODY} fill={p.base} />
        <Shading d={TOTE_BODY} uid={p.uid} outline={p.outline} />
        <path
          d="M37 92 L163 92"
          stroke={p.line}
          strokeWidth="1.6"
          opacity="0.55"
        />
      </>
    ),
  },
};

export default function GarmentMockup({
  mockup = "tshirt",
  color = "#e8eaee",
  view = "front",
  label = "",
  children,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pale = isLight(color);
  const spec = MOCKUPS[mockup] || MOCKUPS.tshirt;

  const palette = {
    uid,
    base: color,
    soft: mix(color, pale ? "dark" : "light", pale ? 0.07 : 0.09),
    dark: mix(color, "dark", pale ? 0.2 : 0.34),
    line: pale ? "rgba(15, 27, 45, 0.22)" : "rgba(255, 255, 255, 0.32)",
    // Keeps a white garment legible against the studio floor
    outline: pale ? "rgba(15, 27, 45, 0.2)" : "rgba(15, 27, 45, 0.34)",
  };

  return (
    <div
      className={styles.surface}
      style={{ "--mockup-ratio": `${VIEW_BOX.w} / ${VIEW_BOX.h}` }}
    >
      <svg
        className={styles.art}
        viewBox={`0 0 ${VIEW_BOX.w} ${VIEW_BOX.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
      >
        <defs>
          {/* horizontal roll, then a soft fall-off toward the hem */}
          <linearGradient id={`${uid}h`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
            <stop offset="20%" stopColor="#ffffff" stopOpacity="0.13" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="72%" stopColor="#000000" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.19" />
          </linearGradient>
          <linearGradient id={`${uid}v`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="62%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.11" />
          </linearGradient>
          <radialGradient id={`${uid}s`}>
            <stop offset="0%" stopColor="#0f1b2d" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#0f1b2d" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#0f1b2d" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse
          cx="100"
          cy={spec.hem + 8}
          rx={spec.shadow}
          ry={spec.shadow * 0.17}
          fill={`url(#${uid}s)`}
        />

        {spec.draw(palette, view)}
      </svg>

      {/* Overlay shares the surface box exactly, so zone percentages land on
          the same geometry the SVG just drew. */}
      <div className={styles.overlay}>{children}</div>
    </div>
  );
}

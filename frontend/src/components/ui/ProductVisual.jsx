import { useId } from "react";
import { isLight, mix } from "../../utils/color";
import styles from "./ProductVisual.module.css";

/**
 * Placeholder product imagery.
 *
 * Renders real photography when `src` is supplied, otherwise draws a neutral
 * studio-style illustration for the given `art` key. Every consumer sizes the
 * frame, never the image itself, so swapping illustrations for photography is
 * a data change only.
 *
 * Each illustration is normalised against ART_BOX so different products carry
 * comparable visual weight and share one floor line, which is what makes a
 * grid of them read as a considered set rather than assorted drawings.
 */

const BASELINE = 173;
const TARGET_H = 148;
const TARGET_W = 152;

const DEEPENED = { default: "deep", tint: "tintDeep", warm: "warmDeep" };

/* Drawn bounds of each illustration, used for scale + baseline normalisation */
const ART_BOX = {
  tshirt: { x: 26, y: 25, w: 148, h: 149 },
  polo: { x: 26, y: 24, w: 148, h: 150 },
  hoodie: { x: 24, y: 15, w: 152, h: 159 },
  cap: { x: 32, y: 58, w: 136, h: 84 },
  tote: { x: 40, y: 24, w: 120, h: 152 },
  bottle: { x: 74, y: 20, w: 52, h: 160 },
  notebook: { x: 48, y: 26, w: 108, h: 146 },
  pen: { x: 88, y: 32, w: 32, h: 150 },
  giftbox: { x: 36, y: 40, w: 128, h: 134 },
  kit: { x: 34, y: 38, w: 132, h: 140 },
  mug: { x: 52, y: 54, w: 108, h: 118 },
  backpack: { x: 46, y: 24, w: 108, h: 152 },
};

const ART = {
  tshirt: (p) => (
    <>
      <path
        d="M76 28 L52 36 L26 58 L44 88 L62 78 L62 168 Q62 174 68 174 L132 174 Q138 174 138 168 L138 78 L156 88 L174 58 L148 36 L124 28 C122 42 113 50 100 50 C87 50 78 42 76 28 Z"
        fill={p.base}
      />
      <path
        d="M62 78 L62 168 Q62 174 68 174 L92 174 L92 74 Z"
        fill={p.lightFill}
      />
      <path
        d="M138 78 L138 168 Q138 174 132 174 L112 174 L112 74 Z"
        fill={p.darkFill}
      />
      <path
        d="M76 28 C78 42 87 50 100 50 C113 50 122 42 124 28"
        fill="none"
        stroke={p.line}
        strokeWidth="5"
      />
    </>
  ),

  polo: (p) => (
    <>
      <path
        d="M74 30 L52 38 L26 58 L44 88 L62 78 L62 168 Q62 174 68 174 L132 174 Q138 174 138 168 L138 78 L156 88 L174 58 L148 38 L126 30 L100 54 Z"
        fill={p.base}
      />
      <path
        d="M62 78 L62 168 Q62 174 68 174 L92 174 L92 74 Z"
        fill={p.lightFill}
      />
      <path
        d="M138 78 L138 168 Q138 174 132 174 L112 174 L112 74 Z"
        fill={p.darkFill}
      />
      <path d="M94 52 L106 52 L106 84 L94 84 Z" fill={p.dark} opacity="0.22" />
      <path d="M74 28 L100 54 L89 25 Q80 24 74 28 Z" fill={p.soft} />
      <path d="M126 28 L100 54 L111 25 Q120 24 126 28 Z" fill={p.soft} />
      <path
        d="M74 28 L100 54 L89 25 Q80 24 74 28 Z M126 28 L100 54 L111 25 Q120 24 126 28 Z"
        fill="none"
        stroke={p.line}
        strokeWidth="1.8"
      />
      <circle cx="100" cy="62" r="2.4" fill={p.line} />
      <circle cx="100" cy="75" r="2.4" fill={p.line} />
    </>
  ),

  hoodie: (p) => (
    <>
      <path
        d="M72 46 L48 54 L24 78 L44 106 L60 94 L60 168 Q60 174 66 174 L134 174 Q140 174 140 168 L140 94 L156 106 L176 78 L152 54 L128 46 Z"
        fill={p.base}
      />
      <path
        d="M60 94 L60 168 Q60 174 66 174 L90 174 L90 90 Z"
        fill={p.lightFill}
      />
      <path
        d="M140 94 L140 168 Q140 174 134 174 L112 174 L112 90 Z"
        fill={p.darkFill}
      />
      <path
        d="M72 46 C74 26 86 15 100 15 C114 15 126 26 128 46 C120 57 112 61 100 61 C88 61 80 57 72 46 Z"
        fill={p.base}
      />
      <path
        d="M79 46 C81 31 89 24 100 24 C111 24 119 31 121 46 C114 54 108 57 100 57 C92 57 86 54 79 46 Z"
        fill={p.dark}
        opacity="0.42"
      />
      <path
        d="M92 56 L92 80"
        stroke={p.line}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M109 56 L109 84"
        stroke={p.line}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M74 124 L126 124 A4 4 0 0 1 130 128 L130 154 L70 154 L70 128 A4 4 0 0 1 74 124 Z"
        fill="none"
        stroke={p.line}
        strokeWidth="2.2"
      />
    </>
  ),

  cap: (p) => (
    <>
      <path
        d="M44 118 C44 84 69 58 100 58 C131 58 156 84 156 118 Z"
        fill={p.base}
      />
      <path
        d="M44 118 C44 84 69 58 100 58 L100 118 Z"
        fill={p.lightFill}
      />
      <path d="M100 58 L100 118" stroke={p.line} strokeWidth="1.8" />
      <path
        d="M72 62 C68 82 66 100 66 118"
        fill="none"
        stroke={p.line}
        strokeWidth="1.8"
      />
      <path
        d="M128 62 C132 82 134 100 134 118"
        fill="none"
        stroke={p.line}
        strokeWidth="1.8"
      />
      <circle cx="100" cy="58" r="4.5" fill={p.dark} />
      <path
        d="M36 118 L164 118 Q170 134 152 139 Q100 148 48 139 Q30 134 36 118 Z"
        fill={p.dark}
      />
      <path
        d="M36 118 L100 118 Q100 146 62 142 Q34 136 36 118 Z"
        fill={p.light}
        opacity="0.14"
      />
    </>
  ),

  tote: (p) => (
    <>
      <path
        d="M72 80 C72 44 82 28 100 28 C118 28 128 44 128 80"
        fill="none"
        stroke={p.dark}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M50 78 L150 78 A4 4 0 0 1 154 82 L160 170 A6 6 0 0 1 154 176 L46 176 A6 6 0 0 1 40 170 L46 82 A4 4 0 0 1 50 78 Z"
        fill={p.base}
      />
      <path
        d="M50 78 L86 78 L82 176 L46 176 A6 6 0 0 1 40 170 L46 82 A4 4 0 0 1 50 78 Z"
        fill={p.lightFill}
      />
      <path
        d="M150 78 L154 82 L160 170 A6 6 0 0 1 154 176 L124 176 L122 78 Z"
        fill={p.darkFill}
      />
      <path d="M42 96 L158 96" stroke={p.line} strokeWidth="1.8" opacity="0.6" />
    </>
  ),

  bottle: (p) => (
    <>
      <path
        d="M84 20 L116 20 A6 6 0 0 1 122 26 L122 44 L78 44 L78 26 A6 6 0 0 1 84 20 Z"
        fill={p.dark}
      />
      <path d="M88 44 L112 44 L112 55 L88 55 Z" fill={p.dark} opacity="0.7" />
      <path
        d="M74 68 Q74 54 88 52 L112 52 Q126 54 126 68 L126 166 Q126 180 112 180 L88 180 Q74 180 74 166 Z"
        fill={p.base}
      />
      <path
        d="M74 68 Q74 54 88 52 L98 52 L98 180 L88 180 Q74 180 74 166 Z"
        fill={p.lightFill}
      />
      <path
        d="M114 54 L126 68 L126 166 Q126 180 112 180 L106 180 L106 53 Z"
        fill={p.darkFill}
      />
      <path d="M74 104 L126 104 L126 134 L74 134 Z" fill={p.dark} opacity="0.14" />
    </>
  ),

  notebook: (p) => (
    <>
      <path
        d="M62 36 L152 36 A4 4 0 0 1 156 40 L156 168 A4 4 0 0 1 152 172 L62 172 Z"
        fill="#ffffff"
      />
      <path
        d="M62 36 L152 36 A4 4 0 0 1 156 40 L156 168 A4 4 0 0 1 152 172 L62 172 Z"
        fill="none"
        stroke="#dde2e8"
        strokeWidth="1.4"
      />
      <path d="M148 44 L148 164 M152 48 L152 160" stroke="#e5e7eb" strokeWidth="2" />
      <path
        d="M48 26 L140 26 A8 8 0 0 1 148 34 L148 158 A8 8 0 0 1 140 166 L48 166 Z"
        fill={p.base}
      />
      <path d="M48 26 L74 26 L74 166 L48 166 Z" fill={p.lightFill} />
      <path d="M48 26 L58 26 L58 166 L48 166 Z" fill={p.dark} opacity="0.4" />
      <path d="M126 26 L133 26 L133 166 L126 166 Z" fill={p.line} opacity="0.5" />
      <path
        d="M78 62 L114 62"
        stroke={p.line}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.75"
      />
    </>
  ),

  pen: (p) => (
    <>
      <path
        d="M88 46 Q88 32 100 32 Q112 32 112 46 L112 130 L88 130 Z"
        fill={p.base}
      />
      <path
        d="M88 46 Q88 32 100 32 L100 130 L88 130 Z"
        fill={p.lightFill}
      />
      <path d="M88 130 L112 130 L112 146 L88 146 Z" fill={p.dark} />
      <path d="M92 146 L108 146 L102 172 L98 172 Z" fill={p.dark} opacity="0.72" />
      <path d="M99 172 L101 172 L100 182 Z" fill={p.line} />
      <path
        d="M112 52 Q120 52 120 60 L120 92 Q120 97 116 97 Q112 97 112 92 Z"
        fill={p.dark}
        opacity="0.78"
      />
      <path d="M88 118 L112 118" stroke={p.line} strokeWidth="2.2" opacity="0.75" />
    </>
  ),

  giftbox: (p) => (
    <>
      <path d="M92 68 C74 44 58 40 54 53 C50 66 70 70 92 68 Z" fill={p.light} />
      <path d="M108 68 C126 44 142 40 146 53 C150 66 130 70 108 68 Z" fill={p.light} />
      <path
        d="M50 96 L150 96 L150 168 A6 6 0 0 1 144 174 L56 174 A6 6 0 0 1 50 168 Z"
        fill={p.base}
      />
      <path
        d="M50 96 L92 96 L92 174 L56 174 A6 6 0 0 1 50 168 Z"
        fill={p.lightFill}
      />
      <path
        d="M42 66 L158 66 A6 6 0 0 1 164 72 L164 96 L36 96 L36 72 A6 6 0 0 1 42 66 Z"
        fill={p.dark}
      />
      <path d="M92 66 L108 66 L108 174 L92 174 Z" fill={p.line} opacity="0.8" />
    </>
  ),

  kit: (p) => (
    <>
      <path
        d="M58 48 L80 48 A9 9 0 0 1 89 57 L89 100 L49 100 L49 57 A9 9 0 0 1 58 48 Z"
        fill={p.dark}
        opacity="0.85"
      />
      <path
        d="M92 38 L114 38 A3 3 0 0 1 117 41 L117 100 L89 100 L89 41 A3 3 0 0 1 92 38 Z"
        fill="#ffffff"
        stroke="#dde2e8"
        strokeWidth="1.4"
      />
      <path d="M96 38 L106 38 L106 100 L96 100 Z" fill={p.dark} opacity="0.5" />
      <path
        d="M124 56 L146 56 A5 5 0 0 1 151 61 L151 100 L119 100 L119 61 A5 5 0 0 1 124 56 Z"
        fill={p.line}
      />
      <path
        d="M38 100 L162 100 A4 4 0 0 1 166 104 L166 118 L34 118 L34 104 A4 4 0 0 1 38 100 Z"
        fill={p.dark}
      />
      <path
        d="M44 118 L156 118 L148 174 A5 5 0 0 1 143 178 L57 178 A5 5 0 0 1 52 174 Z"
        fill={p.base}
      />
      <path
        d="M44 118 L84 118 L80 178 L57 178 A5 5 0 0 1 52 174 Z"
        fill={p.lightFill}
      />
    </>
  ),

  mug: (p) => (
    <>
      <path
        d="M126 82 L146 82 A22 22 0 0 1 146 146 L126 146 Z"
        fill="none"
        stroke={p.dark}
        strokeWidth="11"
        strokeLinejoin="round"
      />
      <path
        d="M56 60 L128 60 A4 4 0 0 1 132 64 L132 158 A14 14 0 0 1 118 172 L70 172 A14 14 0 0 1 56 158 Z"
        fill={p.base}
      />
      <path
        d="M56 60 L84 60 L84 172 L70 172 A14 14 0 0 1 56 158 Z"
        fill={p.lightFill}
      />
      <path
        d="M120 60 L128 60 A4 4 0 0 1 132 64 L132 158 A14 14 0 0 1 118 172 L110 172 Z"
        fill={p.darkFill}
      />
      <ellipse cx="94" cy="60" rx="38" ry="6" fill={p.dark} opacity="0.5" />
      <ellipse cx="94" cy="60" rx="31" ry="4" fill={p.dark} opacity="0.35" />
    </>
  ),

  backpack: (p) => (
    <>
      <path
        d="M78 44 C78 30 88 24 100 24 C112 24 122 30 122 44"
        fill="none"
        stroke={p.dark}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M66 176 L64 96 A34 34 0 0 1 100 60 A34 34 0 0 1 136 96 L134 176 A4 4 0 0 1 130 180 L70 180 A4 4 0 0 1 66 176 Z"
        fill={p.base}
      />
      <path
        d="M66 176 L64 96 A34 34 0 0 1 92 61 L90 180 L70 180 A4 4 0 0 1 66 176 Z"
        fill={p.lightFill}
      />
      <path
        d="M112 62 A34 34 0 0 1 136 96 L134 176 A4 4 0 0 1 130 180 L114 180 Z"
        fill={p.darkFill}
      />
      <path
        d="M74 116 L126 116 A4 4 0 0 1 130 120 L130 150 L70 150 L70 120 A4 4 0 0 1 74 116 Z"
        fill={p.dark}
        opacity="0.26"
      />
      <path d="M70 112 L130 112" stroke={p.line} strokeWidth="2.4" />
      <path d="M88 132 L112 132" stroke={p.line} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

export default function ProductVisual({
  art = "tshirt",
  color = "#e6e8ec",
  src = null,
  alt = "",
  ratio = "4 / 5",
  scale = 1,
  surface = "default",
  className = "",
  children,
  priority = false,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const light = !src && isLight(color);

  // Pale products need a deeper studio floor or they wash out against it.
  const resolvedSurface = light ? DEEPENED[surface] || surface : surface;
  const frameClass = [styles.frame, styles[resolvedSurface] || "", className]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return (
      <div className={frameClass} style={{ "--visual-ratio": ratio }}>
        <img
          className={styles.photo}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
        {children ? <div className={styles.overlay}>{children}</div> : null}
      </div>
    );
  }

  const palette = {
    base: color,
    light: mix(color, "light", light ? 0.5 : 0.24),
    soft: mix(color, "light", light ? 0.3 : 0.12),
    dark: mix(color, "dark", light ? 0.22 : 0.34),
    line: light ? "rgba(15, 27, 45, 0.17)" : "rgba(255, 255, 255, 0.3)",
    lightFill: `url(#${uid}l)`,
    darkFill: `url(#${uid}d)`,
  };

  const draw = ART[art] || ART.tshirt;
  const box = ART_BOX[art] || ART_BOX.tshirt;

  // Normalise every illustration to one footprint and one floor line.
  const fit = Math.min(TARGET_H / box.h, TARGET_W / box.w) * scale;
  const tx = 100 - fit * (box.x + box.w / 2);
  const ty = BASELINE - fit * (box.y + box.h);
  const shadowRx = Math.max(18, (box.w * fit) / 2.35);

  return (
    <div className={frameClass} style={{ "--visual-ratio": ratio }}>
      <svg
        className={styles.art}
        viewBox="0 0 200 200"
        role="img"
        aria-label={alt || "Product image placeholder"}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`${uid}l`} x1="0" y1="0" x2="1" y2="0.15">
            <stop offset="0%" stopColor={palette.light} stopOpacity="0.9" />
            <stop offset="100%" stopColor={palette.light} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}d`} x1="1" y1="0" x2="0" y2="0.15">
            <stop offset="0%" stopColor={palette.dark} stopOpacity="0.8" />
            <stop offset="100%" stopColor={palette.dark} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${uid}s`}>
            <stop offset="0%" stopColor="#0f1b2d" stopOpacity="0.2" />
            <stop offset="55%" stopColor="#0f1b2d" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0f1b2d" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse
          cx="100"
          cy={BASELINE + 6}
          rx={shadowRx * 1.35}
          ry={shadowRx * 0.2}
          fill={`url(#${uid}s)`}
        />
        <ellipse
          cx="100"
          cy={BASELINE + 3}
          rx={shadowRx * 0.62}
          ry={shadowRx * 0.09}
          fill="#0f1b2d"
          opacity="0.1"
        />

        <g transform={`translate(${tx} ${ty}) scale(${fit})`}>{draw(palette)}</g>
      </svg>
      {children ? <div className={styles.overlay}>{children}</div> : null}
    </div>
  );
}

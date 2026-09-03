/**
 * Server-side quotation PDF (Phase 4 §26/§27, redesigned for launch). Uses
 * `pdfkit` — a pure-JS, no-native-deps, no-headless-browser PDF writer —
 * deliberately avoiding a Puppeteer/Chromium dependency for one document
 * type. Renders directly from the same structured quotation data the web
 * page and admin editor use (via serializePublicQuote's shape); the PDF is
 * generated on demand and never stored — it is not a source of truth, just
 * one more view of the underlying Quotation/QuotationLine rows.
 *
 * Font (Production Hardening Patch §4): pdfkit's default standalone fonts
 * (Helvetica etc.) are the classic PDF base-14 set, which does not include
 * the Rupee sign (₹, U+20B9) — verified empirically, it silently renders
 * with zero width. `dejavu-fonts-ttf` ships DejaVu Sans, a real embeddable
 * TTF (Bitstream Vera license) with broad Unicode coverage confirmed to
 * include ₹; it is subsetted into each generated PDF.
 *
 * Structure: `buildQuoteView()` resolves every customer-facing string
 * (dates, money, footer identity) into a plain object with no layout in
 * it — it is pure and unit-tested. `renderQuotePdf()` only lays that view
 * out with pdfkit. No internal status/ids/tokens/timestamps reach the
 * page (task §5/§18); the footer website can never be a localhost host
 * (task §12).
 */
const path = require("node:path");
const PDFDocument = require("pdfkit");
const {
  BUSINESS_NAME,
  BUSINESS_TAGLINE,
  ADDRESS_LINES,
  WEBSITE_DISPLAY,
} = require("../config/business");

const DEJAVU_ROOT = path.dirname(require.resolve("dejavu-fonts-ttf/package.json"));
const FONT_REGULAR = path.join(DEJAVU_ROOT, "ttf", "DejaVuSans.ttf");
const FONT_BOLD = path.join(DEJAVU_ROOT, "ttf", "DejaVuSans-Bold.ttf");

const NAVY = "#0f1b2d";
const AMBER = "#e1ad01"; // brand mustard — used only as a thin accent
const INK = "#1f2937";
const MUTED = "#6b7280";
const FAINT = "#eef0f2";
const BORDER = "#e5e7eb";

const LEFT = 50;
const RIGHT = 545;
const WIDTH = RIGHT - LEFT; // 495
const PAGE_TOP = 50;
const CONTENT_BOTTOM = 715; // content must stop here; the footer band lives below

const COLS = {
  desc: { x: 58, w: 226 },
  qty: { x: 288, w: 40, align: "right" },
  unit: { x: 334, w: 48, align: "center" },
  price: { x: 386, w: 74, align: "right" },
  amount: { x: 464, w: 73, align: "right" },
};

function formatMoney(value, currency) {
  if (value == null) return "—";
  const amount = Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "INR" || !currency ? `₹${amount}` : `${currency} ${amount}`;
}

/** Customer-facing date format: "02 Sep 2026" — short month, never "2026-09-02". */
function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  return `${day} ${month} ${d.getFullYear()}`;
}

/** "919599122214" -> "+91 9599122214" — mirrors the on-site display format. */
function formatPhoneDisplay(whatsappNumber) {
  const digits = String(whatsappNumber || "").replace(/\D/g, "");
  if (digits.length < 11) return null;
  return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
}

/**
 * The website line on a customer PDF. Prefers PUBLIC_APP_URL when it is a
 * real public origin, but a localhost / loopback / .local / bare-IP host
 * (i.e. any dev value) falls back to the canonical marketing domain so a
 * generated dev PDF still shows correct business identity (task §12/§22).
 */
function resolveWebsiteDisplay(publicAppUrl) {
  if (!publicAppUrl) return WEBSITE_DISPLAY;
  let host;
  try {
    host = new URL(publicAppUrl).hostname.toLowerCase();
  } catch {
    return WEBSITE_DISPLAY;
  }
  const isLocal =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  return isLocal ? WEBSITE_DISPLAY : host.replace(/^www\./, "");
}

/**
 * Pure: resolve a serialized quote into the exact strings the PDF prints.
 * No pdfkit, no layout. Everything the renderer draws comes from here.
 *
 * @param {object} quote - the object returned by serializePublicQuote()
 */
function buildQuoteView(quote) {
  const currency = quote.currency || "INR";
  const customer = quote.customer || {};
  const displayName = customer.companyName || customer.name || "—";

  const preparedFor = [];
  if (customer.companyName && customer.name) {
    preparedFor.push({ label: "Contact", value: customer.name });
  }
  if (customer.phone) preparedFor.push({ label: "Phone", value: customer.phone });
  if (customer.email) preparedFor.push({ label: "Email", value: customer.email });
  if (customer.gstin) preparedFor.push({ label: "GSTIN", value: customer.gstin });
  if (customer.address) preparedFor.push({ label: "Address", value: customer.address });

  const quotationDate = formatDate(quote.createdAt) || formatDate(quote.sentAt) || "—";
  const validUntil = formatDate(quote.validUntil) || "7 days from the quotation date";

  const details = [
    { label: "Quotation No", value: quote.reference },
    { label: "Quotation Date", value: quotationDate },
    { label: "Valid Until", value: validUntil },
  ];
  if (quote.rfqReference) details.push({ label: "RFQ Reference", value: quote.rfqReference });

  const lines = (quote.lines || []).map((line) => {
    const [name, ...rest] = String(line.description || "").split("\n");
    return {
      name: name.trim() || "—",
      code: line.productCode || null,
      spec: rest.join(" ").replace(/\s+/g, " ").trim() || null,
      qty: line.quantity != null ? String(line.quantity) : "—",
      unit: line.unit || "—",
      unitPrice: line.unitPrice != null ? formatMoney(line.unitPrice, currency) : "—",
      amount: formatMoney(line.lineTotal, currency),
    };
  });

  const totals = [{ label: "Subtotal", value: formatMoney(quote.subtotal, currency) }];
  if (quote.taxAmount != null) {
    totals.push({ label: quote.taxMode || "Tax", value: formatMoney(quote.taxAmount, currency) });
  }
  totals.push({ label: "Grand Total", value: formatMoney(quote.grandTotal, currency), strong: true });

  // Only terms that are true of every PrimeLinor quotation or backed
  // by real quotation data. No Payment Terms / Delivery Timeline rows —
  // there is no such field on Quotation yet and those must not be
  // fabricated (task §10).
  const terms = [
    {
      label: "Validity",
      value: formatDate(quote.validUntil)
        ? `Valid until ${formatDate(quote.validUntil)} — 7 days from the quotation date.`
        : "Valid for 7 days from the quotation date.",
    },
    { label: "Taxes", value: quote.taxMode ? String(quote.taxMode) : "As applicable." },
    { label: "Customization", value: "Produced against approved artwork and final specifications." },
    {
      label: "Confirmation",
      value:
        "Final pricing, delivery timeline and specifications are confirmed in writing by PrimeLinor.",
    },
  ];

  return {
    brand: { name: BUSINESS_NAME, tagline: BUSINESS_TAGLINE },
    heading: "QUOTATION",
    reference: quote.reference,
    displayName,
    preparedFor,
    details,
    currency,
    lines,
    totals,
    terms,
    notes: quote.customerNotes ? String(quote.customerNotes) : null,
    footer: {
      name: BUSINESS_NAME,
      addressLine: ADDRESS_LINES.join(", "),
      email: process.env.SUPPORT_EMAIL?.trim() || null,
      phone: formatPhoneDisplay(process.env.WHATSAPP_NUMBER),
      website: resolveWebsiteDisplay(process.env.PUBLIC_APP_URL),
      disclaimer:
        "This is a quotation, not a tax invoice. Pricing, delivery, specifications and terms are " +
        "subject to final confirmation by PrimeLinor.",
    },
  };
}

/**
 * @param {object} quote - the object returned by serializePublicQuote()
 * @returns {PDFDocument} a readable stream — pipe it to a response or collect it into a Buffer.
 */
function renderQuotePdf(quote) {
  const view = buildQuoteView(quote);
  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
  doc.registerFont("Body", FONT_REGULAR);
  doc.registerFont("Body-Bold", FONT_BOLD);
  doc.font("Body");

  const text = (str, x, y, opts = {}) => doc.text(str == null ? "" : String(str), x, y, opts);
  const rule = (y, x1 = LEFT, x2 = RIGHT, color = BORDER, w = 0.75) =>
    doc.moveTo(x1, y).lineTo(x2, y).lineWidth(w).strokeColor(color).stroke();

  /** Adds a page if `need` points don't fit below `y`; returns the working y. */
  function ensureSpace(need, y) {
    if (y + need <= CONTENT_BOTTOM) return y;
    doc.addPage();
    return PAGE_TOP;
  }

  const sectionLabel = (label, x, y) => {
    doc
      .font("Body-Bold")
      .fontSize(8)
      .fillColor(MUTED)
      .text(label.toUpperCase(), x, y, { characterSpacing: 1.3 });
  };

  // ── Header (first page only) ──────────────────────────────────────────
  doc.font("Body-Bold").fontSize(20).fillColor(NAVY).text(view.brand.name, LEFT, 46);
  doc.font("Body").fontSize(9.5).fillColor(MUTED).text(view.brand.tagline, LEFT, 73);

  doc
    .font("Body-Bold")
    .fontSize(17)
    .fillColor(NAVY)
    .text(view.heading, 320, 44, { width: RIGHT - 320, align: "right", characterSpacing: 2 });
  doc
    .font("Body")
    .fontSize(9.5)
    .fillColor(MUTED)
    .text(view.reference, 320, 72, { width: RIGHT - 320, align: "right" });

  rule(100, LEFT, RIGHT, AMBER, 1.4);

  // ── Prepared For / Quotation Details ─────────────────────────────────
  let y = 120;
  const COL_R = 320;
  sectionLabel("Prepared For", LEFT, y);
  sectionLabel("Quotation Details", COL_R, y);
  y += 16;

  doc.font("Body-Bold").fontSize(11.5).fillColor(NAVY).text(view.displayName, LEFT, y, { width: COL_R - LEFT - 20 });
  let leftY = y + doc.heightOfString(view.displayName, { width: COL_R - LEFT - 20 }) + 4;
  for (const row of view.preparedFor) {
    doc.font("Body").fontSize(9).fillColor(MUTED).text(row.label, LEFT, leftY, { width: 46 });
    doc.font("Body").fontSize(9.5).fillColor(INK).text(row.value, LEFT + 50, leftY, { width: COL_R - LEFT - 70 });
    leftY += Math.max(14, doc.heightOfString(row.value, { width: COL_R - LEFT - 70 }) + 3);
  }

  let rightY = y;
  for (const row of view.details) {
    doc.font("Body").fontSize(9).fillColor(MUTED).text(row.label, COL_R, rightY, { width: 82 });
    doc.font("Body").fontSize(9.5).fillColor(INK).text(row.value, COL_R + 86, rightY, { width: RIGHT - COL_R - 86 });
    rightY += 15;
  }

  y = Math.max(leftY, rightY) + 16;
  rule(y);
  y += 16;

  // ── Items table ─────────────────────────────────────────────────────
  function drawTableHeader(top) {
    doc.rect(LEFT, top, WIDTH, 20).fill(NAVY);
    doc.font("Body-Bold").fontSize(7.5).fillColor("#ffffff");
    const h = (label, c) => doc.text(label, c.x, top + 6.5, { width: c.w, align: c.align || "left", characterSpacing: 0.6 });
    h("DESCRIPTION", COLS.desc);
    h("QTY", COLS.qty);
    h("UNIT", COLS.unit);
    h("UNIT PRICE", COLS.price);
    h("AMOUNT", COLS.amount);
    return top + 20;
  }

  y = drawTableHeader(y);

  for (const line of view.lines) {
    // Product Code sits under the name as a small muted line (task §18) —
    // no extra column, so the table stays uncramped.
    const subLines = [];
    if (line.code) subLines.push(`Product Code: ${line.code}`);
    if (line.spec) subLines.push(line.spec);

    doc.font("Body").fontSize(9.5);
    const nameH = doc.heightOfString(line.name, { width: COLS.desc.w });
    doc.font("Body").fontSize(8);
    const subH = subLines.reduce((h, s) => h + doc.heightOfString(s, { width: COLS.desc.w }) + 1, 0);
    const rowH = Math.max(22, nameH + subH + 12);

    if (y + rowH > CONTENT_BOTTOM) {
      doc.addPage();
      y = drawTableHeader(PAGE_TOP);
    }

    const cellTop = y + 6;
    doc.font("Body").fontSize(9.5).fillColor(NAVY).text(line.name, COLS.desc.x, cellTop, { width: COLS.desc.w });
    let subY = cellTop + nameH + 1;
    doc.font("Body").fontSize(8).fillColor(MUTED);
    for (const s of subLines) {
      doc.text(s, COLS.desc.x, subY, { width: COLS.desc.w });
      subY += doc.heightOfString(s, { width: COLS.desc.w }) + 1;
    }
    doc.font("Body").fontSize(9.5).fillColor(INK);
    doc.text(line.qty, COLS.qty.x, cellTop, { width: COLS.qty.w, align: "right" });
    doc.text(line.unit, COLS.unit.x, cellTop, { width: COLS.unit.w, align: "center" });
    doc.text(line.unitPrice, COLS.price.x, cellTop, { width: COLS.price.w, align: "right" });
    doc.text(line.amount, COLS.amount.x, cellTop, { width: COLS.amount.w, align: "right" });

    y += rowH;
    rule(y, LEFT, RIGHT, FAINT, 0.5);
  }

  y += 12;

  // ── Totals (kept together on one page) ──────────────────────────────
  const totalsHeight = view.totals.length * 17 + 18;
  y = ensureSpace(totalsHeight, y);
  const TL = 330;
  for (const row of view.totals) {
    if (row.strong) {
      y += 4;
      rule(y, TL + 30, RIGHT, AMBER, 1.2);
      y += 7;
      doc.font("Body-Bold").fontSize(11.5).fillColor(NAVY).text(row.label, TL, y, { width: 110 });
      doc.font("Body-Bold").fontSize(11.5).fillColor(NAVY).text(row.value, TL + 115, y, { width: RIGHT - TL - 115, align: "right" });
      y += 22;
    } else {
      doc.font("Body").fontSize(9.5).fillColor(MUTED).text(row.label, TL, y, { width: 110 });
      doc.font("Body").fontSize(9.5).fillColor(INK).text(row.value, TL + 115, y, { width: RIGHT - TL - 115, align: "right" });
      y += 17;
    }
  }

  y += 18;

  // ── Commercial Terms ───────────────────────────────────────────────
  y = ensureSpace(40, y);
  sectionLabel("Commercial Terms", LEFT, y);
  y += 12;
  rule(y);
  y += 10;
  for (const term of view.terms) {
    doc.font("Body").fontSize(9);
    const valH = doc.heightOfString(term.value, { width: WIDTH - 95 });
    const rowH = Math.max(14, valH + 6);
    y = ensureSpace(rowH, y);
    doc.font("Body-Bold").fontSize(8.5).fillColor(NAVY).text(term.label, LEFT, y, { width: 88 });
    doc.font("Body").fontSize(9).fillColor(MUTED).text(term.value, LEFT + 95, y, { width: WIDTH - 95 });
    y += rowH;
  }

  // ── Notes ─────────────────────────────────────────────────────────
  if (view.notes) {
    y += 16;
    doc.font("Body").fontSize(9);
    const notesH = doc.heightOfString(view.notes, { width: WIDTH });
    y = ensureSpace(28 + notesH, y);
    sectionLabel("Notes", LEFT, y);
    y += 12;
    rule(y);
    y += 10;
    doc.font("Body").fontSize(9).fillColor(INK).text(view.notes, LEFT, y, { width: WIDTH });
  }

  // ── Footer + page numbers on every page ───────────────────────────
  const f = view.footer;
  const contactBits = [f.email, f.phone, f.website].filter(Boolean).join("   ·   ");
  const range = doc.bufferedPageRange();
  const pageCount = range.count;
  for (let i = 0; i < pageCount; i += 1) {
    doc.switchToPage(range.start + i);
    // The footer is absolute-positioned inside the page's bottom margin.
    // Dropping the bottom margin here stops pdfkit from auto-appending a
    // blank page when the wrapped disclaimer nudges past it (task §15).
    doc.page.margins.bottom = 0;
    const top = 736;
    rule(top, LEFT, RIGHT, BORDER, 0.75);
    doc.font("Body-Bold").fontSize(8).fillColor(NAVY).text(f.name, LEFT, top + 8, { width: 300, lineBreak: false });
    doc
      .font("Body")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(`Page ${i + 1} of ${pageCount}`, RIGHT - 120, top + 8, { width: 120, align: "right", lineBreak: false });
    doc.font("Body").fontSize(7.5).fillColor(MUTED).text(f.addressLine, LEFT, top + 20, { width: WIDTH, lineBreak: false });
    if (contactBits) doc.text(contactBits, LEFT, top + 30, { width: WIDTH, lineBreak: false });
    doc.fontSize(6.8).fillColor(MUTED).text(f.disclaimer, LEFT, top + 41, { width: WIDTH });
  }

  doc.flushPages();
  doc.end();
  return doc;
}

module.exports = { renderQuotePdf, buildQuoteView, resolveWebsiteDisplay, formatDate };

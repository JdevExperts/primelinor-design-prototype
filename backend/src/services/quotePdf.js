/**
 * Server-side quotation PDF (Phase 4 §26/§27). Uses `pdfkit` — a pure-JS,
 * no-native-deps, no-headless-browser PDF writer — deliberately avoiding
 * a Puppeteer/Chromium dependency for one document type. Renders directly
 * from the same structured quotation data the web page and admin editor
 * use (via serializePublicQuote's shape); the PDF is generated on demand
 * and never stored — it is not a source of truth, just one more view of
 * the underlying Quotation/QuotationLine rows.
 *
 * Font (Production Hardening Patch §4): pdfkit's default standalone
 * fonts (Helvetica etc.) are the classic PDF base-14 set, which does not
 * include the Rupee sign (₹, U+20B9) — verified empirically, it silently
 * renders with zero width, i.e. every amount was missing its currency
 * symbol. `dejavu-fonts-ttf` ships DejaVu Sans, a real embeddable TTF
 * (Bitstream Vera license — free to embed/redistribute, no attribution
 * requirement beyond keeping the license text with the font file, which
 * stays in node_modules; nothing here exposes the font file itself to a
 * user, it is subsetted into each generated PDF the way any embedded PDF
 * font is) with broad Unicode coverage confirmed to include ₹.
 */
const path = require("node:path");
const PDFDocument = require("pdfkit");
const { BUSINESS_NAME, ADDRESS_LINES } = require("../config/business");

const DEJAVU_ROOT = path.dirname(require.resolve("dejavu-fonts-ttf/package.json"));
const FONT_REGULAR = path.join(DEJAVU_ROOT, "ttf", "DejaVuSans.ttf");
const FONT_BOLD = path.join(DEJAVU_ROOT, "ttf", "DejaVuSans-Bold.ttf");

const NAVY = "#0f1b2d";
const AMBER = "#f59e0b";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const PAGE_BOTTOM = 700; // leave room for the business-contact block + 770-anchored disclaimer below this
const PAGE_TOP = 50;

function formatMoney(value, currency) {
  if (value == null) return "—";
  const amount = Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "INR" ? `₹${amount}` : `${currency} ${amount}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

/** "919599122214" -> "+91 9599122214" — mirrors the display format used on-site. */
function formatPhoneDisplay(whatsappNumber) {
  const digits = String(whatsappNumber || "").replace(/\D/g, "");
  if (digits.length < 11) return null;
  return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
}

/** "https://primelinorbulk.com" -> "primelinorbulk.com" for a compact PDF display. */
function formatWebsiteDisplay(publicAppUrl) {
  if (!publicAppUrl) return null;
  return publicAppUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/**
 * Business contact block shown on every quotation PDF (Phase 6B §15).
 * Each field is independently optional so a not-yet-configured deployment
 * (e.g. WHATSAPP_NUMBER/SUPPORT_EMAIL unset in a fresh environment) still
 * renders a correct PDF rather than a broken one — it just omits that line.
 */
function getBusinessContactLines() {
  const lines = [...ADDRESS_LINES];
  const email = process.env.SUPPORT_EMAIL?.trim();
  const phone = formatPhoneDisplay(process.env.WHATSAPP_NUMBER);
  const website = formatWebsiteDisplay(process.env.PUBLIC_APP_URL);
  const contactBits = [email, phone, website].filter(Boolean);
  if (contactBits.length) lines.push(contactBits.join("  ·  "));
  return lines;
}

/**
 * @param {object} quote - the object returned by serializePublicQuote()
 * @returns {PDFDocument} a readable stream — pipe it to a response or collect it into a Buffer.
 */
function renderQuotePdf(quote) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.registerFont("Body", FONT_REGULAR);
  doc.registerFont("Body-Bold", FONT_BOLD);
  doc.font("Body");

  /** Starts a fresh page with the header band that begins every page after the first. */
  function ensureSpace(neededHeight, y) {
    if (y + neededHeight <= PAGE_BOTTOM) return y;
    doc.addPage();
    return PAGE_TOP;
  }

  doc.rect(0, 0, doc.page.width, 90).fill(NAVY);
  doc
    .fillColor("#ffffff")
    .font("Body-Bold")
    .fontSize(20)
    .text(BUSINESS_NAME, 50, 30)
    .font("Body")
    .fontSize(10)
    .fillColor(AMBER)
    .text("Custom products for your brand", 50, 55);

  doc.font("Body-Bold").fillColor(NAVY).fontSize(14).text(`Quotation ${quote.reference}`, 50, 115);
  doc
    .font("Body")
    .fontSize(9)
    .fillColor(MUTED)
    .text(`RFQ reference: ${quote.rfqReference}   ·   Status: ${quote.status}`, 50, 135);

  let y = 165;
  doc.fontSize(9).fillColor(MUTED).text("Prepared for", 50, y);
  doc
    .font("Body-Bold")
    .fontSize(11)
    .fillColor(NAVY)
    .text(quote.customer.companyName || quote.customer.name, 50, y + 14);
  if (quote.customer.companyName) {
    doc.font("Body").fontSize(10).fillColor(MUTED).text(quote.customer.name, 50, y + 30);
  }

  doc.font("Body").fontSize(9).fillColor(MUTED).text("Sent", 350, y);
  doc.fontSize(10).fillColor(NAVY).text(formatDate(quote.sentAt), 350, y + 14);
  doc.fontSize(9).fillColor(MUTED).text("Valid until", 350, y + 32);
  doc.fontSize(10).fillColor(NAVY).text(quote.validUntil ? formatDate(quote.validUntil) : "No expiry set", 350, y + 46);

  y += 90;
  doc.moveTo(50, y).lineTo(545, y).strokeColor(BORDER).stroke();
  y += 16;

  const columns = [
    { label: "Description", x: 50, width: 210 },
    { label: "Qty", x: 265, width: 40 },
    { label: "Unit", x: 310, width: 50 },
    { label: "Unit Price", x: 365, width: 85 },
    { label: "Total", x: 460, width: 85 },
  ];
  doc.fontSize(9).fillColor(MUTED);
  columns.forEach((col) => doc.text(col.label.toUpperCase(), col.x, y, { width: col.width }));
  y += 16;
  doc.moveTo(50, y).lineTo(545, y).strokeColor(BORDER).stroke();
  y += 8;

  doc.fontSize(10).fillColor(NAVY);
  for (const line of quote.lines) {
    // A long description wraps within its column — measure the actual
    // wrapped height so a multi-line description doesn't overlap the row
    // beneath it (previously a fixed 20px row height regardless of content).
    const descriptionHeight = doc.heightOfString(line.description, { width: columns[0].width });
    const rowHeight = Math.max(20, descriptionHeight + 6);

    y = ensureSpace(rowHeight, y);

    doc.text(line.description, columns[0].x, y, { width: columns[0].width });
    doc.text(line.quantity != null ? String(line.quantity) : "—", columns[1].x, y, { width: columns[1].width });
    doc.text(line.unit || "—", columns[2].x, y, { width: columns[2].width });
    doc.text(line.unitPrice != null ? formatMoney(line.unitPrice, quote.currency) : "—", columns[3].x, y, {
      width: columns[3].width,
    });
    doc.text(formatMoney(line.lineTotal, quote.currency), columns[4].x, y, { width: columns[4].width });
    y += rowHeight;
  }

  // Totals block — 3 rows max (subtotal, optional tax, grand total), so a
  // single ensureSpace covers the whole block moving to a new page together
  // rather than splitting across pages awkwardly.
  const totalsBlockHeight = quote.taxAmount != null ? 8 + 16 + 16 + 20 : 8 + 16 + 20;
  y = ensureSpace(totalsBlockHeight, y);
  y += 8;
  doc.moveTo(350, y).lineTo(545, y).strokeColor(BORDER).stroke();
  y += 10;

  const totalsRow = (label, value, bold) => {
    doc
      .font(bold ? "Body-Bold" : "Body")
      .fontSize(bold ? 11 : 10)
      .fillColor(bold ? NAVY : MUTED)
      .text(label, 350, y, { width: 110 });
    doc
      .font(bold ? "Body-Bold" : "Body")
      .fontSize(bold ? 11 : 10)
      .fillColor(NAVY)
      .text(value, 460, y, { width: 85 });
    y += bold ? 20 : 16;
  };

  totalsRow("Subtotal", formatMoney(quote.subtotal, quote.currency), false);
  if (quote.taxAmount != null) {
    totalsRow(quote.taxMode || "Tax", formatMoney(quote.taxAmount, quote.currency), false);
  }
  totalsRow("Grand Total", formatMoney(quote.grandTotal, quote.currency), true);

  if (quote.customerNotes) {
    const notesHeight = doc.font("Body").fontSize(10).heightOfString(quote.customerNotes, { width: 495 });
    y = ensureSpace(20 + 14 + notesHeight, y);
    y += 20;
    doc.fontSize(9).fillColor(MUTED).text("NOTES", 50, y);
    y += 14;
    doc.fontSize(10).fillColor(NAVY).text(quote.customerNotes, 50, y, { width: 495 });
  }

  let contactY = 733;
  doc.font("Body").fontSize(8).fillColor(MUTED);
  for (const line of getBusinessContactLines()) {
    doc.text(line, 50, contactY, { width: 495, align: "center" });
    contactY += 10;
  }

  doc
    .font("Body")
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      "This is a quotation, not a tax invoice. Pricing, delivery and terms are subject to confirmation by PrimeLinor.",
      50,
      775,
      { width: 495, align: "center" },
    );

  doc.end();
  return doc;
}

module.exports = { renderQuotePdf };

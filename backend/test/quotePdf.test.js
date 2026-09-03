const test = require("node:test");
const assert = require("node:assert/strict");
const { renderQuotePdf, buildQuoteView } = require("../src/services/quotePdf");

const SAMPLE_QUOTE = {
  reference: "PL-RQ-2026-000123-V1",
  rfqReference: "PL-RQ-2026-000123",
  version: 1,
  status: "SENT",
  customer: {
    name: "Priya Sharma",
    companyName: "Example Corp",
    phone: "+91 98765 43210",
    email: "priya@example.com",
  },
  createdAt: new Date("2026-09-02T09:00:00Z"),
  currency: "INR",
  lines: [
    { description: "Premium Cotton T-Shirt\n200 GSM • Combed cotton", quantity: 100, unit: "piece", unitPrice: 149, lineTotal: 14900 },
    { description: "Standard delivery", quantity: null, unit: null, unitPrice: null, lineTotal: 500 },
  ],
  subtotal: 15400,
  taxMode: "GST (manual)",
  taxAmount: 200,
  grandTotal: 15600,
  validUntil: new Date("2026-09-09T09:00:00Z"),
  customerNotes: "Delivery in 10 working days.",
  sentAt: new Date("2026-09-02T10:00:00Z"),
};

function collectBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function makeLines(n) {
  return Array.from({ length: n }, (_, i) => ({
    description: `Line item ${i + 1}`,
    quantity: (i + 1) * 10,
    unit: "piece",
    unitPrice: 100 + i,
    lineTotal: (i + 1) * 10 * (100 + i),
  }));
}

test("renderQuotePdf: produces a buffer starting with the PDF magic bytes", async () => {
  const buffer = await collectBuffer(renderQuotePdf(SAMPLE_QUOTE));
  assert.equal(buffer.subarray(0, 5).toString("ascii"), "%PDF-");
});

test("renderQuotePdf: produces a non-trivial, well-formed document (has an EOF marker)", async () => {
  const buffer = await collectBuffer(renderQuotePdf(SAMPLE_QUOTE));
  assert.ok(buffer.length > 500, "expected a real multi-section PDF, not an empty shell");
  assert.ok(buffer.toString("latin1").includes("%%EOF"));
});

test("renderQuotePdf: handles an empty line list without throwing", async () => {
  const buffer = await collectBuffer(renderQuotePdf({ ...SAMPLE_QUOTE, lines: [] }));
  assert.equal(buffer.subarray(0, 5).toString("ascii"), "%PDF-");
});

// Multi-page safety (task §15): 1 / 5 / 12+ items, long text, long notes.
for (const n of [1, 5, 12, 24]) {
  test(`renderQuotePdf: renders a well-formed document for ${n} line items`, async () => {
    const buffer = await collectBuffer(renderQuotePdf({ ...SAMPLE_QUOTE, lines: makeLines(n) }));
    assert.equal(buffer.subarray(0, 5).toString("ascii"), "%PDF-");
    assert.ok(buffer.toString("latin1").includes("%%EOF"));
  });
}

test("renderQuotePdf: handles very long descriptions, names and notes without throwing", async () => {
  const buffer = await collectBuffer(
    renderQuotePdf({
      ...SAMPLE_QUOTE,
      customer: { ...SAMPLE_QUOTE.customer, companyName: "A ".repeat(60) + "Very Long Company Name Pvt Ltd" },
      lines: [
        {
          description: "Product " + "with an extremely long specification line ".repeat(12),
          quantity: 500,
          unit: "piece",
          unitPrice: 99.5,
          lineTotal: 49750,
        },
      ],
      customerNotes: "Note paragraph. ".repeat(120),
    }),
  );
  assert.equal(buffer.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok(buffer.toString("latin1").includes("%%EOF"));
});

// ── buildQuoteView (pure) ────────────────────────────────────────────

test("buildQuoteView: formats the expiry as a real customer-facing date (task §21C)", () => {
  const view = buildQuoteView(SAMPLE_QUOTE);
  const validUntilRow = view.details.find((d) => d.label === "Valid Until");
  // en-GB short month: "Sept" for September, "Sep"/"Oct"/… elsewhere.
  assert.equal(validUntilRow.value, "09 Sept 2026");
  assert.equal(view.details.find((d) => d.label === "Quotation Date").value, "02 Sept 2026");
});

test("buildQuoteView: never emits 'No expiry set' — legacy null validUntil gets a policy fallback (task §21D)", () => {
  const view = buildQuoteView({ ...SAMPLE_QUOTE, validUntil: null });
  assert.equal(view.details.find((d) => d.label === "Valid Until").value, "7 days from the quotation date");
  assert.ok(!JSON.stringify(view).includes("No expiry set"));
});

test("buildQuoteView: 'Prepared For' only lists fields that have data", () => {
  const view = buildQuoteView({
    ...SAMPLE_QUOTE,
    customer: { name: "Solo Buyer", companyName: null, phone: null, email: null },
  });
  assert.equal(view.displayName, "Solo Buyer");
  assert.deepEqual(view.preparedFor, []);
});

test("buildQuoteView: splits a newline in the line description into a secondary spec line (task §8)", () => {
  const view = buildQuoteView(SAMPLE_QUOTE);
  assert.equal(view.lines[0].name, "Premium Cotton T-Shirt");
  assert.equal(view.lines[0].spec, "200 GSM • Combed cotton");
  assert.equal(view.lines[1].spec, null);
});

test("buildQuoteView: tax row only appears when taxAmount exists", () => {
  const withTax = buildQuoteView(SAMPLE_QUOTE).totals.map((t) => t.label);
  const noTax = buildQuoteView({ ...SAMPLE_QUOTE, taxAmount: null }).totals.map((t) => t.label);
  assert.deepEqual(withTax, ["Subtotal", "GST (manual)", "Grand Total"]);
  assert.deepEqual(noTax, ["Subtotal", "Grand Total"]);
});

test("buildQuoteView: amounts render with the ₹ symbol", () => {
  const view = buildQuoteView(SAMPLE_QUOTE);
  assert.equal(view.totals.find((t) => t.label === "Grand Total").value, "₹15,600.00");
  assert.equal(view.lines[0].amount, "₹14,900.00");
});

// ── Footer website: never a localhost / loopback host (task §12/§22) ──

test("buildQuoteView: footer website is the canonical domain when PUBLIC_APP_URL is localhost", () => {
  const original = process.env.PUBLIC_APP_URL;
  try {
    for (const dev of ["http://localhost:5187", "http://127.0.0.1:3000", "https://api.local", "http://0.0.0.0:8080"]) {
      process.env.PUBLIC_APP_URL = dev;
      const view = buildQuoteView(SAMPLE_QUOTE);
      assert.equal(view.footer.website, "primelinorbulk.com", `for ${dev}`);
      assert.ok(!/localhost|127\.0\.0\.1/.test(JSON.stringify(view.footer)));
    }
  } finally {
    process.env.PUBLIC_APP_URL = original;
  }
});

test("buildQuoteView: footer website uses a real public PUBLIC_APP_URL when set", () => {
  const original = process.env.PUBLIC_APP_URL;
  try {
    process.env.PUBLIC_APP_URL = "https://www.primelinorbulk.com/";
    assert.equal(buildQuoteView(SAMPLE_QUOTE).footer.website, "primelinorbulk.com");
  } finally {
    process.env.PUBLIC_APP_URL = original;
  }
});

test("renderQuotePdf: a rendered dev PDF's view carries no localhost host", async () => {
  const original = process.env.PUBLIC_APP_URL;
  try {
    process.env.PUBLIC_APP_URL = "http://localhost:5187";
    const view = buildQuoteView(SAMPLE_QUOTE);
    assert.equal(view.footer.website, "primelinorbulk.com");
    const buffer = await collectBuffer(renderQuotePdf(SAMPLE_QUOTE));
    assert.equal(buffer.subarray(0, 5).toString("ascii"), "%PDF-");
  } finally {
    process.env.PUBLIC_APP_URL = original;
  }
});

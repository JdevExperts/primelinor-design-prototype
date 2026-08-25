const test = require("node:test");
const assert = require("node:assert/strict");
const { renderQuotePdf } = require("../src/services/quotePdf");

const SAMPLE_QUOTE = {
  reference: "PL-RQ-2026-000123-V1",
  rfqReference: "PL-RQ-2026-000123",
  version: 1,
  status: "SENT",
  customer: { name: "Priya Sharma", companyName: "Example Corp" },
  currency: "INR",
  lines: [
    { description: "Premium Cotton T-Shirt", quantity: 100, unit: "piece", unitPrice: 149, lineTotal: 14900 },
    { description: "Standard delivery", quantity: null, unit: null, unitPrice: null, lineTotal: 500 },
  ],
  subtotal: 15400,
  taxMode: "GST (manual)",
  taxAmount: 200,
  grandTotal: 15600,
  validUntil: new Date(Date.now() + 7 * 86400000),
  customerNotes: "Delivery in 10 working days.",
  sentAt: new Date(),
};

function collectBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
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

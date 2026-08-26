const test = require("node:test");
const assert = require("node:assert/strict");
const { extractTable, parsePgTextArray, unescapeCopyField } = require("../scripts/lib/legacySqlParser");

const SAMPLE_DUMP = [
  "SET statement_timeout = 0;",
  "",
  "COPY public.widgets (id, name, notes, tags) FROM stdin;",
  "1\tFirst Widget\tLine one\\nLine two\t{a,b,c}",
  "2\tSecond Widget\t\\N\t{}",
  "\\.",
  "",
  "COPY public.empty_table (id) FROM stdin;",
  "\\.",
].join("\n");

test("extractTable: parses a COPY block into an array of column-keyed objects", () => {
  const rows = extractTable(SAMPLE_DUMP, "widgets");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].id, "1");
  assert.equal(rows[0].name, "First Widget");
});

test("extractTable: unescapes embedded \\n as a real newline", () => {
  const rows = extractTable(SAMPLE_DUMP, "widgets");
  assert.equal(rows[0].notes, "Line one\nLine two");
});

test("extractTable: maps \\N to null", () => {
  const rows = extractTable(SAMPLE_DUMP, "widgets");
  assert.equal(rows[1].notes, null);
});

test("extractTable: returns an empty array for an empty COPY block", () => {
  assert.deepEqual(extractTable(SAMPLE_DUMP, "empty_table"), []);
});

test("extractTable: returns an empty array for a table absent from the dump", () => {
  assert.deepEqual(extractTable(SAMPLE_DUMP, "does_not_exist"), []);
});

test("parsePgTextArray: parses a populated array literal", () => {
  assert.deepEqual(parsePgTextArray("{S,M,L,XL}"), ["S", "M", "L", "XL"]);
});

test("parsePgTextArray: parses an empty array literal", () => {
  assert.deepEqual(parsePgTextArray("{}"), []);
});

test("unescapeCopyField: a lone \\N is null, not the literal string", () => {
  assert.equal(unescapeCopyField("\\N"), null);
});

test("unescapeCopyField: unescapes tab/newline/carriage-return/backslash", () => {
  assert.equal(unescapeCopyField("a\\tb"), "a\tb");
  assert.equal(unescapeCopyField("a\\nb"), "a\nb");
  assert.equal(unescapeCopyField("a\\\\b"), "a\\b");
});

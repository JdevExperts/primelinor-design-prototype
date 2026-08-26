/**
 * Minimal, safe parser for the ONE thing this backfill needs from a plain
 * pg_dump SQL file: its `COPY <table> (...) FROM stdin; ... \.` data
 * blocks. Deliberately not a general SQL engine — reading this file is
 * inspection/extraction only (Phase 6A §5/§6); nothing here ever executes
 * against a live database connection, old or new.
 *
 * pg_dump's text-format COPY output is well-defined: one row per line,
 * tab-separated columns, with `\N`, `\t`, `\n`, `\r`, `\\` as the only
 * backslash escapes a text-format dump emits (see PostgreSQL docs, "File
 * Formats" › COPY). Every row in this dump is confirmed on a single
 * physical line (embedded newlines already arrive pre-escaped as literal
 * `\n`), so a line-based split is safe here.
 */
const fs = require("node:fs");

function unescapeCopyField(raw) {
  // `\N` is COPY's NULL marker only when it's the field's entire (unescaped)
  // value — never a partial-field substring — so this check must come
  // before the character-by-character unescape below.
  if (raw === "\\N") return null;
  let out = "";
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i] === "\\" && i + 1 < raw.length) {
      const map = { t: "\t", n: "\n", r: "\r", "\\": "\\" };
      const next = raw[i + 1];
      if (map[next] !== undefined) {
        out += map[next];
        i += 1;
        continue;
      }
    }
    out += raw[i];
  }
  return out;
}

/** `{a,b,c}` → `["a","b","c"]`; `{}` → `[]`. Postgres text[] array literal, no nested quoting needed for this dataset (plain alphanumeric size codes only). */
function parsePgTextArray(value) {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed === "{}") return [];
  const inner = trimmed.replace(/^\{/, "").replace(/\}$/, "");
  if (!inner) return [];
  return inner.split(",").map((s) => s.trim());
}

/**
 * Extracts and parses every row from `COPY public.<table> (<cols>) FROM
 * stdin; ... \.` for the given table name. Returns an array of plain
 * objects keyed by column name, with `\N` mapped to `null` and Postgres
 * backslash escapes undone. Returns `[]` if the table has no COPY block
 * (empty table) or isn't present in the dump.
 */
function extractTable(sqlText, tableName) {
  const headerRe = new RegExp(`^COPY public\\.${tableName} \\(([^)]*)\\) FROM stdin;$`, "m");
  const headerMatch = headerRe.exec(sqlText);
  if (!headerMatch) return [];

  const columns = headerMatch[1].split(",").map((c) => c.trim());
  // Search from the newline immediately after the header's ";" (not past
  // it) — for an empty table that newline is itself the start of "\n\.",
  // so the terminator search must include it or an empty COPY block's
  // terminator is never found (off-by-one, caught by
  // legacySqlParser.test.js's empty-table case).
  const searchFrom = headerMatch.index + headerMatch[0].length;
  const terminatorIndex = sqlText.indexOf("\n\\.", searchFrom);
  if (terminatorIndex === -1) {
    throw new Error(`Malformed dump: no terminator found for table "${tableName}"`);
  }
  const bodyStart = searchFrom + 1;

  const body = sqlText.slice(bodyStart, terminatorIndex);
  if (!body) return [];

  return body.split("\n").map((line) => {
    const fields = line.split("\t").map(unescapeCopyField);
    const row = {};
    columns.forEach((col, i) => {
      row[col] = fields[i] === undefined ? null : fields[i];
    });
    return row;
  });
}

function loadLegacyDump(filePath) {
  const sqlText = fs.readFileSync(filePath, "utf8");
  return {
    categories: extractTable(sqlText, "categories"),
    products: extractTable(sqlText, "products").map((p) => ({
      ...p,
      available_sizes: parsePgTextArray(p.available_sizes),
    })),
    pricingSlabs: extractTable(sqlText, "pricing_slabs"),
    productImages: extractTable(sqlText, "product_images"),
    fabricTypes: extractTable(sqlText, "fabric_types"),
    styles: extractTable(sqlText, "styles"),
  };
}

module.exports = { extractTable, parsePgTextArray, unescapeCopyField, loadLegacyDump };

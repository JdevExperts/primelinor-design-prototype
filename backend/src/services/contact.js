/**
 * Find-or-create resolution for Contact/Company, shared by the Lead and RFQ
 * creation paths. Deliberately conservative — this is intake, not a CRM
 * merge tool:
 *
 *  - Phone (normalized) is the ONLY dedup key for Contact. Email is stored
 *    but never used to match, since it's optional and far less reliable
 *    for this WhatsApp-first audience.
 *  - Company matching is exact, case-insensitive name match only. No fuzzy
 *    matching, no domain inference — two different companies must never be
 *    silently merged because their names happen to be similar.
 *  - An existing Contact's company is never reassigned by a later
 *    submission. If they already belong to a company, a different
 *    companyName on a new submission is recorded on the Lead/RFQ's own
 *    sourceContext (by the caller) but does not touch the Contact record.
 *    This avoids a spoofed or mistyped company name silently moving a real
 *    contact to a different company.
 *
 * `db` is expected to be a Prisma transaction client (or the shared client)
 * so this participates in the caller's transaction.
 */
async function resolveCompany(db, companyName) {
  const trimmed = companyName?.trim();
  if (!trimmed) return null;

  const existing = await db.company.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing;

  return db.company.create({ data: { name: trimmed } });
}

async function resolveContact(db, { name, phone, phoneRaw, email, companyName }) {
  const existing = await db.contact.findUnique({ where: { phone } });

  if (existing) {
    // Update display fields opportunistically (people retype their name
    // consistently; phone is the stable key) but never touch companyId.
    return db.contact.update({
      where: { id: existing.id },
      data: {
        name: name || existing.name,
        email: email || existing.email,
        companyNameRaw: companyName || existing.companyNameRaw,
      },
    });
  }

  const company = await resolveCompany(db, companyName);

  return db.contact.create({
    data: {
      name,
      phone,
      phoneRaw,
      email: email || null,
      companyId: company?.id || null,
      companyNameRaw: companyName || null,
    },
  });
}

module.exports = { resolveContact, resolveCompany };

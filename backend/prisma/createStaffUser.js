#!/usr/bin/env node
/**
 * The only way to create a StaffUser (Phase 3 §41) — there is no public
 * signup endpoint. Run directly:
 *
 *   node prisma/createStaffUser.js --email=you@primelinor.example --name="Your Name" --role=ADMIN
 *
 * Password: pass --password=... yourself, or omit it and this script
 * generates a random one and prints it ONCE — it is never logged or
 * stored anywhere else (only its bcrypt hash is persisted). No password is
 * ever hardcoded in source.
 *
 * Production (Phase 6B §71): refuses to run when NODE_ENV=production unless
 * ALLOW_ADMIN_BOOTSTRAP=true is set for that one invocation — this is the
 * intended way to create the very first production admin (there is no
 * seeded default account; prisma/seed.js never creates a StaffUser row).
 */
const crypto = require("node:crypto");
const prisma = require("../src/lib/prisma");
const { hashPassword } = require("../src/services/auth");

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const match = raw.match(/^--([a-zA-Z]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

function generatePassword() {
  return crypto.randomBytes(18).toString("base64url");
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_ADMIN_BOOTSTRAP !== "true") {
    console.error(
      "Refusing to run: NODE_ENV=production. Set ALLOW_ADMIN_BOOTSTRAP=true for this one " +
        "invocation if genuinely intended (e.g. creating the first production admin).",
    );
    process.exitCode = 1;
    return;
  }

  const args = parseArgs(process.argv.slice(2));
  const email = args.email?.trim().toLowerCase();
  const name = args.name?.trim();
  const role = (args.role || "SALES").toUpperCase();

  if (!email || !name) {
    console.error('Usage: node prisma/createStaffUser.js --email=you@example.com --name="Your Name" --role=ADMIN [--password=...]');
    process.exitCode = 1;
    return;
  }
  if (!["ADMIN", "SALES"].includes(role)) {
    console.error('--role must be "ADMIN" or "SALES"');
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.staffUser.findUnique({ where: { email } });
  if (existing) {
    console.error(`A staff user with email ${email} already exists (id: ${existing.id}).`);
    process.exitCode = 1;
    return;
  }

  const password = args.password || generatePassword();
  const passwordHash = await hashPassword(password);

  const staffUser = await prisma.staffUser.create({
    data: { email, name, role, passwordHash },
  });

  console.log(`Created staff user: ${staffUser.name} <${staffUser.email}> [${staffUser.role}] (id: ${staffUser.id})`);
  if (!args.password) {
    console.log(`Generated password (shown once — save it now): ${password}`);
  }
}

main()
  .catch((err) => {
    console.error("Failed to create staff user:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

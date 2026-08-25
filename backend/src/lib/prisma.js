const { PrismaClient } = require("@prisma/client");

// Single shared client instance for the process.
const prisma = new PrismaClient();

module.exports = prisma;

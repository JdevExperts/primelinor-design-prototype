const { z } = require("zod");

const loginSchema = z
  .object({
    email: z.string().trim().email().max(200),
    password: z.string().min(1).max(200),
  })
  .strict();

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(10, "New password must be at least 10 characters").max(200),
  })
  .strict();

module.exports = { loginSchema, changePasswordSchema };

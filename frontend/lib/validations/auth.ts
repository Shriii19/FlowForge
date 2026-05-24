import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be under 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),

  mobile: z.string().optional(),

  description: z.string().optional(),

  members: z.union([z.string(), z.number()]).optional(),

  due: z.string().optional(),

  tags: z.any().optional(),
});
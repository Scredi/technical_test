import { z } from "zod";

export const userSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  phone: z.string().nullable(),
  role: z.enum([
    "administrator",
    "formalist_manager",
    "formalist",
    "account_manager",
    "customer",
    "support",
  ]),
});

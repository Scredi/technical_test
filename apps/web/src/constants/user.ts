import type { UserRole } from "@/types/user";

export const roleOptions: { value: UserRole; label: string }[] = [
  { value: "administrator", label: "Administrateur" },
  { value: "formalist_manager", label: "Responsable formaliste" },
  { value: "formalist", label: "Formaliste" },
  { value: "account_manager", label: "Gestionnaire de compte" },
  { value: "customer", label: "Client" },
  { value: "support", label: "Support" },
];

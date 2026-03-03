export type UserRole =
  | "administrator"
  | "formalist_manager"
  | "formalist"
  | "account_manager"
  | "customer"
  | "support";

export type UserStatus = "disabled" | "pending" | "enabled" | "active";

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string | null;
  uuid: string;
  created_at: string | null;
  changed_at: string | null;
  enabled: boolean;
  status: UserStatus;
  accepted_terms_on: string | null;
  last_login_on: string | null;
}

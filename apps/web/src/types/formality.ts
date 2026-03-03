import type { User } from "@/types/user";

export type FormalityType = "creation" | "modification" | "dépot des comptes";

export interface Formality {
  uuid: string;
  company: string;
  type: FormalityType;
  owner: User;
  status: string;
  creation_date: string;
  modification_date: string;
}

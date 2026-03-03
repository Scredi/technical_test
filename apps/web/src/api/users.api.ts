import { fetchApi } from "@/api/client";
import type { User } from "@/types/user";

export function getUsers() {
  return fetchApi<User[]>("/users");
}

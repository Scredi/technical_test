import { fetchApi } from "@/api/client";
import type { User } from "@/types/user";

export function getUsers() {
  return fetchApi<User[]>("/users");
}

export function getUser(uuid: string) {
  return fetchApi<User>(`/users/${uuid}`);
}

export function updateUser(uuid: string, data: Partial<User>) {
  return fetchApi<User>(`/users/${uuid}`, {
    method: "PATCH",
    body: data,
  });
}

export function createUser(data: Partial<User>) {
  return fetchApi<User>("/users", {
    method: "POST",
    body: data,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUser, createUser } from "@/api/users.api";
import type { User } from "@/types/user";

export function useUser(uuid: string) {
  return useQuery({
    queryKey: ["users", uuid],
    queryFn: () => getUser(uuid),
    enabled: !!uuid,
  });
}

export function useUpdateUser(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => updateUser(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", uuid] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

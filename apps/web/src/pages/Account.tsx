import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  Badge,
} from "@repo/ui";
import { fetchApi } from "@/api/client";
import type { User } from "@/types/user";

const CURRENT_USER_UUID = "u-1";

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(s));
}

export function Account() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", CURRENT_USER_UUID],
    queryFn: () => fetchApi<User>(`/users/${CURRENT_USER_UUID}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Mon compte</h1>
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Mon compte</h1>
        <p className="text-destructive">
          Erreur: {error?.message ?? "Utilisateur introuvable"}
        </p>
      </div>
    );
  }

  const initials = `${user.first_name[0]}${user.last_name[0]}`;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Mon compte</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vos informations personnelles.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{user.role}</Badge>
                <Badge variant={user.enabled ? "default" : "destructive"}>
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Téléphone
            </span>
            <p className="text-sm">{user.phone ?? "—"}</p>
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Dernière connexion
            </span>
            <p className="text-sm">{formatDate(user.last_login_on)}</p>
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Compte créé le
            </span>
            <p className="text-sm">{formatDate(user.created_at)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

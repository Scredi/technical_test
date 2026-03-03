import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
  Button,
} from "@repo/ui";
import { fetchApi } from "@/api/client";
import { Formality } from "@/types/formality";

const typeLabels: Record<string, string> = {
  creation: "Création",
  modification: "Modification",
  "dépot des comptes": "Dépôt des comptes",
};

function formatDate(d: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

export function FormalityDetail() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const {
    data: formality,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["formalities", uuid ?? ""],
    queryFn: () => fetchApi<Formality>(`/formalities/${uuid}`),
    enabled: !!uuid,
  });

  if (!uuid) {
    return (
      <div className="space-y-6">
        <p className="text-destructive">Identifiant manquant.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Détail de la formalité</h1>
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  if (error || !formality) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Détail de la formalité</h1>
        <p className="text-destructive">
          Erreur: {error?.message ?? "Formalité introuvable"}
        </p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  const { owner } = formality;
  const ownerInitials = `${owner.first_name[0]}${owner.last_name[0]}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
        >
          ← Retour
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{formality.company}</CardTitle>
          <CardDescription>Formalité {formality.uuid}</CardDescription>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">
              {typeLabels[formality.type] ?? formality.type}
            </Badge>
            <Badge
              variant={
                formality.status === "Validé"
                  ? "default"
                  : formality.status === "Refusé"
                    ? "destructive"
                    : "outline"
              }
            >
              {formality.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Date de création
            </span>
            <p className="text-sm">{formatDate(formality.creation_date)}</p>
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Dernière modification
            </span>
            <p className="text-sm">{formatDate(formality.modification_date)}</p>
          </div>
          <div className="border-t pt-4">
            <span className="text-sm font-medium text-muted-foreground block mb-2">
              Responsable
            </span>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{ownerInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {owner.first_name} {owner.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{owner.email}</p>
                <Badge variant="outline" className="mt-1">
                  {owner.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

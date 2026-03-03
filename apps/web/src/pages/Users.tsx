import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui";
import { useUsers } from "@/hooks/useUsers";

const roleLabels: Record<string, string> = {
  administrator: "Administrateur",
  formalist_manager: "Responsable formaliste",
  formalist: "Formaliste",
  account_manager: "Gestionnaire de compte",
  customer: "Client",
  support: "Support",
};

const PAGE_SIZE = 10;

export function Users() {
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useUsers();
  const [page, setPage] = useState(1);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Utilisateurs</h1>
            <p className="text-muted-foreground mt-1">
              Liste des comptes et édition individuelle.
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Utilisateurs</h1>
        <p className="text-destructive">Erreur: {error.message}</p>
      </div>
    );
  }

  const allRows = users ?? [];
  const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const rows = allRows.slice(startIndex, startIndex + PAGE_SIZE);
  const shownStart = allRows.length === 0 ? 0 : startIndex + 1;
  const shownEnd = Math.min(startIndex + PAGE_SIZE, allRows.length);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Liste des comptes utilisateurs et edition individuelle.
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/users/new")}>
          Créer un utilisateur
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center text-muted-foreground py-8"
                  colSpan={5}
                >
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            ) : (
              rows.map((user) => (
                <TableRow key={user.uuid}>
                  <TableCell>
                    <span className="font-medium">
                      {user.first_name} {user.last_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {roleLabels[user.role] ?? user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "enabled"
                          ? "default"
                          : user.status === "disabled"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/users/${user.uuid}`)}
                    >
                      Éditer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {shownStart}-{shownEnd} sur {allRows.length}
        </div>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setPage(currentPage - 1);
                }}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === p}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setPage(currentPage + 1);
                }}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

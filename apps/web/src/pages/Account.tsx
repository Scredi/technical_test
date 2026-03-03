import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@repo/ui";
import { fetchApi } from "@/api/client";
import { useUpdateUser } from "@/hooks/useUser";
import { userSchema } from "@/schemas/user";
import { roleOptions } from "@/constants/user";
import type { User, UserFormValues } from "@/types/user";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", CURRENT_USER_UUID],
    queryFn: () => fetchApi<User>(`/users/${CURRENT_USER_UUID}`),
  });

  const { mutate, isPending } = useUpdateUser(CURRENT_USER_UUID);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "customer",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
      });
    }
  }, [user, form]);

  function onSubmit(values: UserFormValues) {
    setSubmitError(null);
    mutate(
      { ...values, phone: values.phone || null },
      {
        onSuccess: () => {
          toast({
            title: "Succès",
            description: "Informations sauvegardées avec succès",
          });
          navigate("/dashboard");
        },
        onError: (err) => setSubmitError(err.message),
      },
    );
  }

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

  const initials = `${user.first_name[0] || ""}${user.last_name[0] || ""}`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <p className="text-muted-foreground mt-1">
          Consultez et modifiez vos informations personnelles.
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl bg-slate-100 text-slate-900 border">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="grid gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Téléphone
                </span>
                <p className="text-sm">{user.phone ?? "—"}</p>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Dernière connexion
                </span>
                <p className="text-sm">{formatDate(user.last_login_on)}</p>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Compte créé le
                </span>
                <p className="text-sm">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Modifier mes informations</CardTitle>
          <CardDescription>
            Les champs marqués d'un astérisque sont obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? "Enregistrement…"
                    : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

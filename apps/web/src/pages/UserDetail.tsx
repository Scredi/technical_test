import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@repo/ui";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { userSchema } from "@/schemas/user";
import type { UserRole, UserFormValues } from "@/types/user";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "administrator", label: "Administrateur" },
  { value: "formalist_manager", label: "Responsable formaliste" },
  { value: "formalist", label: "Formaliste" },
  { value: "account_manager", label: "Gestionnaire de compte" },
  { value: "customer", label: "Client" },
  { value: "support", label: "Support" },
];

export function UserDetail() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user, isLoading, error } = useUser(uuid ?? "");
  const { mutate, isPending } = useUpdateUser(uuid ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);

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
          navigate("/dashboard/users");
        },
        onError: (err) => setSubmitError(err.message),
      },
    );
  }

  if (!uuid) {
    return (
      <div className="space-y-6">
        <p className="text-destructive">Identifiant manquant.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/users")}>
          Retour
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Édition utilisateur</h1>
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Édition utilisateur</h1>
        <p className="text-destructive">
          Erreur: {error?.message ?? "Utilisateur introuvable"}
        </p>
        <Button variant="outline" onClick={() => navigate("/dashboard/users")}>
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard/users")}
      >
        ← Retour
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Editer un utilisateur</CardTitle>
          <CardDescription>
            Modifiez les informations principales du compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

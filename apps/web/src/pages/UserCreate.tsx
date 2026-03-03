import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useCreateUser } from "@/hooks/useUser";
import { userSchema } from "@/schemas/user";
import { roleOptions } from "@/constants/user";
import type { UserFormValues } from "@/types/user";

export function UserCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate, isPending } = useCreateUser();
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

  function onSubmit(values: UserFormValues) {
    setSubmitError(null);
    mutate(
      { ...values, phone: values.phone || null },
      {
        onSuccess: () => {
          toast({
            title: "Succès",
            description: "Utilisateur créé avec succès",
          });
          navigate("/dashboard/users");
        },
        onError: (err) => setSubmitError(err.message),
      },
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
          <CardTitle>Créer un utilisateur</CardTitle>
          <CardDescription>
            Ajoutez un nouveau compte utilisateur.
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
                        <Input autoFocus {...field} />
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
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Création…" : "Créer l'utilisateur"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

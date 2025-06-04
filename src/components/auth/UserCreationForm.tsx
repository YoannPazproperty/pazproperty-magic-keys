
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { createUser } from "../../services/auth/userCreationService";
import type { UserRole } from "../../hooks/auth/types";

const formSchema = z.object({
  email: z.string().email("Veuillez entrer un email valide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "employee", "provider", "customer", "user", "referral_partner", "manager"]),
  userName: z.string().min(2, "Le nom d'utilisateur doit contenir au moins 2 caractères"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export interface UserCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  context?: string;
  showRoleSelector?: boolean;
  allowedRoles?: string[];
  additionalMetadata?: { is_company_user: boolean; domain: string };
}

export const UserCreationForm: React.FC<UserCreationFormProps> = ({
  onSuccess,
  onCancel,
  context,
  showRoleSelector = true,
  allowedRoles = ["admin", "employee", "provider", "customer", "user", "referral_partner", "manager"],
  additionalMetadata,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      userName: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const result = await createUser({
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
        metadata: {
          userName: data.userName,
          ...additionalMetadata,
        },
      });

      if (result.success) {
        toast.success("Utilisateur créé avec succès");
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.message || "Erreur lors de la création de l'utilisateur");
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      toast.error("Erreur lors de la création de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si l'utilisateur a les droits d'admin
  if (!user || user.role !== "admin") {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Vous n'avez pas les droits nécessaires pour créer des utilisateurs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Créer un utilisateur</CardTitle>
        <CardDescription>
          Remplissez les informations pour créer un nouvel utilisateur
          {context && ` (Contexte: ${context})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d'utilisateur</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="john@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showRoleSelector && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allowedRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role === "admin" ? "Administrateur" :
                             role === "employee" ? "Employé" :
                             role === "provider" ? "Prestataire" :
                             role === "customer" ? "Client" :
                             role === "user" ? "Utilisateur" :
                             role === "referral_partner" ? "Partenaire" :
                             role === "manager" ? "Manager" : role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Création..." : "Créer l'utilisateur"}
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1"
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

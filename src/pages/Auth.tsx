import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

const registerSchema = z
  .object({
    email: z.string().email("Adresse e-mail invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    fullName: z.string().min(1, "Le nom complet est requis"),
    company: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const Auth = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot-password">("login");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      company: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onLoginSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const { success, error } = await signIn(values.email, values.password);
      if (success) {
        navigate("/admin");
      } else if (error) {
        console.error("Erreur de connexion:", error);
        
        if (error.message && error.message.includes("Database error querying schema")) {
          toast.error("Problème temporaire de connexion à la base de données", {
            description: "Veuillez réessayer dans quelques instants. Si le problème persiste, contactez l'administrateur.",
          });
        } else if (error.message && error.message.includes("Invalid login credentials")) {
          toast.error("Identifiants invalides", {
            description: "Vérifiez votre adresse e-mail et votre mot de passe.",
          });
        } else {
          toast.error("Échec de connexion", {
            description: error.message || "Veuillez réessayer ou contacter l'administrateur",
          });
        }
      }
    } catch (error: any) {
      toast.error("Erreur de connexion", {
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      });
      console.error("Erreur lors de la tentative de connexion:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    console.log("Registration values:", values);
    alert("L'inscription n'est pas en libre-service. Veuillez contacter votre administrateur pour créer un compte.");
  };

  const handleForgotPassword = async (values: ForgotPasswordValues) => {
    setLoading(true);
    setResetError(null);
    try {
      const { error, success, message } = await useAuth().resetPassword(values.email);
      
      if (error) {
        console.error("Erreur détaillée lors de la récupération du mot de passe:", error);
        setResetError(message || error.message || "Échec de l'envoi du lien de récupération");
        
        toast.error("Échec de l'envoi du lien de récupération", {
          description: message || error.message || "Une erreur est survenue lors de l'envoi",
        });
      } else {
        setResetEmailSent(true);
        toast.success("Email envoyé", {
          description: message || "Si cette adresse existe dans notre système, vous recevrez un email avec les instructions.",
        });
      }
    } catch (err: any) {
      console.error("Exception lors de la récupération du mot de passe:", err);
      setResetError("Une erreur technique s'est produite");
      toast.error("Erreur technique", {
        description: "Une erreur est survenue lors de la demande de récupération de mot de passe.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Pazproperty Admin</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous pour accéder à l'interface d'administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register" | "forgot-password")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">S'inscrire</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse e-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                    
                    <div className="text-sm text-center text-muted-foreground">
                      <button 
                        type="button"
                        onClick={() => setActiveTab("forgot-password")}
                        className="hover:underline text-primary"
                      >
                        Mot de passe oublié?
                      </button>
                    </div>
                  </form>
                </Form>
                
                <div className="mt-4 relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full mt-4 opacity-50"
                  disabled={true}
                >
                  <FcGoogle className="mr-2 h-6 w-6" />
                  Google (désactivé temporairement)
                </Button>
              </TabsContent>
              
              <TabsContent value="register" className="mt-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Jean Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse e-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entreprise (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de l'entreprise" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      Demande d'inscription
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="forgot-password" className="mt-4">
                {resetEmailSent ? (
                  <div className="space-y-4">
                    <Alert variant="default" className="bg-green-50 border-green-200">
                      <AlertDescription className="text-green-800">
                        Si cette adresse e-mail existe dans notre système, vous recevrez un lien pour réinitialiser votre mot de passe.
                        Veuillez vérifier votre boîte de réception (et vos spams).
                      </AlertDescription>
                    </Alert>
                    <Button 
                      type="button"
                      className="w-full"
                      onClick={() => {
                        setResetEmailSent(false);
                        setActiveTab("login");
                      }}
                    >
                      Retour à la connexion
                    </Button>
                  </div>
                ) : (
                  <Form {...forgotPasswordForm}>
                    <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                      <FormField
                        control={forgotPasswordForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse e-mail</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="votre@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {resetError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {resetError}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Envoi en cours..." : "Envoyer le lien de récupération"}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("login")}
                      >
                        Retour à la connexion
                      </Button>
                    </form>
                  </Form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-xs text-amber-700">
                Cette interface est réservée au personnel autorisé de Pazproperty.
                {activeTab === "login" && " Utilisez votre adresse e-mail professionnelle pour vous connecter."}
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

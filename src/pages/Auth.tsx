import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { AlertCircle, Info, Wrench } from "lucide-react";
import { toast } from "sonner";
import { fixConfirmationTokens, generatePasswordResetLink } from "@/services/supabase/auth";

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
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as "login" | "register" | "forgot-password" || "login";
  
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot-password">(
    initialTab === "forgot-password" ? "forgot-password" : initialTab === "register" ? "register" : "login"
  );
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isFixingTokens, setIsFixingTokens] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [prefilledEmail] = useState<string | null>(searchParams.get("email"));
  const isProviderLogin = searchParams.get("provider") === "true";

  // Initialiser les formulaires
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefilledEmail || "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: prefilledEmail || "",
      password: "",
      confirmPassword: "",
      fullName: "",
      company: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: prefilledEmail || "",
    },
  });

  // Effet pour pré-remplir les formulaires si l'email est fourni dans l'URL
  useEffect(() => {
    if (prefilledEmail) {
      loginForm.setValue("email", prefilledEmail);
      forgotPasswordForm.setValue("email", prefilledEmail);
      registerForm.setValue("email", prefilledEmail);
    }
  }, [prefilledEmail, loginForm, forgotPasswordForm, registerForm]);

  const onLoginSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      console.log("Tentative de connexion avec:", values.email);
      const { success, error } = await signIn(values.email, values.password);
      if (success) {
        toast.success("Connexion réussie", {
          description: "Vous êtes maintenant connecté."
        });
        // La redirection sera gérée par le hook useAuth en fonction du rôle
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

  const handleFixConfirmationTokens = async () => {
    setIsFixingTokens(true);
    try {
      const { success, message } = await fixConfirmationTokens();
      
      if (success) {
        toast.success("Base de données corrigée", {
          description: "Les tokens de confirmation ont été réparés avec succès. Vous pouvez maintenant réinitialiser votre mot de passe.",
        });
      } else {
        toast.error("Échec de la réparation", {
          description: message || "Une erreur est survenue lors de la réparation des tokens",
        });
      }
    } catch (err: any) {
      console.error("Erreur lors de la correction des tokens:", err);
      toast.error("Erreur technique", {
        description: "Une erreur s'est produite lors de la réparation de la base de données",
      });
    } finally {
      setIsFixingTokens(false);
    }
  };

  const handleForgotPassword = async (values: ForgotPasswordValues) => {
    console.log("Demande de réinitialisation pour:", values.email);
    setLoading(true);
    setResetError(null);
    setResetLink(null);
    
    try {
      const { success, message, resetLink } = await generatePasswordResetLink(values.email);
      
      if (!success) {
        setResetError(message);
        toast.error("Échec de la réinitialisation", {
          description: message,
        });
      } else {
        setResetEmailSent(true);
        
        if (resetLink) {
          setResetLink(resetLink);
          toast.info("Lien de réinitialisation généré", {
            description: "Pour des raisons de démonstration, le lien est affiché directement.",
            duration: 10000,
          });
        } else {
          toast.success("Email envoyé", {
            description: message,
          });
        }
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
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isProviderLogin ? "Extranet Técnica - Acesso" : "Pazproperty Admin"}
            </CardTitle>
            <CardDescription className="text-center">
              {isProviderLogin 
                ? "Acesse o Extranet Técnica para gerenciar suas ordens de serviço"
                : "Connectez-vous pour accéder à l'interface d'administration"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs remain the same, but we adjust the visibility of register tab for providers */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register" | "forgot-password")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                {!isProviderLogin && <TabsTrigger value="register">S'inscrire</TabsTrigger>}
                {isProviderLogin && <TabsTrigger value="forgot-password">Mot de passe oublié</TabsTrigger>}
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
                    
                    {resetLink && (
                      <div className="mt-4 space-y-2">
                        <Alert variant="default" className="bg-blue-50 border-blue-200">
                          <AlertDescription className="text-blue-800">
                            <p className="font-bold mb-1">Lien de réinitialisation (démo uniquement):</p>
                            <p className="break-all text-xs">{resetLink}</p>
                          </AlertDescription>
                        </Alert>
                        <Button 
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(resetLink, '_blank')}
                        >
                          Ouvrir le lien de réinitialisation
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      type="button"
                      className="w-full"
                      onClick={() => {
                        setResetEmailSent(false);
                        setResetLink(null);
                        setActiveTab("login");
                      }}
                    >
                      Retour à la connexion
                    </Button>
                  </div>
                ) : (
                  <>
                    <Alert className="mb-4 bg-amber-50 border-amber-200">
                      <Wrench className="h-4 w-4 text-amber-700" />
                      <AlertDescription className="text-amber-700 text-sm">
                        Si vous rencontrez des problèmes avec la réinitialisation de mot de passe, utilisez d'abord le bouton "Réparer la base de données" ci-dessous.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      type="button" 
                      className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
                      onClick={handleFixConfirmationTokens}
                      disabled={isFixingTokens}
                    >
                      {isFixingTokens ? "Réparation en cours..." : "Réparer la base de données"}
                    </Button>
                    
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
                          {loading ? "Envoi en cours..." : "Générer un lien de récupération"}
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
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-xs text-amber-700">
                {isProviderLogin 
                  ? "Cette interface est réservée aux prestataires de services de Pazproperty."
                  : "Cette interface est réservée au personnel autorisé de Pazproperty."}
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

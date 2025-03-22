
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FileUpload from "@/components/FileUpload"; // Correction de l'import
import { toast } from "sonner";

// Définition du schéma de validation avec une condition correcte pour Zod
const formSchema = z.object({
  categorieProbleme: z.string().min(1, "Veuillez sélectionner une catégorie"),
  description: z.string().min(10, "Veuillez fournir une description détaillée"),
  interventionNecessaire: z.boolean(),
  montantDevis: z.string().optional(),
  travauxRealises: z.string().optional(),
}).refine(data => {
  // Si une intervention est nécessaire, les travaux doivent être décrits
  if (data.interventionNecessaire && (!data.travauxRealises || data.travauxRealises.length < 10)) {
    return false;
  }
  return true;
}, {
  message: "Veuillez décrire les travaux à réaliser (minimum 10 caractères)",
  path: ["travauxRealises"]
});

type RapportFormValues = z.infer<typeof formSchema>;

interface TechnicienRapportFormProps {
  interventionId: number;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

const TechnicienRapportForm: React.FC<TechnicienRapportFormProps> = ({
  interventionId,
  onSubmitSuccess,
  onCancel
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [factureFile, setFactureFile] = useState<File[]>([]);
  
  // Initialiser le formulaire avec react-hook-form
  const form = useForm<RapportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categorieProbleme: "",
      description: "",
      interventionNecessaire: false,
      montantDevis: "",
      travauxRealises: "",
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = (data: RapportFormValues) => {
    // Ici nous simulons l'envoi du rapport et des fichiers au serveur
    console.log("Données du formulaire:", data);
    console.log("Photos/Vidéos:", files);
    console.log("Facture:", factureFile);
    
    // Afficher un message de succès
    toast.success("Rapport soumis avec succès");
    
    // Appeler la fonction de callback
    onSubmitSuccess();
  };

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Rapport d'intervention #{interventionId}</div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Catégorie du problème */}
          <FormField
            control={form.control}
            name="categorieProbleme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie du problème</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="plomberie">Plomberie</option>
                    <option value="electricite">Électricité</option>
                    <option value="serrurerie">Serrurerie</option>
                    <option value="menuiserie">Menuiserie</option>
                    <option value="chauffage">Chauffage/Climatisation</option>
                    <option value="autre">Autre</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Description du diagnostic */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description du diagnostic</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez en détail votre diagnostic du problème..."
                    className="resize-y"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Veuillez décrire précisément le problème constaté et votre diagnostic technique.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Photos/Vidéos */}
          <div className="space-y-2">
            <Label>Photos/Vidéos du problème</Label>
            <FileUpload
              onChange={setFiles}
              maxFiles={4}
              accept="image/*,video/*"
            />
            <p className="text-sm text-muted-foreground">
              Ajoutez jusqu'à 4 fichiers (photos ou vidéos) pour illustrer le problème.
            </p>
          </div>
          
          {/* Intervention nécessaire */}
          <FormField
            control={form.control}
            name="interventionNecessaire"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Une intervention est nécessaire
                  </FormLabel>
                  <FormDescription>
                    Cochez cette case si des travaux ou réparations sont nécessaires.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {form.watch("interventionNecessaire") && (
            <Card className="p-4 space-y-4">
              {/* Montant du devis */}
              <FormField
                control={form.control}
                name="montantDevis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant du devis (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Description des travaux */}
              <FormField
                control={form.control}
                name="travauxRealises"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description des travaux à réaliser</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez les travaux nécessaires..."
                        className="resize-y"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Facture pro forma */}
              <div className="space-y-2">
                <Label>Facture pro forma</Label>
                <FileUpload
                  onChange={setFactureFile}
                  maxFiles={1}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p className="text-sm text-muted-foreground">
                  Ajoutez votre facture pro forma au format PDF ou image.
                </p>
              </div>
            </Card>
          )}
          
          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              Soumettre le rapport
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TechnicienRapportForm;

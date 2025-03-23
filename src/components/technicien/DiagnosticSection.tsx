
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { RapportFormValues } from "./rapportFormTypes";

interface DiagnosticSectionProps {
  form: UseFormReturn<RapportFormValues>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const DiagnosticSection: React.FC<DiagnosticSectionProps> = ({ form, files, setFiles }) => {
  return (
    <>
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
    </>
  );
};

export default DiagnosticSection;


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/FileUpload";
import { UseFormReturn } from "react-hook-form";
import { RapportFormValues } from "./rapportFormTypes";

interface InterventionSectionProps {
  form: UseFormReturn<RapportFormValues>;
  factureFile: File[];
  setFactureFile: React.Dispatch<React.SetStateAction<File[]>>;
}

const InterventionSection: React.FC<InterventionSectionProps> = ({ form, factureFile, setFactureFile }) => {
  return (
    <Card className="p-4 space-y-4">
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
  );
};

export default InterventionSection;

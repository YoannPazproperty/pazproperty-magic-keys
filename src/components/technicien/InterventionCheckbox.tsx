
import React from 'react';
import { FormField, FormItem, FormControl, FormLabel, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { RapportFormValues } from "./rapportFormTypes";

interface InterventionCheckboxProps {
  form: UseFormReturn<RapportFormValues>;
}

const InterventionCheckbox: React.FC<InterventionCheckboxProps> = ({ form }) => {
  return (
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
  );
};

export default InterventionCheckbox;

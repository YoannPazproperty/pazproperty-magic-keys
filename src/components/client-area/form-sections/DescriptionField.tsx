
import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormValues } from "../schema";

const DescriptionField = () => {
  const { control } = useFormContext<FormValues>();

  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Explique-nos o seu problema *</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Descreva o problema em detalhes. Quanto mais informações fornecer, melhor poderemos ajudar."
              className="min-h-[120px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DescriptionField;

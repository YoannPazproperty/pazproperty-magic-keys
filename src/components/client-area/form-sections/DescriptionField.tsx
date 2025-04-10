
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
          <FormLabel>Descrição do Problema *</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Por favor, descreva o problema em detalhes..."
              className="min-h-[120px] resize-y"
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


import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { FormValues } from "../schema";

const ProblemTypeField = () => {
  const { control } = useFormContext<FormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="problemType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Tipo de Problema *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="canalização" id="canalização" />
                  <label htmlFor="canalização" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Canalização
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="eletricidade" id="eletricidade" />
                  <label htmlFor="eletricidade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Eletricidade
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="predial" id="predial" />
                  <label htmlFor="predial" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Predial
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outro" id="outro" />
                  <label htmlFor="outro" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Outro
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProblemTypeField;

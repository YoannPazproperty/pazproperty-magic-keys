
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
    <FormField
      control={control}
      name="problemType"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>De que ordem é o problema? *</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="canalização" id="canalização" />
                <FormLabel htmlFor="canalização" className="font-normal cursor-pointer">
                  Canalização / Fuga de água?
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="eletricidade" id="eletricidade" />
                <FormLabel htmlFor="eletricidade" className="font-normal cursor-pointer">
                  Eletricidade?
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="predial" id="predial" />
                <FormLabel htmlFor="predial" className="font-normal cursor-pointer">
                  Problema no prédio?
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outro" id="outro" />
                <FormLabel htmlFor="outro" className="font-normal cursor-pointer">
                  Outro tipo de problema?
                </FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProblemTypeField;

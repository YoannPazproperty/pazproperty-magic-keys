
import React from "react";
import { Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormField from "./FormField";

interface RadioFieldGroupProps {
  value: string;
  onChange: (value: string) => void;
}

const RadioFieldGroup = ({ value, onChange }: RadioFieldGroupProps) => {
  return (
    <FormField id="tipo-usuario" label="É proprietário ou inquilino?" icon={<Home className="h-4 w-4" />}>
      <RadioGroup
        id="tipo-usuario"
        defaultValue="proprietario"
        value={value}
        onValueChange={onChange}
        className="flex flex-col space-y-1 sm:flex-row sm:space-x-6 sm:space-y-0"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="proprietario" id="proprietario" />
          <Label htmlFor="proprietario">Proprietário</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="inquilino" id="inquilino" />
          <Label htmlFor="inquilino">Inquilino</Label>
        </div>
      </RadioGroup>
    </FormField>
  );
};

export default RadioFieldGroup;

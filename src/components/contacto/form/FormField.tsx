import React, { ReactNode } from "react";
import { Label } from "../../ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
}

const FormField = ({ id, label, icon, children }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {icon} {label}
      </Label>
      {children}
    </div>
  );
};

export default FormField;

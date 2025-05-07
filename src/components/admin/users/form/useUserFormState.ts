
import { useState, useEffect } from "react";
import { CompanyUserLevel, generateTemporaryPassword } from "@/services/admin/company-users";
import { validateForm } from "./ValidationSchema";

export const useUserFormState = (isOpen: boolean) => {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    level: 'user' as CompanyUserLevel
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  
  // Generate a temporary password when the dialog is opened
  useEffect(() => {
    if (isOpen && !formValues.password) {
      setFormValues(prev => ({
        ...prev,
        password: generateTemporaryPassword()
      }));
    }
    
    // Reset errors when the dialog is opened
    if (isOpen) {
      setErrors({});
      setApiError(null);
    }
  }, [isOpen]);
  
  const handleChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
    
    // Clear the error when the field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
    
    // Clear the API error if email is changed (often related to existing email)
    if (field === 'email' && apiError) {
      setApiError(null);
    }
  };
  
  const resetForm = () => {
    setFormValues({
      name: '',
      email: '',
      password: generateTemporaryPassword(),
      level: 'user'
    });
    setErrors({});
    setApiError(null);
  };
  
  const validate = () => {
    const validation = validateForm(formValues);
    setErrors(validation.errors);
    return validation.isValid;
  };

  return {
    formValues,
    setFormValues,
    isSubmitting,
    setIsSubmitting,
    errors,
    setErrors,
    apiError,
    setApiError,
    showPassword,
    setShowPassword,
    handleChange,
    resetForm,
    validate
  };
};

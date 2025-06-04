import { isValidCompanyEmail } from "../../../services/admin/company-users";

export const validateForm = (formValues: {
  name: string;
  email: string;
  password: string;
}) => {
  const newErrors: Record<string, string> = {};
  
  if (!formValues.name.trim()) {
    newErrors.name = "Le nom est requis";
  }
  
  if (!formValues.email.trim()) {
    newErrors.email = "L'email est requis";
  } else if (!isValidCompanyEmail(formValues.email)) {
    newErrors.email = "L'email doit être une adresse @pazproperty.pt";
  }
  
  if (!formValues.password) {
    newErrors.password = "Le mot de passe est requis";
  } else if (formValues.password.length < 8) {
    newErrors.password = "Le mot de passe doit comporter au moins 8 caractères";
  }
  
  return { errors: newErrors, isValid: Object.keys(newErrors).length === 0 };
};

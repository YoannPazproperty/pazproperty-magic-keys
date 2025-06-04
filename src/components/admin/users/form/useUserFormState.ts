
import { useState } from 'react';

export interface FormErrors {
  [key: string]: string;
}

export const useUserFormState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearErrors = () => {
    setErrors({});
  };

  const setError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const setMultipleErrors = (errorArray: string[]) => {
    const errorObject: FormErrors = {};
    errorArray.forEach((error, index) => {
      errorObject[`error_${index}`] = error;
    });
    setErrors(errorObject);
  };

  return {
    isLoading,
    setIsLoading,
    errors,
    setErrors: setMultipleErrors,
    clearErrors,
    setError
  };
};

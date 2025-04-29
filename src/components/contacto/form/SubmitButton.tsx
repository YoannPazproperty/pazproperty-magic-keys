
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubmitButtonProps {
  isSubmitting: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting }) => {
  const { t } = useLanguage();
  
  return (
    <Button 
      type="submit" 
      className="w-full bg-brand-blue hover:bg-primary/90"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('contact.form.sending')}
        </>
      ) : (
        t('contact.form.submit')
      )}
    </Button>
  );
};

export default SubmitButton;

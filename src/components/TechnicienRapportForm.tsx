
import React from 'react';
import { Form } from "./ui/form";
import DiagnosticSection from './technicien/DiagnosticSection';
import InterventionSection from './technicien/InterventionSection';
import InterventionCheckbox from './technicien/InterventionCheckbox';
import FormActions from './technicien/FormActions';
import { useRapportForm } from './technicien/useRapportForm';
import { TechnicienRapportFormProps } from './technicien/rapportFormTypes';

const TechnicienRapportForm: React.FC<TechnicienRapportFormProps> = ({
  interventionId,
  intervention,
  onSubmitSuccess,
  onCancel
}) => {
  const {
    form,
    files,
    setFiles,
    factureFile,
    setFactureFile,
    isSubmitting,
    onSubmit
  } = useRapportForm(interventionId, intervention, onSubmitSuccess);

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Rapport d'intervention #{interventionId}</div>
      
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <DiagnosticSection 
            form={form} 
            files={files} 
            setFiles={setFiles} 
          />
          
          <InterventionCheckbox form={form} />
          
          {form.watch("interventionNecessaire") && (
            <InterventionSection 
              form={form} 
              factureFile={factureFile} 
              setFactureFile={setFactureFile} 
            />
          )}
          
          <FormActions 
            isSubmitting={isSubmitting} 
            onCancel={onCancel} 
          />
        </form>
      </Form>
    </div>
  );
};

export default TechnicienRapportForm;

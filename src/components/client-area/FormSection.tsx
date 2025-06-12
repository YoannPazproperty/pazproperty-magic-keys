import React from 'react';

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="p-6 border rounded-md">{children}</div>
    </div>
  );
};

export default FormSection; 
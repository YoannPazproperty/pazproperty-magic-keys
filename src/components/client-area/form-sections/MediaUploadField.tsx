
import React from "react";
import {
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import FileUpload from "@/components/FileUpload";

interface MediaUploadFieldProps {
  onChange: (files: File[]) => void;
}

const MediaUploadField: React.FC<MediaUploadFieldProps> = ({ onChange }) => {
  return (
    <div className="space-y-2">
      <FormLabel>Fotos ou Vídeos do Problema</FormLabel>
      <FormDescription>
        Adicione até 4 arquivos (fotos ou vídeos) que mostrem o problema. Isso ajudará nossa equipe a entender melhor a situação.
      </FormDescription>
      <FileUpload onChange={onChange} maxFiles={4} accept="image/*,video/*" />
    </div>
  );
};

export default MediaUploadField;

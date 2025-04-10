
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
      <div className="mb-2">
        <FormLabel className="text-base">Adicionar média</FormLabel>
        <FormDescription>
          Pode adicionar fotos ou vídeos para ajudar a descrever o problema (opcional).
        </FormDescription>
      </div>
      <FileUpload 
        onChange={onChange} 
        maxFiles={5} 
        accept="image/*,video/*" 
      />
    </div>
  );
};

export default MediaUploadField;

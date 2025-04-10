
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
  // Nous cachons complètement ce composant en retournant null
  return null;
}

export default MediaUploadField;

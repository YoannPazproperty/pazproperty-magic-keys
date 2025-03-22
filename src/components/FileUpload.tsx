
import React, { useState } from 'react';
import { Upload, X, ImageIcon, VideoIcon, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  maxFiles = 4,
  accept = "image/*,video/*"
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files);
    const totalFiles = [...files, ...newFiles];
    
    // Limit to maxFiles
    if (totalFiles.length > maxFiles) {
      alert(`Vous ne pouvez télécharger que ${maxFiles} fichiers maximum.`);
      return;
    }
    
    // Generate previews
    newFiles.forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const result = fileReader.result as string;
        setPreviews(prev => [...prev, result]);
      };
      fileReader.readAsDataURL(file);
    });
    
    // Update files
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles);
  };
  
  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onChange(updatedFiles);
  };
  
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <VideoIcon className="w-6 h-6 text-purple-500" />;
    } else {
      return <FileIcon className="w-6 h-6 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez et déposez
            </p>
            <p className="text-xs text-gray-500">
              {accept.includes('image') && accept.includes('video') 
                ? 'Photos et vidéos' 
                : accept.includes('image') 
                  ? 'Photos' 
                  : accept.includes('video') 
                    ? 'Vidéos' 
                    : 'Fichiers'} (MAX. {maxFiles} fichiers)
            </p>
          </div>
          <input 
            id="dropzone-file" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            multiple
            accept={accept}
          />
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="flex flex-col items-center p-2 border rounded-lg bg-gray-50">
                {previews[index] && file.type.startsWith('image/') ? (
                  <img 
                    src={previews[index]} 
                    alt={`Preview ${index}`} 
                    className="object-cover w-full h-24 mb-2 rounded"
                  />
                ) : previews[index] && file.type.startsWith('video/') ? (
                  <video
                    src={previews[index]}
                    className="object-cover w-full h-24 mb-2 rounded"
                    controls
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-24 mb-2 bg-gray-200 rounded">
                    {getFileIcon(file)}
                  </div>
                )}
                <span className="text-xs truncate w-full text-center">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

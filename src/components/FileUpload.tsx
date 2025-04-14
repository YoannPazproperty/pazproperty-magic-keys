
import React, { useState } from 'react';
import { Upload, X, ImageIcon, VideoIcon, FileIcon, Cloud, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  supabaseConnected?: boolean | null;
  maxFileSize?: number; // Nouveau prop pour la taille maximale (en Mo)
}

const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  maxFiles = 4,
  accept = "image/*,video/*",
  supabaseConnected = null,
  maxFileSize = 10 // Limite par défaut à 10 Mo
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    // Ne pas permettre l'upload de fichiers si Supabase n'est pas connecté
    if (supabaseConnected === false) {
      toast.error("Não é possível fazer upload de arquivos sem conexão ao Supabase.");
      return;
    }
    
    const newFiles = Array.from(e.target.files);
    const totalFiles = [...files, ...newFiles];
    
    // Vérifier la limite de nombre de fichiers
    if (totalFiles.length > maxFiles) {
      toast.warning(`Você pode fazer upload de no máximo ${maxFiles} arquivos.`);
      return;
    }
    
    // Vérifier la taille des fichiers
    const oversizedFiles = newFiles.filter(file => file.size > (maxFileSize * 1024 * 1024));
    if (oversizedFiles.length > 0) {
      toast.error(`Arquivos muito grandes. Limite máximo é ${maxFileSize} MB por arquivo.`, {
        description: "Reduza o tamanho do arquivo ou escolha um arquivo menor."
      });
      return;
    }
    
    // Générer les aperçus
    newFiles.forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const result = fileReader.result as string;
        setPreviews(prev => [...prev, result]);
      };
      fileReader.readAsDataURL(file);
    });
    
    // Mettre à jour les fichiers
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles);
  };
  
  // ... reste du code existant (méthodes removeFile, getFileIcon, etc.)
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
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${supabaseConnected === false ? 'bg-gray-100 opacity-50' : 'bg-gray-50 hover:bg-gray-100'} border-gray-300`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {supabaseConnected === false ? (
              <>
                <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
                <p className="mb-2 text-sm text-gray-500">
                  Upload indisponível sem conexão ao Supabase
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para upload</span> ou arraste e solte
                </p>
                <p className="text-xs text-gray-500">
                  {accept.includes('image') && accept.includes('video') 
                    ? 'Fotos e vídeos' 
                    : accept.includes('image') 
                      ? 'Fotos' 
                      : accept.includes('video') 
                        ? 'Vídeos' 
                        : 'Arquivos'} (MAX. {maxFiles} arquivos, {maxFileSize} MB por arquivo)
                </p>
              
                <div className={`flex items-center text-xs mt-1 ${supabaseConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                  {supabaseConnected ? (
                    <>
                      <Cloud className="w-3 h-3 mr-1" />
                      <span>Armazenamento na nuvem</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      <span>Verifique sua conexão</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <input 
            id="dropzone-file" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            multiple
            accept={accept}
            disabled={supabaseConnected === false}
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

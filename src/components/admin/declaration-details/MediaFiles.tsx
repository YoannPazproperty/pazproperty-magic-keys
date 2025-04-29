
import React from "react";

interface MediaFilesProps {
  files: string[] | string | null;
}

export const MediaFiles = ({ files }: MediaFilesProps) => {
  if (!files) {
    return (
      <div className="space-y-2 py-2">
        <h3 className="font-semibold">Fichiers attachés</h3>
        <p className="text-muted-foreground">Aucun fichier attaché.</p>
      </div>
    );
  }

  // Convertir en tableau si c'est une chaîne
  const mediaFiles: string[] = Array.isArray(files) ? files : 
    typeof files === 'string' ? 
      files.startsWith('[') ? JSON.parse(files) : [files] 
      : [];

  return (
    <div className="space-y-2 py-2">
      <h3 className="font-semibold">Fichiers attachés</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {mediaFiles.map((file, index) => {
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
          
          return isImage ? (
            <a 
              key={index} 
              href={file} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block aspect-square overflow-hidden rounded-md border hover:opacity-90 transition-opacity"
            >
              <img src={file} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover" />
            </a>
          ) : (
            <a
              key={index}
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center aspect-square border rounded-md p-2 hover:bg-gray-50"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mb-1">
                <span className="text-xs">Fichier</span>
              </div>
              <span className="text-xs text-center truncate w-full">Pièce jointe {index + 1}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

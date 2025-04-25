
import { Image, Video, FileIcon } from "lucide-react";

interface MediaFilesProps {
  files?: string[];
}

export const MediaFiles = ({ files }: MediaFilesProps) => {
  const getFileIcon = (fileUrl: string) => {
    if (fileUrl.includes('image') || fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/)) {
      return <Image className="h-4 w-4 mr-1" />;
    } else if (fileUrl.includes('video') || fileUrl.toLowerCase().match(/\.(mp4|mov|avi|wmv|mkv)$/)) {
      return <Video className="h-4 w-4 mr-1" />;
    } else {
      return <FileIcon className="h-4 w-4 mr-1" />;
    }
  };

  const getFileName = (fileUrl: string): string => {
    if (fileUrl.includes('storage/v1/object/public/')) {
      const matches = fileUrl.match(/([^\/]+)(?=\?|$)/);
      if (matches && matches[0]) {
        const parts = matches[0].split('-');
        if (parts.length > 1 && parts[0].length === 36) {
          return parts.slice(1).join('-');
        }
        return matches[0];
      }
    }
    
    if (fileUrl.includes('/api/files/')) {
      return `Fichier ${fileUrl.split('/').pop()?.substring(0, 8)}...`;
    }
    
    return fileUrl.split('/').pop() || 'Fichier';
  };

  if (!files || files.length === 0) {
    return (
      <div className="space-y-2 py-2">
        <h3 className="font-semibold">Fichiers médias</h3>
        <div className="bg-gray-50 p-3 rounded-md border text-gray-500">
          Aucun fichier média n'a été téléchargé pour cette déclaration.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      <h3 className="font-semibold">Fichiers médias</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {files.map((fileUrl, index) => {
          const isPreviewableImage = fileUrl.includes('image') || 
            fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/);
          
          return (
            <a 
              key={index}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col p-3 bg-blue-50 rounded border border-blue-100 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              {isPreviewableImage && (
                <div className="w-full h-32 mb-2 overflow-hidden rounded bg-white">
                  <img 
                    src={fileUrl} 
                    alt={`Aperçu ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = 
                        '<div class="flex items-center justify-center h-full text-gray-400"><span>Aperçu non disponible</span></div>';
                    }}
                  />
                </div>
              )}
              <div className="flex items-center">
                {getFileIcon(fileUrl)}
                <span className="truncate">
                  {getFileName(fileUrl)}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

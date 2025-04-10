
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Declaration } from "@/services/types";
import { translateIssueType, translateUrgency } from "@/utils/translationUtils";
import { Info, Image, Video, FileIcon } from "lucide-react";

interface DeclarationDetailsProps {
  declaration: Declaration;
  onStatusUpdate: (id: string, status: Declaration["status"]) => void;
  getStatusBadgeColor: (status: string) => string;
  translateStatus: (status: string) => string;
}

export const DeclarationDetails = ({ 
  declaration, 
  onStatusUpdate,
  getStatusBadgeColor,
  translateStatus
}: DeclarationDetailsProps) => {
  // Helper function to determine file type icon
  const getFileIcon = (fileUrl: string) => {
    if (fileUrl.includes('image') || fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/)) {
      return <Image className="h-4 w-4 mr-1" />;
    } else if (fileUrl.includes('video') || fileUrl.toLowerCase().match(/\.(mp4|mov|avi|wmv|mkv)$/)) {
      return <Video className="h-4 w-4 mr-1" />;
    } else {
      return <FileIcon className="h-4 w-4 mr-1" />;
    }
  };

  // Helper function to get file name from URL
  const getFileName = (fileUrl: string): string => {
    // For Supabase Storage URLs
    if (fileUrl.includes('storage/v1/object/public/')) {
      const matches = fileUrl.match(/([^\/]+)(?=\?|$)/);
      if (matches && matches[0]) {
        // Remove UUID prefix if present (UUID-filename format)
        const parts = matches[0].split('-');
        if (parts.length > 1 && parts[0].length === 36) {
          return parts.slice(1).join('-');
        }
        return matches[0];
      }
    }
    
    // For local API URLs
    if (fileUrl.includes('/api/files/')) {
      return `Fichier ${fileUrl.split('/').pop()?.substring(0, 8)}...`;
    }
    
    // Default: show abbreviated URL
    return fileUrl.split('/').pop() || 'Fichier';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Informations du locataire</h3>
          <p><span className="font-medium">Nom:</span> {declaration.name}</p>
          <p><span className="font-medium">Email:</span> {declaration.email}</p>
          <p><span className="font-medium">Téléphone:</span> {declaration.phone}</p>
          {declaration.nif && (
            <p><span className="font-medium">NIF:</span> {declaration.nif}</p>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Informations du problème</h3>
          <p><span className="font-medium">Propriété:</span> {declaration.property}</p>
          {declaration.city && (
            <p><span className="font-medium">Ville:</span> {declaration.city}</p>
          )}
          {declaration.postalCode && (
            <p><span className="font-medium">Code postal:</span> {declaration.postalCode}</p>
          )}
          <p>
            <span className="font-medium">Type:</span> {translateIssueType(declaration.issueType)}
          </p>
          <p>
            <span className="font-medium">Urgence:</span> {translateUrgency(declaration.urgency)}
          </p>
          <p>
            <span className="font-medium">Statut:</span>{" "}
            <Badge className={getStatusBadgeColor(declaration.status)}>
              {translateStatus(declaration.status)}
            </Badge>
          </p>
        </div>
      </div>
      
      <div className="space-y-2 py-2">
        <h3 className="font-semibold">Description du problème</h3>
        <div className="bg-gray-50 p-3 rounded-md border">
          <p>{declaration.description}</p>
        </div>
      </div>
      
      {declaration.mediaFiles && declaration.mediaFiles.length > 0 ? (
        <div className="space-y-2 py-2">
          <h3 className="font-semibold">Fichiers médias</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {declaration.mediaFiles.map((fileUrl, index) => {
              // Determine if this is an image that can be previewed
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
                          // Fallback if image fails to load
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
      ) : (
        <div className="space-y-2 py-2">
          <h3 className="font-semibold">Fichiers médias</h3>
          <div className="bg-gray-50 p-3 rounded-md border text-gray-500">
            Aucun fichier média n'a été téléchargé pour cette déclaration.
          </div>
        </div>
      )}
      
      {declaration.mondayId && (
        <div className="space-y-2 py-2">
          <h3 className="font-semibold flex items-center">
            <Info className="h-4 w-4 mr-2 text-blue-500" />
            Information Monday.com
          </h3>
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <p><span className="font-medium">ID Monday:</span> {declaration.mondayId}</p>
            <p className="text-xs text-blue-600 mt-1">
              Cet élément a été synchronisé avec Monday.com
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-2 py-2">
        <h3 className="font-semibold">Mettre à jour le statut</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusUpdate(declaration.id, "pending")}
            className={declaration.status === "pending" ? "bg-yellow-100" : ""}
          >
            En attente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusUpdate(declaration.id, "in_progress")}
            className={declaration.status === "in_progress" ? "bg-blue-100" : ""}
          >
            En cours
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusUpdate(declaration.id, "resolved")}
            className={declaration.status === "resolved" ? "bg-green-100" : ""}
          >
            Résolu
          </Button>
        </div>
      </div>
    </>
  );
};

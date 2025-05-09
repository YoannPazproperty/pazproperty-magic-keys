
import { TenantInfo } from "./declaration-details/TenantInfo";
import { ProblemInfo } from "./declaration-details/ProblemInfo";
import { MediaFiles } from "./declaration-details/MediaFiles";
import { StatusUpdate } from "./declaration-details/StatusUpdate";
import { MondayInfo } from "./declaration-details/MondayInfo";
import { ProviderAssignmentForm } from "./declaration-details/ProviderAssignmentForm";
import { QuoteApprovalForm } from "./declaration-details/QuoteApprovalForm";
import type { Declaration, DeclarationFile } from "@/services/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [quoteFiles, setQuoteFiles] = useState<DeclarationFile[]>([]);

  // Récupérer les fichiers de devis associés à la déclaration
  useEffect(() => {
    const fetchQuoteFiles = async () => {
      if (declaration.status === "Orçamento recebido") {
        const { data, error } = await supabase
          .from('declaration_files')
          .select('*')
          .eq('declaration_id', declaration.id)
          .eq('file_type', 'quote');
          
        if (!error && data) {
          setQuoteFiles(data);
        }
      }
    };
    
    fetchQuoteFiles();
  }, [declaration.id, declaration.status]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <TenantInfo declaration={declaration} />
        <ProblemInfo 
          declaration={declaration}
          getStatusBadgeColor={getStatusBadgeColor}
          translateStatus={translateStatus}
        />
      </div>
      
      <div className="space-y-2 py-2">
        <h3 className="font-semibold">Description du problème</h3>
        <div className="bg-gray-50 p-3 rounded-md border">
          <p>{declaration.description}</p>
        </div>
      </div>
      
      <ProviderAssignmentForm 
        declaration={declaration} 
        onSuccess={() => onStatusUpdate(declaration.id, declaration.status)}
        isReadOnly={![
          "Novo", 
          "Em espera do encontro de diagnostico"
        ].includes(declaration.status as string)}
      />
      
      {declaration.status === "Orçamento recebido" && (
        <QuoteApprovalForm 
          declaration={declaration} 
          quoteFiles={quoteFiles}
          onSuccess={() => onStatusUpdate(declaration.id, declaration.status)}
          isReadOnly={declaration.quote_approved !== null}
        />
      )}
      
      <MediaFiles files={declaration.mediaFiles} />
      
      <MondayInfo mondayId={declaration.mondayId} />
      
      <StatusUpdate 
        currentStatus={declaration.status}
        onStatusUpdate={(status) => onStatusUpdate(declaration.id, status)}
      />
    </>
  );
};

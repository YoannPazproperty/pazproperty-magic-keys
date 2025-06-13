"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseDeclarations } from "@/services/declarations/supabaseDeclarationQueries";
import { Declaration } from "@/services/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AssignProviderDialog from "./AssignProviderDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const DeclarationsTable = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDeclarationId, setSelectedDeclarationId] = useState<string | null>(null);

  const { data: declarations, isLoading, error } = useQuery<Declaration[], Error>({
    queryKey: ["declarations"],
    queryFn: () => getSupabaseDeclarations(),
  });

  const handleOpenDialog = (declarationId: string) => {
    console.log("Attempting to open dialog for declaration ID:", declarationId);
    setSelectedDeclarationId(declarationId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedDeclarationId(null);
    setIsDialogOpen(false);
  };

  if (isLoading) return <div>{t('table.loading')}</div>;
  if (error) return <div>{t('table.error')} {error.message}</div>;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.header.customer')}</TableHead>
              <TableHead>{t('table.header.issueType')}</TableHead>
              <TableHead>{t('table.header.submissionDate')}</TableHead>
              <TableHead>{t('table.header.status')}</TableHead>
              <TableHead className="text-right">{t('table.header.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {declarations?.map((declaration) => (
              <TableRow key={declaration.id}>
                <TableCell>
                  <div className="font-medium">{declaration.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {declaration.email}
                  </div>
                </TableCell>
                <TableCell>{declaration.issueType}</TableCell>
                <TableCell>
                  {new Date(declaration.submittedAt ?? "").toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={declaration.status === "Novo" ? "default" : "secondary"}>{declaration.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                   {declaration.status === "Novo" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDialog(declaration.id)}
                    >
                      {t('table.action.assignProvider')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedDeclarationId && (
        <AssignProviderDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          declarationId={selectedDeclarationId}
        />
      )}
    </>
  );
};

export default DeclarationsTable; 
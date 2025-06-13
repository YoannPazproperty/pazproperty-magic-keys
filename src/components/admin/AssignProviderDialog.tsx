"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProviderDropdownItem } from "@/services/types";
import { assignProviderToDeclaration } from "@/services/declarations/updateSupabaseDeclaration";
import { getSupabaseProvidersForDropdown } from "@/services/providers/supabaseProviderQueries";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AssignProviderDialogProps {
  declarationId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AssignProviderDialog = ({ declarationId, isOpen, onClose }: AssignProviderDialogProps) => {
  const { t } = useLanguage();
  const [selectedProvider, setSelectedProvider] = useState<ProviderDropdownItem | null>(null);
  const queryClient = useQueryClient();

  const { data: providers, isLoading: isLoadingProviders } = useQuery<ProviderDropdownItem[]>({
    queryKey: ["providers"],
    queryFn: getSupabaseProvidersForDropdown,
    enabled: isOpen, // Only fetch when the dialog is open
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (provider: {id: string, name: string}) => assignProviderToDeclaration(declarationId, provider.id, provider.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["declarations"] });
      onClose();
    },
  });

  const handleAssign = async () => {
    if (!selectedProvider) return;
    mutate(selectedProvider);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialog.assign.title')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={(providerId) => {
            const provider = providers?.find(p => p.id === providerId);
            setSelectedProvider(provider || null);
          }}
          disabled={isPending || isLoadingProviders}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoadingProviders ? "A carregar..." : t('dialog.assign.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {providers?.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name} ({provider.specialty})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>
              {t('dialog.assign.cancel')}
            </Button>
          </DialogClose>
          <Button onClick={handleAssign} disabled={!selectedProvider || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isPending ? t('dialog.assign.assigning') : t('dialog.assign.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignProviderDialog; 
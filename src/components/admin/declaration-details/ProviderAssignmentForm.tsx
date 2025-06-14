
import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Calendar } from "../../ui/calendar";
import { useProviders } from "../../../hooks/useProviders";
import { updateStatusAndNotify } from "../../../services/notifications";
import { toast } from "sonner";
import type { Declaration, ServiceProvider } from "../../../services/types";
import { cn } from "../../../lib/utils";

interface ProviderAssignmentFormProps {
  declaration: Declaration;
  onSuccess: () => void;
  isReadOnly?: boolean;
}

export const ProviderAssignmentForm = ({ 
  declaration, 
  onSuccess, 
  isReadOnly = false 
}: ProviderAssignmentFormProps) => {
  const { data: providers, isLoading } = useProviders();
  const [selectedProviderId, setSelectedProviderId] = useState<string>(declaration.prestador_id || "");
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(
    declaration.meeting_date ? new Date(declaration.meeting_date) : undefined
  );
  const [meetingTime, setMeetingTime] = useState<string>(
    declaration.meeting_date 
      ? new Date(declaration.meeting_date).toTimeString().substring(0, 5) 
      : "09:00"
  );
  const [meetingNotes, setMeetingNotes] = useState<string>(declaration.meeting_notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when declaration changes
  useEffect(() => {
    setSelectedProviderId(declaration.prestador_id || "");
    setMeetingDate(declaration.meeting_date ? new Date(declaration.meeting_date) : undefined);
    setMeetingTime(
      declaration.meeting_date 
        ? new Date(declaration.meeting_date).toTimeString().substring(0, 5) 
        : "09:00"
    );
    setMeetingNotes(declaration.meeting_notes || "");
  }, [declaration]);

  const formatProviderDisplay = (provider: ServiceProvider) => {
    return `${provider.empresa} - ${provider.nome_gerente} - ${provider.tipo_de_obras}`;
  };

  const handleProviderAssignment = async () => {
    if (!selectedProviderId) {
      toast.error("Aucun prestataire sélectionné");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Assigning provider:", selectedProviderId, "to declaration:", declaration.id);
      
      const success = await updateStatusAndNotify(
        declaration.id,
        "AWAITING_DIAGNOSTIC",
        { prestador_id: selectedProviderId }
      );

      if (success) {
        toast.success("Prestataire assigné avec succès");
        console.log("Provider assignment successful");
        onSuccess();
      } else {
        toast.error("Erreur lors de l'assignation du prestataire");
        console.error("Provider assignment failed");
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation du prestataire:", error);
      toast.error("Erreur lors de l'assignation du prestataire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMeetingSchedule = async () => {
    if (!meetingDate) {
      toast.error("Aucune date de rendez-vous sélectionnée");
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time
      const dateTime = new Date(meetingDate);
      const [hours, minutes] = meetingTime.split(':').map(Number);
      dateTime.setHours(hours, minutes);

      console.log("Setting meeting date:", dateTime, "for declaration:", declaration.id);

      const success = await updateStatusAndNotify(
        declaration.id,
        "DIAGNOSTIC_SCHEDULED",
        { 
          meeting_date: dateTime.toISOString(),
          meeting_notes: meetingNotes 
        }
      );

      if (success) {
        toast.success("Rendez-vous planifié avec succès");
        console.log("Meeting schedule successful");
        onSuccess();
      } else {
        toast.error("Erreur lors de la planification du rendez-vous");
        console.error("Meeting schedule failed");
      }
    } catch (error) {
      console.error("Erreur lors de la planification du rendez-vous:", error);
      toast.error("Erreur lors de la planification du rendez-vous");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for checking if a provider is complete enough to display
  const isValidProvider = (provider: Partial<ServiceProvider> | null | undefined): provider is ServiceProvider => {
    return !!provider && !!provider.id && !!provider.empresa && !!provider.nome_gerente && !!provider.tipo_de_obras;
  };

  // Find current provider with safety checks
  const currentProvider = providers?.find(p => p.id === declaration.prestador_id);
  const currentProviderDisplay = currentProvider && isValidProvider(currentProvider) 
    ? `${currentProvider.empresa} - ${currentProvider.nome_gerente} - ${currentProvider.tipo_de_obras}` 
    : 'Prestataire non trouvé';

  return (
    <div className="space-y-4 border rounded-md p-4">
      <h3 className="font-semibold text-lg">Gestion du prestataire et du rendez-vous</h3>
      
      {/* Sélection du prestataire */}
      <div className="space-y-2">
        <Label htmlFor="provider">Prestataire assigné</Label>
        <div className="flex gap-2">
          <Select
            disabled={isLoading || isSubmitting || isReadOnly || !!declaration.prestador_id}
            value={selectedProviderId}
            onValueChange={setSelectedProviderId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir un prestataire" />
            </SelectTrigger>
            <SelectContent>
              {providers?.filter(isValidProvider).map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {`${provider.empresa} - ${provider.nome_gerente} - ${provider.tipo_de_obras}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {!declaration.prestador_id && !isReadOnly && (
            <Button
              onClick={handleProviderAssignment}
              disabled={!selectedProviderId || isSubmitting || isLoading}
            >
              {isSubmitting ? "En cours..." : "Assigner"}
            </Button>
          )}
        </div>
        
        {declaration.prestador_id && currentProvider && (
          <p className="text-sm text-muted-foreground">
            Prestataire actuel: {currentProviderDisplay}
          </p>
        )}
        
        {declaration.prestador_assigned_at && (
          <p className="text-xs text-muted-foreground">
            Assigné le {format(new Date(declaration.prestador_assigned_at), 'PPP à HH:mm', {locale: fr})}
          </p>
        )}
      </div>
      
      {/* Planification du rendez-vous (uniquement si un prestataire est assigné) */}
      {declaration.prestador_id && (
        <>
          <div className="space-y-2">
            <Label htmlFor="meeting_date">Date du rendez-vous</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !meetingDate && "text-muted-foreground"
                    )}
                    disabled={isReadOnly || declaration.status === "DIAGNOSTIC_SCHEDULED"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {meetingDate ? format(meetingDate, "PPP", {locale: fr}) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={meetingDate}
                    onSelect={setMeetingDate}
                    initialFocus
                    disabled={isReadOnly || declaration.status === "DIAGNOSTIC_SCHEDULED"}
                  />
                </PopoverContent>
              </Popover>
              
              <Input
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-32"
                disabled={isReadOnly || declaration.status === "DIAGNOSTIC_SCHEDULED"}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meeting_notes">Notes pour le rendez-vous</Label>
            <Textarea
              id="meeting_notes"
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              placeholder="Informations complémentaires sur le rendez-vous..."
              disabled={isReadOnly || declaration.status === "DIAGNOSTIC_SCHEDULED"}
            />
          </div>
          
          {declaration.status === "AWAITING_DIAGNOSTIC" && !isReadOnly && (
            <Button
              onClick={handleMeetingSchedule}
              disabled={!meetingDate || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "En cours..." : "Planifier le rendez-vous"}
            </Button>
          )}
          
          {declaration.meeting_date && (
            <div className="bg-blue-50 p-2 rounded border border-blue-100">
              <p className="text-sm">
                <span className="font-semibold">Rendez-vous planifié:</span> {" "}
                {format(new Date(declaration.meeting_date), 'PPP à HH:mm', {locale: fr})}
              </p>
              {declaration.meeting_notes && (
                <p className="text-sm mt-1">
                  <span className="font-semibold">Notes:</span> {declaration.meeting_notes}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

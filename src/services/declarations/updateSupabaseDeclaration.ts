import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const assignProviderToDeclaration = async (declarationId: string, providerId: string, providerName: string): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('Supabase non disponible');
      toast.error("Erro de conexão com o servidor.");
      return false;
    }

    console.log('Assignation prestador :', { declarationId, providerId, providerName });

    const { error } = await supabase
      .from('declarations')
      .update({ 
        prestador_id: providerId,
        status: 'Transmitido'
      })
      .eq('id', declarationId);

    if (error) {
      console.error('Erro ao assignar prestador:', error);
      toast.error("Erro ao assignar prestador.", {
        description: error.message,
      });
      return false;
    }

    toast.success("Prestador assignado com sucesso!");
    return true;

  } catch (err) {
    console.error('Erro inesperado:', err);
    toast.error("Ocorreu um erro inesperado.");
    return false;
  }
};

export const scheduleAppointment = async (declarationId: string, appointmentDateTime: string): Promise<boolean> => {
  try {
    if (!supabase) {
      toast.error("Erro de conexão com o servidor.");
      return false;
    }

    const { error } = await supabase
      .from('declarations')
      .update({ 
        appointment_date: appointmentDateTime,
        status: 'Encontramento de diagnostico planeado'
      })
      .eq('id', declarationId);

    if (error) {
      console.error('Erro ao agendar o encontro:', error);
      toast.error("Erro ao agendar o encontro.", {
        description: error.message,
      });
      return false;
    }

    toast.success("Encontro agendado com sucesso!");
    return true;

  } catch (err) {
    console.error('Erro inesperado:', err);
    toast.error("Ocorreu um erro inesperado ao agendar.");
    return false;
  }
}; 
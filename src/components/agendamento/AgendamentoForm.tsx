"use client";

import React, { useEffect, useState } from "react";
import { Declaration } from "@/services/types";
import { getSupabaseDeclarationById } from "@/services/declarations/supabaseDeclarationQueries";
import { updateSupabaseDeclaration } from "@/services/declarations/supabaseDeclarationMutations";
import { toast } from "sonner";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AgendamentoFormProps = {
  declarationId: string;
};

type FormValues = {
  appointmentDate: string;
  appointmentTime: string;
  appointmentNotes: string;
};

const AgendamentoForm = ({ declarationId }: AgendamentoFormProps) => {
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    const fetchDeclaration = async () => {
      try {
        setIsLoading(true);
        const fetchedDeclaration = await getSupabaseDeclarationById(declarationId);
        if (fetchedDeclaration) {
          setDeclaration(fetchedDeclaration);
          if (fetchedDeclaration.status === 'Agendado' || fetchedDeclaration.status === 'Concluído') {
            toast.info("Esta intervenção já foi agendada.");
          }
        } else {
          setError("Declaração não encontrada.");
          toast.error("Declaração não encontrada.");
        }
      } catch (err) {
        setError("Falha ao carregar a declaração.");
        toast.error("Falha ao carregar a declaração.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeclaration();
  }, [declarationId]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!declaration) return;
    setIsSubmitting(true);
    
    try {
      const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
      if (isNaN(appointmentDateTime.getTime())) {
        toast.error("Data ou hora inválida.");
        setIsSubmitting(false);
        return;
      }

      await updateSupabaseDeclaration(declaration.id, {
        appointment_date: appointmentDateTime.toISOString(),
        appointment_notes: data.appointmentNotes,
        status: "Agendado",
      });

      toast.success("Intervenção agendada com sucesso!");
      // Optionally, redirect or update UI
      setDeclaration(prev => prev ? { ...prev, status: 'Agendado' } : null);

    } catch (error) {
      toast.error("Falha ao agendar a intervenção.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">A carregar os detalhes...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
  }

  if (!declaration) {
    return <div className="text-center p-8">Nenhuma declaração encontrada.</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Declaração</CardTitle>
          <CardDescription>
            Informações sobre a intervenção solicitada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Cliente:</strong> {declaration.name}</p>
          <p><strong>Email:</strong> {declaration.email}</p>
          <p><strong>Telefone:</strong> {declaration.phone}</p>
          <p><strong>Endereço:</strong> {declaration.property}, {declaration.city}, {declaration.postalCode}</p>
          <p><strong>Tipo de Problema:</strong> {declaration.issueType}</p>
          <p><strong>Descrição:</strong> {declaration.description}</p>
          <p><strong>Urgência:</strong> {declaration.urgency}</p>
          <p><strong>Status Atual:</strong> <span className="font-semibold">{declaration.status}</span></p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Marcar Intervenção</CardTitle>
          <CardDescription>
            Selecione uma data e hora para a visita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {declaration.status !== 'Agendado' && declaration.status !== 'Concluído' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="appointmentDate">Data da Intervenção</Label>
                <Input type="date" id="appointmentDate" {...register("appointmentDate", { required: "A data é obrigatória" })} />
                {errors.appointmentDate && <p className="text-red-500 text-sm mt-1">{errors.appointmentDate.message}</p>}
              </div>
              <div>
                <Label htmlFor="appointmentTime">Hora da Intervenção</Label>
                <Input type="time" id="appointmentTime" {...register("appointmentTime", { required: "A hora é obrigatória" })} />
                {errors.appointmentTime && <p className="text-red-500 text-sm mt-1">{errors.appointmentTime.message}</p>}
              </div>
              <div>
                <Label htmlFor="appointmentNotes">Notas (Opcional)</Label>
                <Textarea id="appointmentNotes" {...register("appointmentNotes")} placeholder="Notas adicionais para o cliente ou para a equipa..."/>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "A agendar..." : "Agendar Intervenção"}
              </Button>
            </form>
          ) : (
            <p className="text-green-600 font-semibold">Esta intervenção já foi agendada para {declaration.appointment_date ? new Date(declaration.appointment_date).toLocaleString('pt-PT') : 'uma data a confirmar'}.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendamentoForm; 
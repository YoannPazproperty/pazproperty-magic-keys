"use client";

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseDeclarationById } from "@/services/declarations/supabaseDeclarationQueries";
import { Declaration } from "@/services/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import AppointmentForm from "@/components/agendamento/AppointmentForm";

const AgendamentoPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: declaration, isLoading, error } = useQuery<Declaration | undefined, Error>({
    queryKey: ["declaration", id],
    queryFn: () => getSupabaseDeclarationById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (error || !declaration) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p>Não foi possível carregar os detalhes da declaração.</p>
          <p>{error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Agendamento de Intervenção</h1>
          <p className="text-lg text-muted-foreground mb-8">Declaração ID: {declaration.id}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Declaration Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Detalhes da Declaração</h2>
              <div className="space-y-3">
                <p><strong>Cliente:</strong> {declaration.name}</p>
                <p><strong>Endereço:</strong> {declaration.property}, {declaration.postalCode} {declaration.city}</p>
                <p><strong>Tipo de Problema:</strong> {declaration.issueType}</p>
                <p><strong>Descrição:</strong> {declaration.description}</p>
                <p><strong>Urgência:</strong> {declaration.urgency}</p>
              </div>
            </div>

            {/* Appointment Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Propor Data de Visita</h2>
              <AppointmentForm declarationId={declaration.id} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgendamentoPage; 
"use client";

import { useRef } from "react";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeclarationForm } from "./hooks/useDeclarationForm";
import MediaUpload from "./MediaUpload";
import FormSection from "./FormSection";
import FormField from "./FormField";
import { declarationFormSchema } from "./schema";

const DeclarationForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    form,
    onSubmit,
    isSubmitting,
    handleMediaDrop,
    handleRemoveMedia,
    mediaFiles,
  } = useDeclarationForm(formRef);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Formulário de Declaração</CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para submeter a sua declaração.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormSection title="Informações Pessoais">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField form={form} name="firstName" label="Nome" />
                <FormField form={form} name="lastName" label="Apelido" />
                <FormField form={form} name="email" label="Email" type="email" />
                <FormField
                  form={form}
                  name="confirmEmail"
                  label="Confirmar Email"
                  type="email"
                />
                <FormField form={form} name="telefone" label="Telefone" />
                <FormField form={form} name="nif" label="NIF" />
              </div>
            </FormSection>

            <FormSection title="Detalhes do Imóvel">
              <FormField form={form} name="addressLine1" label="Endereço Linha 1" />
              <FormField form={form} name="addressLine2" label="Endereço Linha 2 (Opcional)" />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField form={form} name="city" label="Cidade" />
                <FormField form={form} name="postalCode" label="Código Postal" />
              </div>
            </FormSection>

            <FormSection title="Descrição do Problema">
              <FormField
                form={form}
                name="problemType"
                label="Tipo de Problema"
                type="select"
                options={[
                  { value: "canalização", label: "Canalização" },
                  { value: "eletricidade", label: "Eletricidade" },
                  { value: "predial", label: "Predial" },
                  { value: "outro", label: "Outro" },
                ]}
              />
              <FormField
                form={form}
                name="description"
                label="Descrição Detalhada"
                type="textarea"
              />
              <FormField
                form={form}
                name="urgency"
                label="Nível de Urgência"
                type="select"
                options={[
                  { value: "low", label: "Baixa" },
                  { value: "medium", label: "Média" },
                  { value: "high", label: "Alta" },
                  { value: "emergency", label: "Emergência" },
                ]}
              />
            </FormSection>

            <FormSection title="Ficheiros Multimédia">
              <MediaUpload
                onDrop={handleMediaDrop}
                files={mediaFiles}
                onRemove={handleRemoveMedia}
              />
            </FormSection>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "A enviar..." : "Enviar Declaração"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DeclarationForm;

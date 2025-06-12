import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Declaration } from "@/services/types";
import { createSupabaseDeclaration } from "@/services/declarations/supabaseDeclarationMutations";
import { declarationFormSchema } from "../schema";
import { supabase } from "@/integrations/supabase/client";

const uploadFiles = async (files: File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const filePath = `public/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("declaration-media")
      .upload(filePath, file);

    if (error) {
      toast.error("Erro no upload do ficheiro", { description: error.message });
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("declaration-media")
      .getPublicUrl(data.path);

    uploadedUrls.push(publicUrlData.publicUrl);
  }

  return uploadedUrls;
};

export const useDeclarationForm = (formRef: React.RefObject<HTMLFormElement>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof declarationFormSchema>>({
    resolver: zodResolver(declarationFormSchema),
    defaultValues: {
      nif: "",
      firstName: "",
      lastName: "",
      telefone: "",
      email: "",
      confirmEmail: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      problemType: undefined,
      description: "",
      urgency: "low",
    },
  });

  const handleMediaDrop = (
    acceptedFiles: File[],
    rejectedFiles: any[],
    event: React.DragEvent<HTMLDivElement>
  ) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      toast.error("Erro no upload", {
        description: "Alguns ficheiros foram rejeitados.",
      });
    }
    setMediaFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof declarationFormSchema>) => {
    setIsSubmitting(true);
    try {
      let uploadedFileUrls: string[] = [];
      if (mediaFiles.length > 0) {
        uploadedFileUrls = await uploadFiles(mediaFiles);
      }

      const newDeclaration: Declaration = {
        id: crypto.randomUUID(),
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.telefone,
        property: `${values.addressLine1}${
          values.addressLine2 ? `, ${values.addressLine2}` : ""
        }`,
        city: values.city,
        postalCode: values.postalCode,
        issueType: values.problemType,
        description: values.description,
        urgency: values.urgency,
        status: "Novo",
        submittedAt: new Date().toISOString(),
        mediaFiles: uploadedFileUrls,
      };

      await createSupabaseDeclaration(newDeclaration);
      toast.success("Declaração enviada com sucesso!");

      // Envoyer l'email de confirmation au client
      try {
        await supabase.functions.invoke("send-customer-confirmation", {
          body: {
            customerName: `${values.firstName} ${values.lastName}`,
            customerEmail: values.email,
          },
        });
        toast.info("Email de confirmação enviado.");
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Ne pas bloquer l'utilisateur, juste logguer l'erreur
      }

      setIsSubmitting(false);
      if (formRef.current) {
        formRef.current.reset();
      }
      setMediaFiles([]);
      form.reset();
    } catch (error) {
      console.error("Error submitting declaration:", error);
      toast.error("Erro ao enviar declaração", {
        description:
          "Ocorreu um erro. Por favor, tente novamente mais tarde.",
      });
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    handleMediaDrop,
    handleRemoveMedia,
    mediaFiles,
  };
};

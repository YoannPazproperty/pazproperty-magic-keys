
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ProviderFormValues } from "./types";

interface ProviderFormProps {
  form: UseFormReturn<ProviderFormValues>;
  isSubmitting: boolean;
  isSendingInvite: boolean;
  isEditing: boolean;
  onSubmit: (data: ProviderFormValues) => void;
  onClose: () => void;
  onInvite?: () => void;
}

export const ProviderForm: React.FC<ProviderFormProps> = ({
  form,
  isSubmitting,
  isSendingInvite,
  isEditing,
  onSubmit,
  onClose,
  onInvite
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tipo_de_obras"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Obras</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de obras" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Eletricidade">Eletricidade</SelectItem>
                  <SelectItem value="Canalização">Canalização</SelectItem>
                  <SelectItem value="Alvenaria">Alvenaria</SelectItem>
                  <SelectItem value="Caixilharias">Caixilharias</SelectItem>
                  <SelectItem value="Obras gerais">Obras gerais</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nome_gerente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Gerente</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="+351 912 345 678" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codigo_postal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal</FormLabel>
                <FormControl>
                  <Input placeholder="1234-567" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="nif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NIF</FormLabel>
              <FormControl>
                <Input placeholder="123456789" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting || isSendingInvite}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            {isEditing && onInvite && (
              <Button
                type="button"
                variant="secondary"
                onClick={onInvite}
                disabled={isSubmitting || isSendingInvite}
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Enviando...
                  </>
                ) : "Enviar Convite"}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isSendingInvite}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {isSendingInvite ? "Processando..." : "Salvando..."}
                </>
              ) : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
};

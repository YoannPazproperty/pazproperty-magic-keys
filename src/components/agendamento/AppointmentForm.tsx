"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const formSchema = z.object({
  appointmentDate: z.date({
    required_error: "A data do agendamento é obrigatória.",
  }),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Formato de hora inválido (HH:MM)."
  }),
});

interface AppointmentFormProps {
  declarationId: string;
}

const AppointmentForm = ({ declarationId }: AppointmentFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  // TODO: Add useMutation to submit the form data
  const isPending = false; // Placeholder

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Combine date and time
    const { appointmentDate, appointmentTime } = values;
    const [hours, minutes] = appointmentTime.split(':');
    const combinedDateTime = new Date(appointmentDate);
    combinedDateTime.setHours(parseInt(hours), parseInt(minutes));

    console.log({
      declarationId,
      appointmentDateTime: combinedDateTime.toISOString(),
    });
    toast.success("Agendamento proposto com sucesso! (Simulado)");
    // Here we will call the mutation
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="appointmentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da Visita</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="appointmentTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora da Visita (HH:MM)</FormLabel>
              <FormControl>
                <input type="time" {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Propor Agendamento
        </Button>
      </form>
    </Form>
  );
};

export default AppointmentForm; 
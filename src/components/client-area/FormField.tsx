"use client";

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
}

const FormField: React.FC<FormFieldProps> = ({ form, name, label, type = 'text', options }) => {
  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {type === 'select' ? (
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === 'textarea' ? (
            <FormControl>
              <Textarea placeholder={`Insira ${label.toLowerCase()}`} {...field} />
            </FormControl>
          ) : (
            <FormControl>
              <Input placeholder={`Insira ${label.toLowerCase()}`} type={type} {...field} />
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField; 
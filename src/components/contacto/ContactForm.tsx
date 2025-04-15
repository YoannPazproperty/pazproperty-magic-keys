
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulário enviado:", formData);
    alert("Obrigado pelo seu contacto! Responderemos em breve.");
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      mensagem: "",
    });
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Envie-nos uma Mensagem</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Seu email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            placeholder="Seu telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mensagem">Mensagem</Label>
          <textarea
            id="mensagem"
            name="mensagem"
            placeholder="Como podemos ajudar?"
            value={formData.mensagem}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <Button type="submit" className="w-full bg-brand-blue hover:bg-primary/90">
          <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;

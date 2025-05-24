
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactCTA = () => {
  const [email, setEmail] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
    alert("Obrigado pelo seu contacto! Responderemos em breve.");
  };

  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.title')}</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          {t('cta.subtitle')}
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder={t('cta.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              required
            />
            <Button type="submit" className="bg-white text-primary hover:bg-white/90">
              {t('cta.contact')}
            </Button>
          </div>
        </form>
        
        <div className="mt-8 flex justify-center">
          <Link to="/contacto" className="flex items-center text-white hover:underline">
            <Phone className="mr-2 h-5 w-5" />
            Alexa: +351 962 093 401 | Yoann: +33 6 09 95 12 84
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;


import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t, language } = useLanguage();
  
  return (
    <section className="relative h-[80vh] w-full">
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/2d70be6f-7312-431c-8772-40356da4ada1.png"
          alt="Tramway historique de Lisbonne la nuit" 
          className="w-full h-full object-cover brightness-50"
        />
      </div>
      <div className="relative z-10 container mx-auto h-full flex items-center justify-center px-4">
        <div className="text-center text-white max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {t('hero.title')}
          </h1>
          <div className="text-xl mb-8">
            <p><em>{t('hero.tagline1')}</em></p>
            <p><em>{t('hero.tagline2')}</em></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-brand-blue hover:bg-primary/90">
              <Link to="/contacto">{t('hero.contact')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white">
              <Link to="/servicos">{t('hero.services')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

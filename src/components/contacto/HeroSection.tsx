
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="pt-32 pb-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('contact.hero.title')}</h1>
          <div className="text-xl text-gray-600">
            <p><em>{t('hero.tagline1')}</em></p>
            <p><em>{t('hero.tagline2')}</em></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

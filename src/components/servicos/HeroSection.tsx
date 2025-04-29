
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-brand-blue/10 to-white">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('services.hero.title')}</h1>
          <p className="text-xl font-medium text-primary mb-4">{t('services.hero.subtitle')}</p>
          <p className="text-lg text-gray-600">
            {t('services.hero.description')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

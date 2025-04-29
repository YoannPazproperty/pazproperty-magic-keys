
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const CTASection = ({ title, description, buttonText, buttonLink }: CTASectionProps) => {
  const { t } = useLanguage();
  
  return (
    <section className="py-20 bg-brand-blue text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{title || t('services.cta.title')}</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          {description || t('services.cta.description')}
        </p>
        <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
          <Link to={buttonLink}>{buttonText || t('services.cta.button')}</Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;

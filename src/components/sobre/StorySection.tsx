
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const StorySection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('story.title')}</h2>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              {t('story.p1')}
            </p>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              {t('story.p2')}
            </p>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              {t('story.p3')}
            </p>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              {t('story.p4')}
            </p>
            <p className="text-lg text-gray-600 text-justify">
              {t('story.p5')}
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-xl">
            <img 
              src="/lovable-uploads/c402d587-5321-456e-a8f4-ab4ba600d11e.png" 
              alt="Vista do Tejo com barcos e a Ponte 25 de Abril" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;

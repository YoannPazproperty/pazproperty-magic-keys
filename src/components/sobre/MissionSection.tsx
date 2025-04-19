
import React from 'react';
import { Shield, Award, Users } from 'lucide-react';

const MissionSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Nossa Missão e Valores</h2>
          <p className="text-xl text-gray-600">
            Transformar a gestão de imóveis em Lisboa numa experiência simples, segura e rentável — com proximidade, transparência e eficiência.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center">
                <Shield className="h-8 w-8 text-[#ffb100]" />
              </div>
              <h3 className="text-xl font-bold">Integridade</h3>
            </div>
            <p className="text-gray-600">
              Agimos com transparência e honestidade, construindo relações de confiança duradouras.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center">
                <Award className="h-8 w-8 text-[#ffb100]" />
              </div>
              <h3 className="text-xl font-bold">Excelência</h3>
            </div>
            <p className="text-gray-600">
              Procuramos sempre a máxima qualidade, superando as expectativas em cada detalhe.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center">
                <Users className="h-8 w-8 text-[#ffb100]" />
              </div>
              <h3 className="text-xl font-bold">Personalização</h3>
            </div>
            <p className="text-gray-600">
              Adaptamos os nossos serviços a cada imóvel e a cada cliente — porque nenhuma gestão deve ser igual à outra.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;

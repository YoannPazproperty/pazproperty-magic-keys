
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Junte-se à Nossa Família de Clientes Satisfeitos</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Descubra como podemos ajudar a simplificar a gestão do seu imóvel em Lisboa e maximizar o seu retorno.
        </p>
        <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
          <Link to="/contacto">Fale Connosco Hoje</Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;

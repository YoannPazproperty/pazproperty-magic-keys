import React from 'react';

const TestimonialsSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">O Que Dizem os Nossos Clientes</h2>
          <p className="text-xl text-gray-600">
            A satisfação dos nossos clientes é o nosso maior motivo de orgulho.
            Conheça algumas opiniões de quem já confia na PazProperty para gerir o seu imóvel com tranquilidade, proximidade e profissionalismo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="João M." 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">João M.</h3>
                <p className="text-gray-600 text-sm">Lisboa</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Com a PazProperty deixei de me preocupar com chamadas de última hora ou reparações inesperadas. A equipa trata de tudo com profissionalismo e rapidez. Finalmente sinto que o meu imóvel está mesmo bem entregue."
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=689&q=80" 
                  alt="Claire B." 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">Claire B.</h3>
                <p className="text-gray-600 text-sm">Paris / Lisboa</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Vivo em França e tenho um apartamento arrendado em Lisboa. Antes da PazProperty, gerir tudo à distância era um pesadelo. Agora recebo relatórios mensais, tudo funciona, e sei que posso confiar plenamente."
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Tiago R." 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">Tiago R.</h3>
                <p className="text-gray-600 text-sm">Investidor</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Tenho um imóvel em Lisboa e precisava de uma gestão eficiente e transparente. A Alexa e o Yoann entendem realmente o que é ser proprietário — e tratam de tudo como se fossem os donos. Recomendo sem hesitar."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

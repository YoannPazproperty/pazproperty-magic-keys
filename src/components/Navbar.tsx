
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, Wrench } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  
  // Vérifier si la page actuelle est Admin ou Extranet Technique
  const isRestrictedPage = location.pathname.startsWith('/admin') || 
                         location.pathname.startsWith('/extranet-technique');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-primary hover:text-primary/90 transition-colors">
            PazProperty
          </span>
          <img 
            src="/lovable-uploads/5aa8e831-cbe3-43a2-b241-3cba982c898e.png" 
            alt="Pazproperty Logo" 
            className="h-10 w-auto ml-1" 
          />
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="font-medium text-gray-700 hover:text-primary transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/servicos" className="font-medium text-gray-700 hover:text-primary transition-colors">
            {t('nav.services')}
          </Link>
          <Link to="/propriedades" className="font-medium text-gray-700 hover:text-primary transition-colors">
            {t('nav.properties')}
          </Link>
          <Link to="/sobre" className="font-medium text-gray-700 hover:text-primary transition-colors">
            {t('nav.about')}
          </Link>
          <Link to="/contacto" className="font-medium text-gray-700 hover:text-primary transition-colors">
            {t('nav.contact')}
          </Link>
          <Button asChild className="bg-brand-blue hover:bg-primary/90">
            <Link to="/area-cliente">{t('nav.declaration')}</Link>
          </Button>
          <Button asChild variant="outline" size="icon" title="Espace Technique Monday.com" className="ml-2">
            <Link to="/extranet-technique"><Wrench className="h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="ghost" size="icon" title="Administration">
            <Link to="/admin"><Shield className="h-5 w-5" /></Link>
          </Button>
          
          {/* Language selector (seulement pour les pages non restreintes) */}
          {!isRestrictedPage && (
            <div className="ml-2">
              <LanguageSelector />
            </div>
          )}
        </nav>

        {/* Mobile menu */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Language selector pour mobile (seulement pour les pages non restreintes) */}
          {!isRestrictedPage && <LanguageSelector />}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.home')}
                </Link>
                <Link 
                  to="/servicos" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.services')}
                </Link>
                <Link 
                  to="/propriedades" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.properties')}
                </Link>
                <Link 
                  to="/sobre" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.about')}
                </Link>
                <Link 
                  to="/contacto" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.contact')}
                </Link>
                <Button asChild className="bg-brand-blue hover:bg-primary/90 mt-4">
                  <Link to="/area-cliente" onClick={() => setIsOpen(false)}>
                    {t('nav.declaration')}
                  </Link>
                </Button>
                <Link 
                  to="/extranet-technique" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md flex items-center" 
                  onClick={() => setIsOpen(false)}
                >
                  <Wrench className="h-5 w-5 mr-2" /> {t('nav.tech')}
                </Link>
                <Link 
                  to="/admin" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md flex items-center" 
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-5 w-5 mr-2" /> {t('nav.admin')}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

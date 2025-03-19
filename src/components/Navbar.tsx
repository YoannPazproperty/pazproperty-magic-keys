
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gradient">Pazproperty</span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="font-medium text-gray-700 hover:text-primary transition-colors">
            Início
          </Link>
          <Link to="/servicos" className="font-medium text-gray-700 hover:text-primary transition-colors">
            Serviços
          </Link>
          <Link to="/propriedades" className="font-medium text-gray-700 hover:text-primary transition-colors">
            Propriedades
          </Link>
          <Link to="/sobre" className="font-medium text-gray-700 hover:text-primary transition-colors">
            Sobre Nós
          </Link>
          <Link to="/contacto" className="font-medium text-gray-700 hover:text-primary transition-colors">
            Contacto
          </Link>
          <Button asChild className="bg-brand-blue hover:bg-primary/90">
            <Link to="/area-cliente">Área de Cliente</Link>
          </Button>
        </nav>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
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
                Início
              </Link>
              <Link 
                to="/servicos" 
                className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                onClick={() => setIsOpen(false)}
              >
                Serviços
              </Link>
              <Link 
                to="/propriedades" 
                className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                onClick={() => setIsOpen(false)}
              >
                Propriedades
              </Link>
              <Link 
                to="/sobre" 
                className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                onClick={() => setIsOpen(false)}
              >
                Sobre Nós
              </Link>
              <Link 
                to="/contacto" 
                className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md" 
                onClick={() => setIsOpen(false)}
              >
                Contacto
              </Link>
              <Button asChild className="bg-brand-blue hover:bg-primary/90 mt-4">
                <Link to="/area-cliente" onClick={() => setIsOpen(false)}>
                  Área de Cliente
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;

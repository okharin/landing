import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <a href="#" className="text-2xl font-bold font-montserrat gradient-text">
            DuoMind
          </a>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" className="text-sm font-medium hover:text-duomind-purple transition-colors">
            Как это работает
          </a>
          <a href="#capabilities" className="text-sm font-medium hover:text-duomind-purple transition-colors">
            Возможности
          </a>
          <a href="#for-whom" className="text-sm font-medium hover:text-duomind-purple transition-colors">
            Для кого
          </a>
          <a href="#why-duomind" className="text-sm font-medium hover:text-duomind-purple transition-colors">
            Преимущества
          </a>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" className="border-duomind-purple text-duomind-purple hover:bg-duomind-purple/5">
            Записаться на демо
          </Button>
          <Button className="bg-duomind-purple hover:bg-duomind-purple/90">
            Попробовать сейчас
          </Button>
        </div>

        <button 
          className="md:hidden text-duomind-darkBlue" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <a 
              href="#how-it-works" 
              className="text-sm font-medium py-2 hover:text-duomind-purple transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Как это работает
            </a>
            <a 
              href="#capabilities" 
              className="text-sm font-medium py-2 hover:text-duomind-purple transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Возможности
            </a>
            <a 
              href="#for-whom" 
              className="text-sm font-medium py-2 hover:text-duomind-purple transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Для кого
            </a>
            <a 
              href="#why-duomind" 
              className="text-sm font-medium py-2 hover:text-duomind-purple transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Преимущества
            </a>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="outline" className="border-duomind-purple text-duomind-purple w-full justify-center">
                Записаться на демо
              </Button>
              <Button className="bg-duomind-purple hover:bg-duomind-purple/90 w-full justify-center">
                Попробовать сейчас
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
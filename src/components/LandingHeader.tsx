import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const LandingHeader: React.FC = () => {
  const navItems = [
    { name: 'Recursos', href: '#' },
    { name: 'Planos', href: '#planos' },
    { name: 'Diretório', href: '/directory' }, // Novo link
    { name: 'Depoimentos', href: '#depoimentos' },
    { name: 'Contato', href: '#' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm dark:bg-background/90">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Servos de Deus Logo" className="h-8 w-auto" />
          <span className="font-bold text-lg text-lp-navy">Servos de Deus</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              className="text-sm font-medium text-lp-navy hover:text-lp-teal transition-colors"
            >
              {item.name}
            </a>
          ))}
          <Link to="/login" className="text-sm font-medium text-lp-navy hover:text-lp-teal transition-colors">
            Entrar
          </Link>
          <Button asChild className="bg-lp-teal hover:bg-lp-teal-light text-white rounded-full px-6">
            <Link to="/login">Começar Grátis</Link>
          </Button>
        </nav>

        {/* Mobile Menu (Placeholder for now) */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};

export default LandingHeader;
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MessageSquare } from 'lucide-react'; // Whatsapp substituído por MessageSquare

const LandingFooter: React.FC = () => {
  const platformLinks = [
    { name: 'Recursos', href: '#' },
    { name: 'Planos', href: '#planos' },
    { name: 'Templates', href: '#' },
    { name: 'Integrações', href: '#' },
  ];

  const supportLinks = [
    { name: 'Central de Ajuda', href: '#' },
    { name: 'Tutoriais', href: '#' },
    { name: 'Contato', href: '#' },
    { name: 'Status', href: '#' },
  ];

  return (
    <footer className="bg-lp-navy text-white pt-16 pb-8">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Coluna 1: Info */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Servos de Deus Logo" className="h-8 w-auto filter brightness-0 invert" />
            <span className="font-bold text-xl">Servos de Deus</span>
          </div>
          <p className="text-sm text-gray-400 max-w-md">
            A plataforma SaaS definitiva para líderes, pastores e profissionais cristãos criarem sua vitrine digital completa.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-white transition-colors"><Youtube className="h-5 w-5" /></a>
            <a href="#" aria-label="WhatsApp" className="text-gray-400 hover:text-white transition-colors"><MessageSquare className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Coluna 2: Plataforma */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-2">Plataforma</h4>
          <ul className="space-y-2">
            {platformLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 3: Suporte */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-2">Suporte</h4>
          <ul className="space-y-2">
            {supportLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Direitos Autorais e Links Legais */}
      <div className="container border-t border-lp-navy-light mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>© 2024 Servos de Deus. Todos os direitos reservados.</p>
        <div className="flex space-x-4 mt-3 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
          <span className="text-gray-600">Powered by Readdy</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
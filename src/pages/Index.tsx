import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/LandingHeader";
import LandingFooter from "@/components/LandingFooter";
import FeatureCard from "@/components/FeatureCard";
import PricingCard from "@/components/PricingCard";
import TestimonialLandingCard from "@/components/TestimonialLandingCard";
import { Check, Smartphone, User, ShoppingCart, Calendar, Search, Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Dados Mock para a Landing Page
const features = [
  { icon: Smartphone, title: "100% Mobile First", description: "Desenvolvido como PWA, seus visitantes podem salvar seu perfil na tela inicial do celular como um app." },
  { icon: User, title: "Perfil 100% Personalizável", description: "Customize completamente seu perfil digital com total liberdade. Defina cores, imagens, layout e organize cada elemento conforme sua identidade." },
  { icon: ShoppingCart, title: "Loja Virtual Integrada", description: "Venda livros, cursos e produtos do seu ministério diretamente pelo seu perfil com pagamento via WhatsApp." },
  { icon: Calendar, title: "Sistema de Agendamento", description: "Permita que pessoas agendem aconselhamentos, reuniões e atendimentos diretamente pelo seu perfil." },
  { icon: Search, title: "Diretório de Descoberta", description: "Seja encontrado por pessoas que procuram profissionais cristãos na sua área e localidade." },
  { icon: Layers, title: "Seções 100% Personalizáveis", description: "Customize cada seção do seu perfil com total liberdade. Adicione, remova e organize blocos conforme sua necessidade." },
];

const pricingPlans = [
  {
    title: "Básico",
    price: "R$ 29",
    subtitle: "Ideal para começar sua presença digital",
    features: [
      { text: "Mini site personalizado", included: true },
      { text: "Links limitados", included: true },
      { text: "Templates básicos", included: true },
      { text: "Suporte por email", included: true },
      { text: "Banner de publicidade", included: true },
      { text: "Visibilidade no diretório", included: false },
      { text: "Customização de cores", included: false },
      { text: "Estatísticas detalhadas", included: false },
    ],
    buttonText: "Começar Agora",
    buttonVariant: 'outline' as const,
  },
  {
    title: "Intermediário",
    price: "R$ 59",
    subtitle: "Para quem quer mais visibilidade e recursos",
    features: [
      { text: "Tudo do plano Básico", included: true },
      { text: "Mais templates disponíveis", included: true },
      { text: "Customização de cores", included: true },
      { text: "Estatísticas detalhadas", included: true },
      { text: "Visibilidade no diretório (opcional)", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Loja virtual", included: false },
      { text: "Sistema de agendamento", included: false },
      { text: "Domínio personalizado", included: false },
    ],
    isPopular: true,
    buttonText: "Escolher Plano",
    buttonVariant: 'default' as const,
  },
  {
    title: "Premium",
    price: "R$ 99",
    subtitle: "Solução completa para profissionais",
    features: [
      { text: "Tudo do plano Intermediário", included: true },
      { text: "Loja virtual integrada", included: true },
      { text: "Sistema de agendamento", included: true },
      { text: "Customização total", included: true },
      { text: "Domínio personalizado", included: true },
      { text: "Remoção de publicidade", included: true },
      { text: "Links ilimitados", included: true },
      { text: "Suporte VIP", included: true },
    ],
    buttonText: "Começar Premium",
    buttonVariant: 'outline' as const,
  },
];

const testimonials = [
  {
    author: "Pastor João Silva",
    role: "Pastor Principal, Igreja Batista Central",
    content: "O Servos de Deus transformou completamente minha presença digital. Agora tenho um local centralizado para compartilhar meu ministério e conectar com a comunidade.",
    avatarUrl: "/placeholder.svg", // Usando placeholder
  },
  {
    author: "Dra. Maria Santos",
    role: "Psicóloga Cristã, Membro da Igreja Metodista",
    content: "Consegui unir minha profissão com meu ministério de forma elegante. Meus pacientes e irmãos da igreja agora me encontram facilmente online.",
    avatarUrl: "/placeholder.svg",
  },
  {
    author: "Pr. Carlos Oliveira",
    role: "Pastor de Jovens, Igreja Assembleia de Deus",
    content: "A plataforma é perfeita para o ministério jovem. Consigo agendar aconselhamentos e manter contato com os jovens de forma organizada.",
    avatarUrl: "/placeholder.svg",
  },
];


const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-lp-navy dark:text-white">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background Image/Overlay (Simulando o vitral) */}
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: 'url(/placeholder.svg)' }}></div>
          <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-lp-navy dark:text-white">
                Sua <span className="text-lp-teal">Vitrine Digital Cristã</span> Completa
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                Una sua vida profissional e ministerial em um mini site personalizado. Perfeito para pastores, líderes e profissionais cristãos que querem centralizar sua presença online.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Button asChild className="bg-lp-teal hover:bg-lp-teal-light text-white text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-[1.02]">
                  <Link to="/login">Criar Meu Perfil Grátis</Link>
                </Button>
                <Button variant="outline" className="border-2 border-lp-teal text-lp-teal hover:bg-lp-teal/10 text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-[1.02]">
                  Ver Demonstração
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 pt-4">
                <p className="flex items-center"><Check className="h-4 w-4 text-lp-teal mr-1" /> Configuração em 5 minutos</p>
                <p className="flex items-center"><Check className="h-4 w-4 text-lp-teal mr-1" /> 100% Mobile</p>
                <p className="flex items-center"><Check className="h-4 w-4 text-lp-teal mr-1" /> Sem taxa de setup</p>
              </div>
            </div>
            
            {/* Right Image (Mockup) */}
            <div className="hidden lg:flex justify-center">
              <div className="w-full max-w-sm h-[500px] bg-gray-300 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Placeholder for the phone mockup image */}
                <img src="/placeholder.svg" alt="Mobile App Mockup" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-lp-navy dark:text-white mb-2">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-md text-muted-foreground mb-12">
              Uma plataforma completa para profissionais cristãos que querem impactar vidas através da tecnologia
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="planos" className="py-20">
          <div className="container text-center max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-lp-navy dark:text-white mb-2">
              Escolha o plano ideal para você
            </h2>
            <p className="text-md text-muted-foreground mb-12">
              Todos os planos incluem hospedagem, suporte e atualizações automáticas
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {pricingPlans.map((plan) => (
                <PricingCard key={plan.title} {...plan} />
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mt-8">
              Todos os planos incluem 7 dias de teste grátis. Cancele a qualquer momento • Sem taxa de cancelamento • Suporte em português
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="depoimentos" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container text-center max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-lp-navy dark:text-white mb-2">
              O que nossos usuários dizem
            </h2>
            <p className="text-md text-muted-foreground mb-12">
              Líderes e profissionais cristãos que já transformaram sua presença digital
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialLandingCard 
                  key={index} 
                  {...testimonial} 
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-lp-teal py-20">
          <div className="container text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Pronto para transformar sua presença digital?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Junte-se a centenas de líderes cristãos que já estão impactando vidas online
            </p>
            
            <div className="flex flex-col space-y-4 items-center">
              <Button asChild className="w-full max-w-sm bg-white text-lp-teal hover:bg-gray-100 text-lg font-semibold px-8 py-6 rounded-full shadow-xl">
                <Link to="/login">Começar Teste Grátis</Link>
              </Button>
              <Button variant="outline" className="w-full max-w-sm border-2 border-white text-white hover:bg-white/10 text-lg font-semibold px-8 py-6 rounded-full shadow-xl">
                Falar com Especialista
              </Button>
              <p className="text-xs text-white/70 pt-2">
                Sem compromisso • Configuração gratuita • Suporte especializado
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Index;
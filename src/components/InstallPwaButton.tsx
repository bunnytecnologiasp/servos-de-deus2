import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/use-pwa-install';

const InstallPwaButton: React.FC = () => {
  const { canInstall, promptInstall } = usePwaInstall();

  if (!canInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-50 md:relative md:p-0 md:bg-transparent md:border-none md:shadow-none md:mb-4">
      <Button 
        onClick={promptInstall} 
        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Download className="h-4 w-4 mr-2" />
        Instalar Aplicativo
      </Button>
    </div>
  );
};

export default InstallPwaButton;
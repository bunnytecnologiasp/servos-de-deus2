import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Link, Image, MessageSquare, Video, MapPin } from "lucide-react";
import { SectionType } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AddSectionDialogProps {
  refetch: () => void;
}

interface SectionOption {
  type: SectionType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const sectionOptions: SectionOption[] = [
  {
    type: 'links',
    title: 'Links (Botões)',
    description: 'Uma seção de botões de link clicáveis.',
    icon: <Link className="h-6 w-6 text-blue-500" />,
  },
  {
    type: 'photo_slider',
    title: 'Slider de Fotos',
    description: 'Exibe fotos em um carrossel deslizante.',
    icon: <Image className="h-6 w-6 text-purple-500" />,
  },
  {
    type: 'photo_grid',
    title: 'Galeria de Fotos (Grid)',
    description: 'Exibe até 6 fotos em um layout de grade.',
    icon: <Image className="h-6 w-6 text-purple-500" />,
  },
  {
    type: 'testimonials',
    title: 'Depoimentos',
    description: 'Exibe depoimentos de clientes ou parceiros.',
    icon: <MessageSquare className="h-6 w-6 text-yellow-500" />,
  },
  {
    type: 'video',
    title: 'Vídeo Incorporado',
    description: 'Exibe um vídeo do YouTube ou Vimeo.',
    icon: <Video className="h-6 w-6 text-red-600" />,
  },
  {
    type: 'map',
    title: 'Mapa Incorporado',
    description: 'Exibe um mapa do Google Maps.',
    icon: <MapPin className="h-6 w-6 text-green-600" />,
  },
];

const AddSectionDialog: React.FC<AddSectionDialogProps> = ({ refetch }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSection = async (type: SectionType) => {
    setIsSubmitting(true);
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data.user?.id;

    if (!userId) {
      showError("Erro de autenticação: Usuário não encontrado.");
      setIsSubmitting(false);
      return;
    }

    // Fetch current max order_index to place the new section last
    const { data: maxOrderData } = await supabase
      .from('sections')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
      
    const nextOrderIndex = maxOrderData ? maxOrderData.order_index + 1 : 0;

    const { error } = await supabase
      .from('sections')
      .insert({ 
        user_id: userId, 
        type: type, 
        order_index: nextOrderIndex,
        is_active: true,
      });

    if (error) {
      showError(`Erro ao criar seção: ${error.message}`);
    } else {
      showSuccess(`Seção '${type}' criada com sucesso!`);
      refetch();
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Seção
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Escolher Tipo de Seção</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {sectionOptions.map((option) => (
            <Card 
              key={option.type} 
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleAddSection(option.type)}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {option.icon}
                  <div>
                    <p className="font-semibold">{option.title}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-5 w-5 text-primary" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSectionDialog;
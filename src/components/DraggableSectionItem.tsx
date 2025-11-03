import React, { useRef } from 'react';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import { Section, SectionType } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, ToggleLeft, ToggleRight, Link, Image, MessageSquare, Video, MapPin, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import DeleteConfirmationDialog from './DeleteConfirmationDialog'; // Importando

const ItemTypes = {
  SECTION: 'section',
};

interface DraggableSectionItemProps {
  section: Section;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  handleToggleActive: (section: Section) => void;
  handleDelete: (sectionId: string) => Promise<void>; // Atualizando a assinatura
  refetch: () => void;
}

interface DragItem {
  id: string;
  index: number;
}

const getSectionIcon = (type: SectionType) => {
  switch (type) {
    case 'links':
      return <Link className="h-5 w-5 text-blue-500" />;
    case 'photo_slider':
    case 'photo_grid':
      return <Image className="h-5 w-5 text-purple-500" />;
    case 'testimonials':
      return <MessageSquare className="h-5 w-5 text-yellow-500" />;
    case 'video':
      return <Video className="h-5 w-5 text-red-600" />;
    case 'map':
      return <MapPin className="h-5 w-5 text-green-600" />;
    case 'info_card':
      return <Info className="h-5 w-5 text-cyan-500" />;
    default:
      return null;
  }
};

const getSectionTitle = (type: SectionType) => {
  switch (type) {
    case 'links':
      return 'Links (Botões)';
    case 'photo_slider':
      return 'Slider de Fotos';
    case 'photo_grid':
      return 'Galeria de Fotos (Grid)';
    case 'testimonials':
      return 'Depoimentos';
    case 'video':
      return 'Vídeo Incorporado';
    case 'map':
      return 'Mapa Incorporado';
    case 'info_card':
      return 'Informações da Loja/Contato';
    default:
      return 'Seção Desconhecida';
  }
};

const DraggableSectionItem: React.FC<DraggableSectionItemProps> = ({
  section,
  index,
  moveSection,
  handleToggleActive,
  handleDelete,
  refetch,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.SECTION,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.SECTION,
    item: () => ({ id: section.id, index: index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-3 border rounded-lg bg-background shadow-sm transition-opacity",
        isDragging ? "opacity-50" : "opacity-100"
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-center min-w-0 flex-1">
        <div ref={preview} className="cursor-grab mr-3">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mr-3">{getSectionIcon(section.type)}</div>
        <div className="min-w-0">
          <p className="font-medium truncate">{getSectionTitle(section.type)}</p>
          <p className="text-xs text-muted-foreground truncate">Ordem: {index + 1}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleToggleActive(section)}
          title={section.is_active ? "Desativar" : "Ativar"}
        >
          {section.is_active ? (
            <ToggleRight className="h-6 w-6 text-green-500" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-gray-400" />
          )}
        </Button>
        
        {/* Futuramente, adicionar EditSectionDialog aqui */}
        
        <DeleteConfirmationDialog
          onConfirm={() => handleDelete(section.id)}
          title="Excluir Seção Permanentemente"
          description={`Tem certeza que deseja excluir a seção "${getSectionTitle(section.type)}"? Esta ação é irreversível e removerá todo o conteúdo associado (links, fotos, depoimentos) da sua página pública.`}
          trigger={
            <Button variant="ghost" size="icon" title="Deletar">
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default DraggableSectionItem;
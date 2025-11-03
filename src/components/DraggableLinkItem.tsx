import React, { useRef } from 'react';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import { Link } from "@/types/link";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, ToggleLeft, ToggleRight } from "lucide-react";
import EditLinkDialog from "./EditLinkDialog";
import { cn } from "@/lib/utils";
import DeleteConfirmationDialog from './DeleteConfirmationDialog'; // Importando o novo componente

const ItemTypes = {
  LINK: 'link',
};

interface DraggableLinkItemProps {
  link: Link;
  index: number;
  moveLink: (dragIndex: number, hoverIndex: number) => void;
  handleToggleActive: (link: Link) => void;
  handleDelete: (linkId: string) => Promise<void>; // Atualizando a assinatura para Promise<void>
  refetch: () => void;
}

interface DragItem {
  id: string;
  index: number;
}

const DraggableLinkItem: React.FC<DraggableLinkItemProps> = ({
  link,
  index,
  moveLink,
  handleToggleActive,
  handleDelete,
  refetch,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.LINK,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveLink(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations, but it's essential here to avoid flickering
      // when the component is re-rendered.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.LINK,
    item: () => {
      return { id: link.id, index: index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Initialize drag and drop refs
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
        <div className="min-w-0">
          <p className="font-medium truncate">{link.title}</p>
          <p className="text-sm text-muted-foreground truncate">{link.url}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleToggleActive(link)}
          title={link.is_active ? "Desativar" : "Ativar"}
        >
          {link.is_active ? (
            <ToggleRight className="h-6 w-6 text-green-500" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-gray-400" />
          )}
        </Button>
        
        <EditLinkDialog link={link} refetch={refetch} />
        
        <DeleteConfirmationDialog
          onConfirm={() => handleDelete(link.id)}
          title="Remover Link da Seção"
          description={`Tem certeza que deseja remover o link "${link.title}" desta seção? O link principal permanecerá, mas será removido desta lista.`}
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

export default DraggableLinkItem;
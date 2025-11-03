import React, { useRef } from 'react';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import { Photo } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const ItemTypes = {
  PHOTO: 'photo',
};

interface DraggablePhotoItemProps {
  photo: Photo & { order_index: number };
  index: number;
  movePhoto: (dragIndex: number, hoverIndex: number) => void;
  handleDeleteFromSection: (photoId: string) => Promise<void>;
  refetch: () => void;
}

interface DragItem {
  id: string;
  index: number;
}

const DraggablePhotoItem: React.FC<DraggablePhotoItemProps> = ({
  photo,
  index,
  movePhoto,
  handleDeleteFromSection,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.PHOTO,
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

      movePhoto(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.PHOTO,
    item: () => ({ id: photo.id, index: index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-3 border rounded-lg bg-background shadow-sm transition-opacity",
        isDragging ? "opacity-50" : "opacity-100"
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-center min-w-0 flex-1">
        <div ref={preview} className="cursor-grab mr-3">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="w-12 h-12 mr-3 flex-shrink-0 rounded overflow-hidden">
            <img 
                src={photo.url} 
                alt={photo.caption || "Foto"} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
            />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{photo.caption || "Sem legenda"}</p>
          <p className="text-sm text-muted-foreground truncate">{photo.url}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <DeleteConfirmationDialog
          onConfirm={() => handleDeleteFromSection(photo.id)}
          title="Remover Foto da Seção"
          description={`Tem certeza que deseja remover esta foto da seção? A foto principal permanecerá na sua biblioteca, mas será removida desta lista.`}
          trigger={
            <Button variant="ghost" size="icon" title="Remover da Seção">
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default DraggablePhotoItem;
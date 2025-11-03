import React, { useState, useCallback, useEffect } from "react";
import { Photo, Section } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Loader2, GripVertical, Trash2, Image } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { arrayMoveImmutable } from 'array-move';
import DraggablePhotoItem from "./DraggablePhotoItem";
import AddPhotoToSectionDialog from "./AddPhotoToSectionDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import DndProviderWrapper from "./DndProvider";
import { useQuery } from "@tanstack/react-query"; // Adicionando importação de useQuery

// New type for photos within a section, including order_index
interface SectionPhotoItem extends Photo {
  order_index: number;
}

interface PhotoSectionManagerProps {
  section: Section;
  refetchSections: () => void;
}

// Fetch photos specific to this section
const fetchSectionPhotos = async (sectionId: string): Promise<SectionPhotoItem[]> => {
  const { data, error } = await supabase
    .from("section_photos")
    .select(`
      order_index,
      photo:photo_id (id, user_id, url, caption, created_at)
    `)
    .eq("section_id", sectionId)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Flatten the structure
  return data.map(item => ({
    ...item.photo,
    order_index: item.order_index,
  })) as SectionPhotoItem[];
};


const PhotoSectionManager: React.FC<PhotoSectionManagerProps> = ({ section, refetchSections }) => {
  const { data: photos, isLoading, refetch: refetchLocalPhotos } = useQuery<SectionPhotoItem[]>({
    queryKey: ["sectionPhotos", section.id],
    queryFn: () => fetchSectionPhotos(section.id),
  });

  const [localPhotos, setLocalPhotos] = useState<SectionPhotoItem[]>(photos || []);
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state when external photos prop changes
  useEffect(() => {
    if (photos) {
      setLocalPhotos(photos);
      setIsDirty(false);
    }
  }, [photos]);

  const movePhoto = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalPhotos((prevPhotos: SectionPhotoItem[]) => {
      const newPhotos = arrayMoveImmutable(prevPhotos, dragIndex, hoverIndex);
      setIsDirty(true);
      return newPhotos;
    });
  }, []);

  const handleSaveOrder = async () => {
    if (!isDirty || !localPhotos) return;

    const updates = localPhotos.map((photo, index) => ({
      section_id: section.id,
      photo_id: photo.id,
      order_index: index,
    }));

    // Perform batch upsert on section_photos table
    const { error } = await supabase
      .from('section_photos')
      .upsert(updates, { onConflict: 'section_id, photo_id' });

    if (error) {
      showError("Erro ao salvar a ordem das fotos: " + error.message);
    } else {
      showSuccess("Ordem das fotos salva com sucesso!");
      setIsDirty(false);
      refetchLocalPhotos();
      refetchSections(); // Refetch global sections/content to update public view
    }
  };

  const handleDeleteFromSection = async (photoId: string) => {
    // Delete only the entry in the section_photos table
    const { error } = await supabase
      .from('section_photos')
      .delete()
      .eq('section_id', section.id)
      .eq('photo_id', photoId);

    if (error) {
      showError("Erro ao remover foto da seção: " + error.message);
      throw error;
    } else {
      showSuccess("Foto removida da seção com sucesso!");
      refetchLocalPhotos();
      refetchSections();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  const sectionTitle = section.type === 'photo_slider' ? 'Slider de Fotos' : 'Galeria de Fotos (Grid)';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{sectionTitle} ({localPhotos.length})</CardTitle>
        <div className="flex space-x-2">
            <Button 
              onClick={handleSaveOrder} 
              disabled={!isDirty}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Ordem
            </Button>
            <AddPhotoToSectionDialog 
                sectionId={section.id} 
                refetch={refetchLocalPhotos} 
            />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {localPhotos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Esta seção está vazia. Adicione fotos usando o botão "Adicionar Foto à Seção".
          </p>
        ) : (
          <DndProviderWrapper>
            <div className="space-y-2">
              {localPhotos.map((photo, index) => (
                <DraggablePhotoItem
                  key={photo.id}
                  index={index}
                  photo={photo}
                  movePhoto={movePhoto}
                  handleDeleteFromSection={handleDeleteFromSection}
                  refetch={refetchLocalPhotos}
                />
              ))}
            </div>
          </DndProviderWrapper>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoSectionManager;
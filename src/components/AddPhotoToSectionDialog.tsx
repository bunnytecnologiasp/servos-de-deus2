import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Photo } from "@/types/content";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Importando useQueryClient
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface AddPhotoToSectionDialogProps {
  sectionId: string;
  refetch: () => void;
}

// Fetch all photos owned by the user
const fetchAllUserPhotos = async (): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as Photo[];
};

// Fetch photos already in this section
const fetchExistingSectionPhotoIds = async (sectionId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from("section_photos")
        .select("photo_id")
        .eq("section_id", sectionId);

    if (error) {
        throw new Error(error.message);
    }
    return data.map(item => item.photo_id);
};


const AddPhotoToSectionDialog: React.FC<AddPhotoToSectionDialogProps> = ({ sectionId, refetch }) => {
  const [open, setOpen] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient(); // Inicializando queryClient

  const { data: allPhotos, isLoading: isLoadingAllPhotos } = useQuery<Photo[]>({
    queryKey: ["allUserPhotos"],
    queryFn: fetchAllUserPhotos,
  });
  
  const { data: existingPhotoIds, isLoading: isLoadingExistingIds } = useQuery<string[]>({
    queryKey: ["existingSectionPhotoIds", sectionId],
    queryFn: () => fetchExistingSectionPhotoIds(sectionId),
    enabled: open, // Only fetch when dialog is open
  });

  const isLoading = isLoadingAllPhotos || isLoadingExistingIds;

  // Initialize selected photos when dialog opens
  React.useEffect(() => {
    if (open && existingPhotoIds) {
        setSelectedPhotoIds(existingPhotoIds);
    }
    // When opening, ensure we refetch existing IDs to get the latest state
    if (open) {
        queryClient.invalidateQueries({ queryKey: ["existingSectionPhotoIds", sectionId] });
    }
  }, [open, existingPhotoIds, queryClient, sectionId]);

  const handleTogglePhoto = (photoId: string, checked: boolean) => {
    setSelectedPhotoIds(prev => {
      if (checked) {
        return [...prev, photoId];
      } else {
        return prev.filter(id => id !== photoId);
      }
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    const existingIdsSet = new Set(existingPhotoIds || []);
    
    // IDs que estavam selecionados e não estão mais (para remover)
    const photosToRemove = (existingPhotoIds || []).filter(id => !selectedPhotoIds.includes(id));
    
    // IDs que estão selecionados agora e não estavam antes (para adicionar)
    const photosToAdd = selectedPhotoIds.filter(id => !existingIdsSet.has(id));
    
    let hasError = false;

    // 1. Remove photos
    if (photosToRemove && photosToRemove.length > 0) {
        const { error: deleteError } = await supabase
            .from('section_photos')
            .delete()
            .eq('section_id', sectionId)
            .in('photo_id', photosToRemove);
        
        if (deleteError) {
            showError(`Erro ao remover fotos: ${deleteError.message}`);
            hasError = true;
        }
    }

    // 2. Add new photos
    if (photosToAdd && photosToAdd.length > 0 && !hasError) {
        // Find the current max order index
        const { data: maxOrderData } = await supabase
            .from('section_photos')
            .select('order_index')
            .eq('section_id', sectionId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single();
            
        let nextOrderIndex = maxOrderData ? maxOrderData.order_index + 1 : 0;

        const payload = photosToAdd.map((photo_id, index) => ({
            section_id: sectionId,
            photo_id: photo_id,
            order_index: nextOrderIndex + index,
        }));

        const { error: insertError } = await supabase
            .from('section_photos')
            .insert(payload);

        if (insertError) {
            showError(`Erro ao adicionar fotos: ${insertError.message}`);
            hasError = true;
        }
    }

    if (!hasError) {
        showSuccess("Associações de fotos salvas com sucesso!");
        // Invalidate queries to ensure PhotoSectionManager and Index page refresh
        queryClient.invalidateQueries({ queryKey: ["sectionPhotos", sectionId] });
        queryClient.invalidateQueries({ queryKey: ["publicPhotosGrouped"] });
        
        refetch(); // Refetch local photos in PhotoSectionManager
        setOpen(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Fotos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Fotos à Seção</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        ) : (
            <>
                <p className="text-sm text-muted-foreground">
                    Selecione as fotos da sua biblioteca que você deseja incluir nesta seção.
                </p>
                <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 border rounded-md">
                    {allPhotos && allPhotos.length > 0 ? (
                        allPhotos.map((photo) => (
                            <Card 
                                key={photo.id} 
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleTogglePhoto(photo.id, !selectedPhotoIds.includes(photo.id))}
                            >
                                <CardContent className="p-2 relative">
                                    <img 
                                        src={photo.url} 
                                        alt={photo.caption || "Foto"} 
                                        className="w-full aspect-square object-cover rounded-md"
                                        onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                                    />
                                    <div className="absolute top-3 right-3">
                                        <Checkbox
                                            checked={selectedPhotoIds.includes(photo.id)}
                                            onCheckedChange={(checked) => handleTogglePhoto(photo.id, !!checked)}
                                        />
                                    </div>
                                    <p className="text-xs mt-1 truncate text-muted-foreground">{photo.caption || "Sem legenda"}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="col-span-3 text-center text-muted-foreground py-4">
                            Nenhuma foto encontrada. Adicione fotos na aba "Fotos" do Dashboard.
                        </p>
                    )}
                </div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            'Salvar Seleção'
                        )}
                    </Button>
                </div>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPhotoToSectionDialog;
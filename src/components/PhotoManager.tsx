import React from "react";
import { Photo } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Image, Loader2, Edit } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import AddPhotoDialog from "./AddPhotoDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog"; // Importando
import EditPhotoDialog from "./EditPhotoDialog"; // Importando o novo componente

interface PhotoManagerProps {
  photos: Photo[];
  refetch: () => void;
  isLoading: boolean;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({ photos, refetch, isLoading }) => {

  const handleDelete = async (photo: Photo) => {
    // 1. Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photo.id);

    if (dbError) {
      showError("Erro ao deletar foto do banco de dados: " + dbError.message);
      throw dbError; // Throw error to keep DeleteConfirmationDialog in loading state if needed
    }
    
    // 2. If the URL is a Supabase Storage URL, attempt to delete the file as well
    if (photo.url.includes('xanhpdnbtxawkauheghr.supabase.co/storage/v1/object/public/photos/')) {
      try {
        // Extract the file path from the public URL
        const filePath = photo.url.split('photos/')[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('photos')
            .remove([filePath]);
          
          if (storageError) {
            console.warn("Aviso: Falha ao deletar arquivo do Storage. A foto foi removida do DB, mas o arquivo pode ter permanecido.", storageError);
          }
        }
      } catch (e) {
        console.warn("Erro ao tentar deletar arquivo do Storage:", e);
      }
    }

    showSuccess("Foto deletada com sucesso!");
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="p-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Minhas Fotos ({photos.length})</CardTitle>
        <AddPhotoDialog refetch={refetch} />
      </CardHeader>
      <CardContent className="space-y-4">
        {photos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Você ainda não tem fotos. Adicione URLs de fotos ou faça upload para usar no Slider ou Grid.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="border rounded-lg overflow-hidden flex flex-col">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <img 
                    src={photo.url} 
                    alt={photo.caption || "Foto"} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"; // Fallback image
                    }}
                  />
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{photo.caption || "Sem legenda"}</p>
                  </div>
                  <div className="flex space-x-1">
                    <EditPhotoDialog photo={photo} refetch={refetch} />
                    <DeleteConfirmationDialog
                      onConfirm={() => handleDelete(photo)}
                      title="Excluir Foto"
                      description={`Tem certeza que deseja excluir esta foto? Ela será removida de todas as seções de Slider e Galeria.`}
                      trigger={
                        <Button variant="ghost" size="icon" title="Deletar">
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoManager;
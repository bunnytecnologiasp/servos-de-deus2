import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Profile } from "@/types/profile";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const AVATAR_BUCKET_NAME = 'photos'; // ALTERADO: Usando o bucket 'photos' temporariamente

interface AvatarUploaderProps {
  profile: Profile | null;
  refetchProfile: () => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ profile, refetchProfile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentAvatarUrl = profile?.avatar_url;
  const userId = profile?.id;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) {
        showError("Erro: Usuário não autenticado ou arquivo não selecionado.");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showError("O tamanho máximo da imagem é 2MB.");
      return;
    }

    setIsUploading(true);
    console.log("User ID confirmed:", userId);

    try {
      // 1. Delete old avatar if it exists and is a Supabase Storage URL
      if (currentAvatarUrl && currentAvatarUrl.includes('xanhpdnbtxawkauheghr.supabase.co/storage/v1/object/public/photos/')) {
        await deleteOldAvatar(currentAvatarUrl);
      }

      // 2. Upload new file
      const fileExt = file.name.split('.').pop();
      // Armazenando avatares em uma subpasta 'avatars' dentro do bucket 'photos'
      const filePath = `${userId}/avatars/avatar.${fileExt}`; 

      console.log(`Attempting upload for user ${userId} to path: ${AVATAR_BUCKET_NAME}/${filePath}`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite existing file
        });

      if (uploadError) {
        console.error("Supabase Storage Upload Error:", uploadError);
        showError(`Erro ao fazer upload: ${uploadError.message}. Por favor, confirme que o bucket '${AVATAR_BUCKET_NAME}' existe no Supabase.`);
        return;
      }

      // 3. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET_NAME)
        .getPublicUrl(filePath);
      
      const newAvatarUrl = publicUrlData.publicUrl;

      // 4. Update profile table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        showError(`Erro ao atualizar perfil: ${updateError.message}`);
        return;
      }

      showSuccess("Avatar atualizado com sucesso!");
      refetchProfile();

    } catch (e) {
      showError("Ocorreu um erro inesperado durante o upload.");
      console.error(e);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
    }
  };
  
  const deleteOldAvatar = async (url: string) => {
    try {
        // The path is everything after the bucket name in the public URL
        const pathSegments = url.split(`${AVATAR_BUCKET_NAME}/`)[1];
        if (pathSegments) {
            const filePath = pathSegments;
            const { error: storageError } = await supabase.storage
                .from(AVATAR_BUCKET_NAME)
                .remove([filePath]);
            
            if (storageError) {
                console.warn("Aviso: Falha ao deletar arquivo antigo do Storage.", storageError);
            }
        }
    } catch (e) {
        console.error("Erro ao tentar deletar arquivo antigo do Storage:", e);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!userId) return;

    // 1. Delete file from storage if it exists
    if (currentAvatarUrl && currentAvatarUrl.includes('xanhpdnbtxawkauheghr.supabase.co/storage/v1/object/public/photos/')) {
        await deleteOldAvatar(currentAvatarUrl);
    }
    
    // 2. Update profile table to null
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (updateError) {
        showError(`Erro ao remover avatar do perfil: ${updateError.message}`);
        throw updateError;
    }

    showSuccess("Avatar removido com sucesso!");
    refetchProfile();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Foto de Perfil (Avatar)</h3>
      <div className="flex items-center space-x-4">
        {currentAvatarUrl ? (
          <img 
            // Se o URL for do Supabase Storage, garantimos que ele usa o bucket 'photos'
            src={currentAvatarUrl.includes('xanhpdnbtxawkauheghr.supabase.co/storage/v1/object/public/photos/') ? currentAvatarUrl : currentAvatarUrl} 
            alt="Avatar Atual" 
            className="w-20 h-20 rounded-full object-cover border shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-500" />
          </div>
        )}
        
        <div className="flex flex-col space-y-2 flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
            className="hidden"
            id="avatar-upload-input"
          />
          <div className="flex space-x-2">
            <Button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Enviando..." : "Trocar/Fazer Upload"}
            </Button>
            
            {currentAvatarUrl && (
                <DeleteConfirmationDialog
                    onConfirm={handleRemoveAvatar}
                    title="Remover Avatar"
                    description="Tem certeza que deseja remover sua foto de perfil? Ela será substituída pelo ícone padrão."
                    trigger={
                        <Button variant="outline" size="icon" disabled={isUploading} title="Remover Avatar">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    }
                />
            )}
          </div>
          <p className="text-xs text-muted-foreground">Formatos: JPG, PNG. Máx: 2MB.</p>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploader;
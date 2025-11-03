import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Upload, Link as LinkIcon, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Photo } from "@/types/content";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_BUCKET_NAME = 'photos';

// Helper para validar URL apenas se não for vazia
const urlSchema = z.string().optional().nullable().transform(e => e === "" ? null : e).refine(
    (val) => !val || z.string().url().safeParse(val).success,
    { message: "URL inválida. Certifique-se de incluir http:// ou https://." }
);

const photoSchema = z.object({
  caption: z.string().max(100, "A legenda deve ter no máximo 100 caracteres.").optional().nullable(),
  
  // Estes campos são opcionais na edição, pois a foto pode não ser alterada
  url: urlSchema,
  file: z.any()
    .optional()
    .nullable()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `O tamanho máximo da imagem é 5MB.`),
});

type PhotoFormValues = z.infer<typeof photoSchema>;

interface EditPhotoDialogProps {
  photo: Photo;
  refetch: () => void;
}

const EditPhotoDialog: React.FC<EditPhotoDialogProps> = ({ photo, refetch }) => {
  const [open, setOpen] = useState(false);
  // Determina o tipo de upload inicial baseado se a URL é de um arquivo local do Supabase ou externa
  const isSupabaseStorageUrl = photo.url.includes('xanhpdnbtxawkauheghr.supabase.co/storage/v1/object/public/photos/');
  const initialUploadType = isSupabaseStorageUrl ? 'upload' : 'url';
  const [uploadType, setUploadType] = useState<'url' | 'upload'>(initialUploadType);

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      caption: photo.caption || "",
      url: isSupabaseStorageUrl ? "" : photo.url, // Se for URL de storage, limpamos o campo URL para evitar confusão
      file: null,
    },
    mode: "onChange", 
  });

  React.useEffect(() => {
    // Reset form state when dialog opens or photo prop changes
    const isCurrentSupabaseStorageUrl = photo.url.includes('xanhpdnbtxawkauheghr.supabase.co/storage/v1/object/public/photos/');
    const currentInitialUploadType = isCurrentSupabaseStorageUrl ? 'upload' : 'url';
    setUploadType(currentInitialUploadType);
    
    form.reset({
        caption: photo.caption || "",
        url: isCurrentSupabaseStorageUrl ? "" : photo.url,
        file: null,
    });
  }, [photo, open, form]);


  const handleClose = () => {
    setOpen(false);
    // Reset form state to initial values when closing
    form.reset({
        caption: photo.caption || "",
        url: isSupabaseStorageUrl ? "" : photo.url,
        file: null,
    });
  };

  const deleteOldFileFromStorage = async (url: string) => {
    try {
        if (url.includes('xanhpdnbtxawkauheghr.supabase.co/storage/v1/object/public/photos/')) {
            const filePath = url.split('photos/')[1];
            if (filePath) {
                const { error: storageError } = await supabase.storage
                    .from(AVATAR_BUCKET_NAME)
                    .remove([filePath]);
                
                if (storageError) {
                    console.warn("Aviso: Falha ao deletar arquivo antigo do Storage.", storageError);
                }
            }
        }
    } catch (e) {
        console.error("Erro ao tentar deletar arquivo antigo do Storage:", e);
    }
  };

  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      showError(`Erro ao fazer upload: ${error.message}`);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const onSubmit = async (values: PhotoFormValues) => {
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data.user?.id;

    if (!userId) {
      showError("Erro de autenticação: Usuário não encontrado.");
      return;
    }
    
    let newPhotoUrl: string | undefined = undefined;
    let shouldDeleteOldFile = false;

    if (uploadType === 'upload' && values.file) {
      // Novo arquivo enviado: Deletar o antigo (se for do storage) e fazer upload do novo
      shouldDeleteOldFile = isSupabaseStorageUrl;
      newPhotoUrl = await uploadFile(values.file, userId);
      if (!newPhotoUrl) return; // Upload failed
    } else if (uploadType === 'url' && values.url && values.url !== photo.url) {
      // Nova URL externa fornecida: Deletar o antigo (se for do storage)
      shouldDeleteOldFile = isSupabaseStorageUrl;
      newPhotoUrl = values.url;
    } else if (uploadType === 'url' && !values.url && !isSupabaseStorageUrl) {
        // Se estava usando URL externa e o campo foi limpo, mantemos a URL original
        newPhotoUrl = photo.url;
    } else if (uploadType === 'upload' && !values.file && isSupabaseStorageUrl) {
        // Se estava usando upload e nenhum novo arquivo foi fornecido, mantemos a URL original
        newPhotoUrl = photo.url;
    } else {
        // Nenhuma alteração na URL/Arquivo, apenas na legenda
        newPhotoUrl = photo.url;
    }
    
    if (shouldDeleteOldFile) {
        await deleteOldFileFromStorage(photo.url);
    }

    const payload = {
      url: newPhotoUrl,
      caption: values.caption || null,
    };
    
    const { error } = await supabase
      .from("photos")
      .update(payload)
      .eq('id', photo.id);

    if (error) {
      showError(`Erro ao atualizar foto: ${error.message}`);
    } else {
      showSuccess("Foto atualizada com sucesso!");
      refetch();
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editar">
          <Edit className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Foto</DialogTitle>
        </DialogHeader>
        
        <Tabs value={uploadType} onValueChange={(value) => {
            setUploadType(value as 'url' | 'upload');
            // Clear the unused field when switching tabs to prevent validation conflicts
            if (value === 'url') {
                form.setValue('file', null, { shouldValidate: true });
            } else {
                form.setValue('url', "", { shouldValidate: true });
            }
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" /> URL Externa
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" /> Upload de Arquivo
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              
              <TabsContent value="url" className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: https://meusite.com/foto.jpg" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Substituir Arquivo (Máx. 5MB)</FormLabel>
                      <FormControl>
                        <Input 
                          {...fieldProps}
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            onChange(event.target.files && event.target.files[0]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Common Fields */}
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legenda (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Uma breve descrição da foto" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditPhotoDialog;
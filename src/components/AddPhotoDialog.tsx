import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Loader2, Upload, Link as LinkIcon } from "lucide-react";
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper para validar URL apenas se não for vazia
const urlSchema = z.string().optional().nullable().transform(e => e === "" ? null : e).refine(
    (val) => !val || z.string().url().safeParse(val).success,
    { message: "URL inválida. Certifique-se de incluir http:// ou https://." }
);

const photoSchema = z.object({
  caption: z.string().max(100, "A legenda deve ter no máximo 100 caracteres.").optional().nullable(),
  
  url: urlSchema,
  
  file: z.any()
    .optional()
    .nullable()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `O tamanho máximo da imagem é 5MB.`),
}).refine(
    (data) => (data.url !== null && data.url !== undefined) || (data.file !== null && data.file !== undefined),
    {
        message: "Você deve fornecer uma URL ou fazer o upload de um arquivo.",
        path: ["url"], // Atribui o erro ao campo URL se ambos estiverem vazios
    }
);

type PhotoFormValues = z.infer<typeof photoSchema>;

interface AddPhotoDialogProps {
  refetch: () => void;
}

const AddPhotoDialog: React.FC<AddPhotoDialogProps> = ({ refetch }) => {
  const [open, setOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'upload'>('url');

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      url: "",
      caption: "",
      file: null,
    },
    // Revalida o formulário ao mudar o tipo de upload
    mode: "onChange", 
  });

  const handleClose = () => {
    setOpen(false);
    form.reset();
    setUploadType('url');
  };

  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log("Attempting upload to path:", filePath);

    const { data, error } = await supabase.storage
      .from('photos') // Assuming 'photos' is your bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage Upload Error:", error);
      showError(`Erro ao fazer upload: ${error.message}`);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    console.log("Public URL generated:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  };

  const onSubmit = async (values: PhotoFormValues) => {
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data.user?.id;

    if (!userId) {
      showError("Erro de autenticação: Usuário não encontrado.");
      return;
    }
    
    console.log("Authenticated User ID:", userId);

    let photoUrl: string | null = null;

    if (uploadType === 'upload') {
      if (!values.file) {
        showError("Por favor, selecione um arquivo para upload.");
        return;
      }
      photoUrl = await uploadFile(values.file, userId);
      if (!photoUrl) return; // Upload failed
    } else if (uploadType === 'url') {
      if (!values.url) {
        showError("Por favor, insira uma URL válida.");
        return;
      }
      photoUrl = values.url;
    } else {
      // Should not happen due to Tabs state, but safety check
      showError("Método de upload inválido.");
      return;
    }
    
    if (!photoUrl) {
        showError("URL da foto não pôde ser determinada.");
        return;
    }

    const payload = {
      user_id: userId,
      url: photoUrl,
      caption: values.caption || null,
    };
    
    console.log("Inserting photo record into DB:", payload);

    const { error } = await supabase
      .from("photos")
      .insert(payload);

    if (error) {
      console.error("Supabase DB Insert Error:", error);
      showError(`Erro ao adicionar foto ao banco de dados: ${error.message}`);
    } else {
      showSuccess("Foto adicionada com sucesso!");
      refetch();
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Foto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Foto</DialogTitle>
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
                      <FormLabel>Arquivo de Imagem (Máx. 5MB)</FormLabel>
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
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    'Salvar Foto'
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

export default AddPhotoDialog;
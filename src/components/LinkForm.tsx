import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "@/types/link";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useLinkSections } from "@/hooks/use-link-sections";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query"; // Importando useQueryClient

const linkSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  url: z.string().url("URL inválida. Certifique-se de incluir http:// ou https://."),
  is_active: z.boolean().default(true),
  section_ids: z.array(z.string()).min(1, "Selecione pelo menos uma seção de links."),
});

type LinkFormValues = z.infer<typeof linkSchema>;

interface LinkFormProps {
  initialData?: Link & { section_ids?: string[] };
  onSuccess: () => void;
  onClose: () => void;
}

const LinkForm: React.FC<LinkFormProps> = ({ initialData, onSuccess, onClose }) => {
  const isEdit = !!initialData;
  const { data: linkSections, isLoading: isLoadingSections } = useLinkSections();
  const queryClient = useQueryClient(); // Inicializando o queryClient

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: initialData?.title || "",
      url: initialData?.url || "",
      is_active: initialData?.is_active ?? true,
      section_ids: initialData?.section_ids || [],
    },
  });

  // Fetch existing section assignments for the link if editing
  useEffect(() => {
    if (isEdit && !initialData.section_ids) {
      supabase
        .from("section_links")
        .select("section_id")
        .eq("link_id", initialData.id)
        .then(({ data, error }) => {
          if (data) {
            const ids = data.map(item => item.section_id);
            form.setValue("section_ids", ids);
          }
          if (error) {
            console.error("Error fetching section links:", error);
          }
        });
    }
  }, [isEdit, initialData, form]);


  const onSubmit = async (values: LinkFormValues) => {
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data.user?.id;

    if (!userId) {
      showError("Você precisa estar logado para realizar esta ação.");
      return;
    }
    
    const linkPayload = {
      title: values.title,
      url: values.url,
      is_active: values.is_active,
      user_id: userId,
    };

    let linkId: string | undefined;
    let error = null;

    if (isEdit) {
      // 1. Update Link details
      const result = await supabase
        .from("links")
        .update(linkPayload)
        .eq("id", initialData.id)
        .select("id")
        .single();
      
      error = result.error;
      linkId = result.data?.id;

    } else {
      // 1. Create new Link
      const result = await supabase
        .from("links")
        .insert(linkPayload)
        .select("id")
        .single();
      
      error = result.error;
      linkId = result.data?.id;
    }

    if (error || !linkId) {
      showError(`Erro ao ${isEdit ? 'atualizar' : 'criar'} link: ${error?.message || 'ID do link não retornado.'}`);
      return;
    }

    // 2. Manage Section Assignments (section_links)
    
    // A. Delete existing assignments for this link
    const { error: deleteError } = await supabase
      .from("section_links")
      .delete()
      .eq("link_id", linkId);

    if (deleteError) {
      showError(`Erro ao limpar atribuições de seção: ${deleteError.message}`);
      return;
    }

    // B. Insert new assignments
    const sectionLinkPayload = values.section_ids.map(section_id => ({
      link_id: linkId,
      section_id: section_id,
      order_index: 0, // Order will be managed by LinkManager per section
    }));

    const { error: insertError } = await supabase
      .from("section_links")
      .insert(sectionLinkPayload);

    if (insertError) {
      showError(`Erro ao atribuir seções: ${insertError.message}`);
      return;
    }
    
    // 3. Invalidate queries to force UI refresh
    // Invalidate all queries starting with ["sectionLinks"] to refresh LinkManager components
    queryClient.invalidateQueries({ queryKey: ["sectionLinks"] });
    // Invalidate public links query to refresh Index page
    queryClient.invalidateQueries({ queryKey: ["publicLinksGrouped"] });


    showSuccess(`Link ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
    onSuccess();
    onClose();
  };

  if (isLoadingSections) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const availableSections = linkSections || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Meu Instagram" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="Ex: https://instagram.com/meuusuario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Status</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {field.value ? "O link está ativo e visível." : "O link está desativado e oculto."}
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Section Assignment Field */}
        <FormField
          control={form.control}
          name="section_ids"
          render={() => (
            <FormItem>
              <FormLabel>Seções de Links</FormLabel>
              <div className="space-y-2">
                {availableSections.map((section) => (
                  <FormField
                    key={section.id}
                    control={form.control}
                    name="section_ids"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={section.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(section.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, section.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== section.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {`Seção ${section.order_index + 1} (ID: ${section.id.substring(0, 4)}...)`}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || availableSections.length === 0}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isEdit ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              isEdit ? 'Salvar Alterações' : 'Criar Link'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LinkForm;
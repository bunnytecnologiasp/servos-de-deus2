import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Section } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Loader2 } from "lucide-react";

const contentUrlSchema = z.object({
  content_url: z.string().url("URL inválida. Certifique-se de incluir http:// ou https://.").min(1, "A URL é obrigatória."),
});

type ContentUrlFormValues = z.infer<typeof contentUrlSchema>;

interface ContentUrlFormProps {
  section: Section & { content_url: string | null };
  refetch: () => void;
}

const ContentUrlForm: React.FC<ContentUrlFormProps> = ({ section, refetch }) => {
  const isVideo = section.type === 'video';
  const title = isVideo ? 'URL do Vídeo (YouTube/Vimeo)' : 'URL de Incorporação do Mapa (Google Maps Embed)';
  const placeholder = isVideo ? 'Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ' : 'Ex: <iframe src="https://www.google.com/maps/embed?..."';

  const form = useForm<ContentUrlFormValues>({
    resolver: zodResolver(contentUrlSchema),
    defaultValues: {
      content_url: section.content_url || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      content_url: section.content_url || "",
    });
  }, [section.content_url, form]);

  const onSubmit = async (values: ContentUrlFormValues) => {
    const payload = {
      content_url: values.content_url,
    };

    const { error } = await supabase
      .from("sections")
      .update(payload)
      .eq("id", section.id);

    if (error) {
      showError(`Erro ao salvar ${section.type}: ${error.message}`);
    } else {
      showSuccess(`${isVideo ? 'Vídeo' : 'Mapa'} atualizado com sucesso!`);
      form.reset(values);
      refetch();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title}</FormLabel>
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Salvar Conteúdo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContentUrlForm;
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Loader2 } from "lucide-react";
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
import { Testimonial } from "@/types/content";

const testimonialSchema = z.object({
  author: z.string().min(1, "O nome do autor é obrigatório."),
  content: z.string().min(10, "O depoimento deve ter pelo menos 10 caracteres.").max(500, "O depoimento deve ter no máximo 500 caracteres."),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface EditTestimonialDialogProps {
  testimonial: Testimonial;
  refetch: () => void;
}

const EditTestimonialDialog: React.FC<EditTestimonialDialogProps> = ({ testimonial, refetch }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      author: testimonial.author,
      content: testimonial.content,
    },
    mode: "onChange",
  });
  
  // Reset form when dialog opens or testimonial data changes
  useEffect(() => {
    if (open) {
        form.reset({
            author: testimonial.author,
            content: testimonial.content,
        });
    }
  }, [testimonial, open, form]);


  const handleClose = () => {
    setOpen(false);
    form.reset({
        author: testimonial.author,
        content: testimonial.content,
    });
  };

  const onSubmit = async (values: TestimonialFormValues) => {
    const payload = {
      author: values.author,
      content: values.content,
    };

    const { error } = await supabase
      .from("testimonials")
      .update(payload)
      .eq('id', testimonial.id);

    if (error) {
      showError(`Erro ao atualizar depoimento: ${error.message}`);
    } else {
      showSuccess("Depoimento atualizado com sucesso!");
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
          <DialogTitle>Editar Depoimento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do autor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo do Depoimento</FormLabel>
                  <FormControl>
                    <Textarea placeholder="O que o autor disse..." {...field} />
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
      </DialogContent>
    </Dialog>
  );
};

export default EditTestimonialDialog;
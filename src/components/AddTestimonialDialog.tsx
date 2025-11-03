import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Loader2 } from "lucide-react";
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

const testimonialSchema = z.object({
  author: z.string().min(1, "O nome do autor é obrigatório."),
  content: z.string().min(10, "O depoimento deve ter pelo menos 10 caracteres.").max(500, "O depoimento deve ter no máximo 500 caracteres."),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface AddTestimonialDialogProps {
  refetch: () => void;
}

const AddTestimonialDialog: React.FC<AddTestimonialDialogProps> = ({ refetch }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      author: "",
      content: "",
    },
  });

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = async (values: TestimonialFormValues) => {
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data.user?.id;

    if (!userId) {
      showError("Erro de autenticação: Usuário não encontrado.");
      return;
    }

    const payload = {
      user_id: userId,
      author: values.author,
      content: values.content,
    };

    const { error } = await supabase
      .from("testimonials")
      .insert(payload);

    if (error) {
      showError(`Erro ao adicionar depoimento: ${error.message}`);
    } else {
      showSuccess("Depoimento adicionado com sucesso!");
      refetch();
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Depoimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Depoimento</DialogTitle>
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  'Salvar Depoimento'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestimonialDialog;
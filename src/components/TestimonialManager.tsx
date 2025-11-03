import React from "react";
import { Testimonial } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import AddTestimonialDialog from "./AddTestimonialDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog"; // Importando
import EditTestimonialDialog from "./EditTestimonialDialog"; // Importando

interface TestimonialManagerProps {
  testimonials: Testimonial[];
  refetch: () => void;
  isLoading: boolean;
}

const TestimonialManager: React.FC<TestimonialManagerProps> = ({ testimonials, refetch, isLoading }) => {

  const handleDelete = async (testimonialId: string) => {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', testimonialId);

    if (error) {
      showError("Erro ao deletar depoimento: " + error.message);
      throw error;
    } else {
      showSuccess("Depoimento deletado com sucesso!");
      refetch();
    }
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
        <CardTitle>Meus Depoimentos ({testimonials.length})</CardTitle>
        <AddTestimonialDialog refetch={refetch} />
      </CardHeader>
      <CardContent className="space-y-4">
        {testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Você ainda não tem depoimentos. Adicione alguns para exibir na sua página.
          </p>
        ) : (
          <div className="space-y-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="border rounded-lg p-4 flex justify-between items-start bg-background shadow-sm">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground italic mt-1">"{testimonial.content}"</p>
                  </div>
                </div>
                <div className="flex space-x-1 flex-shrink-0">
                    <EditTestimonialDialog testimonial={testimonial} refetch={refetch} />
                    <DeleteConfirmationDialog
                      onConfirm={() => handleDelete(testimonial.id)}
                      title="Excluir Depoimento"
                      description={`Tem certeza que deseja excluir o depoimento de "${testimonial.author}"? Esta ação é irreversível.`}
                      trigger={
                        <Button variant="ghost" size="icon" title="Deletar" className="flex-shrink-0">
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      }
                    />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestimonialManager;
import React, { useState, useCallback, useEffect } from "react";
import { Section, SectionType } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, PlusCircle, Loader2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { arrayMoveImmutable } from 'array-move';
import DndProviderWrapper from "./DndProvider";
import DraggableSectionItem from "./DraggableSectionItem";
import AddSectionDialog from "./AddSectionDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog"; // Importando

interface SectionManagerProps {
  sections: Section[];
  refetch: () => void;
  isLoading: boolean;
}

const SectionManager: React.FC<SectionManagerProps> = ({ sections, refetch, isLoading }) => {
  const [localSections, setLocalSections] = useState<Section[]>(sections);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalSections(sections);
    setIsDirty(false);
  }, [sections]);

  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalSections((prevSections: Section[]) => {
      const newSections = arrayMoveImmutable(prevSections, dragIndex, hoverIndex);
      setIsDirty(true);
      return newSections;
    });
  }, []);

  const handleSaveOrder = async () => {
    if (!isDirty) return;

    const updates = localSections.map((section, index) => ({
      ...section,
      order_index: index,
    }));

    const { error } = await supabase
      .from('sections')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      showError("Erro ao salvar a ordem das seções: " + error.message);
    } else {
      showSuccess("Ordem das seções salva com sucesso!");
      setIsDirty(false);
      refetch();
    }
  };

  const handleDelete = async (sectionId: string) => {
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', sectionId);

    if (error) {
      showError("Erro ao deletar seção: " + error.message);
    } else {
      showSuccess("Seção deletada com sucesso!");
      refetch();
    }
  };

  const handleToggleActive = async (section: Section) => {
    const { error } = await supabase
      .from('sections')
      .update({ is_active: !section.is_active })
      .eq('id', section.id);

    if (error) {
      showError("Erro ao atualizar status: " + error.message);
    } else {
      showSuccess(`Seção ${section.is_active ? 'desativada' : 'ativada'} com sucesso!`);
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
        <CardTitle>Gerenciar Seções ({localSections.length})</CardTitle>
        <div className="flex space-x-2">
          <Button 
            onClick={handleSaveOrder} 
            disabled={!isDirty}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Ordem
          </Button>
          <AddSectionDialog refetch={refetch} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {localSections.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Você ainda não tem seções. Adicione uma para começar a organizar seu conteúdo.
          </p>
        ) : (
          <div className="space-y-2">
            <DndProviderWrapper>
              {localSections.map((section, index) => (
                <DraggableSectionItem
                  key={section.id}
                  index={index}
                  section={section}
                  moveSection={moveSection}
                  handleToggleActive={handleToggleActive}
                  handleDelete={handleDelete}
                  refetch={refetch}
                />
              ))}
            </DndProviderWrapper>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionManager;
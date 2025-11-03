import React, { useState, useCallback, useEffect } from "react";
import { Link } from "@/types/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import DraggableLinkItem from "./DraggableLinkItem";
import { arrayMoveImmutable } from 'array-move';
import { Section } from "@/types/content";
import { useQuery } from "@tanstack/react-query";
import AddLinkDialog from "./AddLinkDialog"; // We will keep this for now, but it needs to be updated to handle section selection

// New type for links within a section, including order_index
interface SectionLinkItem extends Link {
  order_index: number;
}

interface LinkManagerProps {
  section: Section;
  refetchLinks: () => void;
}

// Fetch links specific to this section
const fetchSectionLinks = async (sectionId: string): Promise<SectionLinkItem[]> => {
  const { data, error } = await supabase
    .from("section_links")
    .select(`
      order_index,
      link:link_id (id, user_id, title, url, is_active, created_at)
    `)
    .eq("section_id", sectionId)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Flatten the structure
  return data.map(item => ({
    ...item.link,
    order_index: item.order_index,
  })) as SectionLinkItem[];
};


const LinkManager: React.FC<LinkManagerProps> = ({ section, refetchLinks }) => {
  const { data: links, isLoading, refetch: refetchLocalLinks } = useQuery<SectionLinkItem[]>({
    queryKey: ["sectionLinks", section.id],
    queryFn: () => fetchSectionLinks(section.id),
  });

  const [localLinks, setLocalLinks] = useState<SectionLinkItem[]>(links || []);
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state when external links prop changes (e.g., after fetch/add/edit)
  useEffect(() => {
    if (links) {
      setLocalLinks(links);
      setIsDirty(false);
    }
  }, [links]);

  const moveLink = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalLinks((prevLinks: SectionLinkItem[]) => {
      const newLinks = arrayMoveImmutable(prevLinks, dragIndex, hoverIndex);
      setIsDirty(true);
      return newLinks;
    });
  }, []);

  const handleSaveOrder = async () => {
    if (!isDirty || !localLinks) return;

    const updates = localLinks.map((link, index) => ({
      section_id: section.id,
      link_id: link.id,
      order_index: index,
    }));

    // Perform batch update/upsert on section_links table
    const { error } = await supabase
      .from('section_links')
      .upsert(updates, { onConflict: 'section_id, link_id' });

    if (error) {
      showError("Erro ao salvar a ordem dos links: " + error.message);
    } else {
      showSuccess("Ordem dos links salva com sucesso!");
      setIsDirty(false);
      refetchLocalLinks(); // Refetch local links to ensure consistency
      refetchLinks(); // Refetch global links/sections data if needed
    }
  };

  const handleDelete = async (linkId: string) => {
    // Delete only the entry in the section_links table
    const { error } = await supabase
      .from('section_links')
      .delete()
      .eq('section_id', section.id)
      .eq('link_id', linkId);

    if (error) {
      showError("Erro ao remover link da seção: " + error.message);
    } else {
      showSuccess("Link removido da seção com sucesso!");
      refetchLocalLinks();
      refetchLinks();
    }
  };

  const handleToggleActive = async (link: Link) => {
    // Toggle active status on the main links table
    const { error } = await supabase
      .from('links')
      .update({ is_active: !link.is_active })
      .eq('id', link.id);

    if (error) {
      showError("Erro ao atualizar status: " + error.message);
    } else {
      showSuccess(`Link ${link.is_active ? 'desativado' : 'ativado'} com sucesso!`);
      refetchLocalLinks();
      refetchLinks();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Links da Seção: {section.order_index + 1} ({localLinks.length})</CardTitle>
        <Button 
          onClick={handleSaveOrder} 
          disabled={!isDirty}
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Ordem
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {localLinks.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Esta seção de links está vazia. Adicione links usando o botão "Adicionar Link" e selecione esta seção.
          </p>
        ) : (
          <div className="space-y-2">
            {localLinks.map((link, index) => (
              <DraggableLinkItem
                key={link.id}
                index={index}
                link={link}
                moveLink={moveLink}
                handleToggleActive={handleToggleActive}
                handleDelete={handleDelete}
                refetch={refetchLocalLinks}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkManager;
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/types/content";

const fetchLinkSections = async (): Promise<Section[]> => {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("type", "links")
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data as Section[];
};

export function useLinkSections() {
  return useQuery<Section[]>({
    queryKey: ["linkSections"],
    queryFn: fetchLinkSections,
  });
}
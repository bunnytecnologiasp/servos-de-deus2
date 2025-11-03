export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  is_active: boolean;
  created_at: string;
}

export interface SectionLink {
  link_id: string;
  section_id: string;
  order_index: number;
}
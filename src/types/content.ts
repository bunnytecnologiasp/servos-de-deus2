export type SectionType = 'links' | 'photo_slider' | 'photo_grid' | 'testimonials' | 'video' | 'map' | 'info_card';

export interface Section {
  id: string;
  user_id: string;
  type: SectionType;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  caption: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  user_id: string;
  author: string;
  content: string;
  created_at: string;
}
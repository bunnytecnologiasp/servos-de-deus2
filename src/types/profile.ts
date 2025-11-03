export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  updated_at: string | null;
  store_hours: string | null;
  address: string | null;
  sales_pitch: string | null;
}

export interface PublicProfile {
  id: string; // Adicionando o ID do usuário para filtrar conteúdo público
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  store_hours: string | null;
  address: string | null;
  sales_pitch: string | null;
}
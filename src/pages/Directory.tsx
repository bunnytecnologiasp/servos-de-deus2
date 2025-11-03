import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicProfile } from '@/types/profile';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import DirectoryCard from '@/components/DirectoryCard';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Fetch profiles that are visible in the directory and have a username set
const fetchDirectoryProfiles = async (): Promise<PublicProfile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, bio, avatar_url, address, username, is_visible_in_directory")
    .eq("is_visible_in_directory", true)
    .not("username", "is", null); // Ensure username is set

  if (error) {
    throw new Error(error.message);
  }
  return data as PublicProfile[];
};

const Directory: React.FC = () => {
  const { data: profiles, isLoading, isError } = useQuery<PublicProfile[]>({
    queryKey: ["directoryProfiles"],
    queryFn: fetchDirectoryProfiles,
  });
  
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredProfiles = profiles?.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").toLowerCase();
    const username = profile.username?.toLowerCase() || '';
    const bio = profile.bio?.toLowerCase() || '';
    const address = profile.address?.toLowerCase() || '';

    return fullName.includes(searchLower) || 
           username.includes(searchLower) || 
           bio.includes(searchLower) ||
           address.includes(searchLower);
  }) || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <LandingHeader />
      
      <main className="flex-1 py-16">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-lp-navy dark:text-white mb-4 text-center">
            Diretório de Profissionais Cristãos
          </h1>
          <p className="text-lg text-muted-foreground mb-10 text-center">
            Encontre pastores, líderes e profissionais que usam a plataforma Servos de Deus.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, ministério ou localidade..."
              className="w-full h-12 pl-10 text-base rounded-full shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading && (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-lp-teal" />
            </div>
          )}

          {isError && (
            <p className="text-center text-red-500">Erro ao carregar o diretório. Tente novamente mais tarde.</p>
          )}

          {!isLoading && filteredProfiles.length === 0 && (
            <p className="text-center text-muted-foreground">Nenhum perfil encontrado que corresponda à sua busca.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <DirectoryCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default Directory;
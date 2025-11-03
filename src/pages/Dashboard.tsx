import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Home } from "lucide-react";
import { Link as RouterLink } from "react-router-dom"; // Importando Link do router
import { Link } from "@/types/link";
import { Profile } from "@/types/profile";
import { Section, Photo, Testimonial } from "@/types/content";
import { useQuery } from "@tanstack/react-query";
import LinkManager from "@/components/LinkManager";
import AddLinkDialog from "@/components/AddLinkDialog";
import DndProviderWrapper from "@/components/DndProvider";
import ProfileSettingsForm from "@/components/ProfileSettingsForm";
import SectionManager from "@/components/SectionManager";
import PhotoManager from "@/components/PhotoManager"; // Keep PhotoManager for global photo library management
import TestimonialManager from "@/components/TestimonialManager";
import PhotoSectionManager from "@/components/PhotoSectionManager"; // New component
import ContentUrlForm from "@/components/ContentUrlForm"; // Novo componente
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Fetching Links (Global list for AddLinkDialog)
const fetchAllUserLinks = async (): Promise<Link[]> => {
  const { data, error } = await supabase
    .from("links")
    .select("*");

  if (error) {
    throw new Error(error.message);
  }
  return data as Link[];
};

// Fetching Sections
const fetchUserSections = async (): Promise<(Section & { content_url: string | null })[]> => {
  const { data, error } = await supabase
    .from("sections")
    .select("*, content_url") // Incluindo content_url
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data as (Section & { content_url: string | null })[];
};

// Fetching Photos (Global list for PhotoManager)
const fetchUserPhotos = async (): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as Photo[];
};

// Fetching Testimonials
const fetchUserTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as Testimonial[];
};

// Novo tipo de retorno que inclui o email
interface DashboardProfile extends Profile {
    email: string;
}

// Fetching Profile
const fetchUserProfile = async (): Promise<DashboardProfile | null> => {
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;
  
  if (!user) return null;

  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means 'no rows found'
    throw new Error(error.message);
  }
  
  // Combina os dados do perfil com o email do usuário
  return {
      ...(profileData as Profile),
      email: user.email || "Email não disponível",
  } as DashboardProfile;
};

const Dashboard = () => {
  // We still fetch all links globally, mainly to trigger refetching in LinkManager
  const { data: allLinks, isLoading: isLoadingAllLinks, error: errorAllLinks, refetch: refetchAllLinks } = useQuery<Link[]>({
    queryKey: ["allUserLinks"],
    queryFn: fetchAllUserLinks,
  });

  const { data: sections, isLoading: isLoadingSections, error: errorSections, refetch: refetchSections } = useQuery<(Section & { content_url: string | null })[]>({
    queryKey: ["userSections"],
    queryFn: fetchUserSections,
  });

  // Global photo list for the Photo Library tab
  const { data: photos, isLoading: isLoadingPhotos, error: errorPhotos, refetch: refetchPhotos } = useQuery<Photo[]>({
    queryKey: ["allUserPhotos"],
    queryFn: fetchUserPhotos,
  });

  const { data: testimonials, isLoading: isLoadingTestimonials, error: errorTestimonials, refetch: refetchTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["userTestimonials"],
    queryFn: fetchUserTestimonials,
  });

  const { data: profile, isLoading: isLoadingProfile, error: errorProfile, refetch: refetchProfile } = useQuery<DashboardProfile | null>({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isLoading = isLoadingAllLinks || isLoadingProfile || isLoadingSections || isLoadingPhotos || isLoadingTestimonials;
  const error = errorAllLinks || errorProfile || errorSections || errorPhotos || errorTestimonials;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Erro ao carregar dados</h1>
        <p className="text-muted-foreground">Detalhes: {error.message}</p>
        <Button onClick={() => { refetchAllLinks(); refetchProfile(); refetchSections(); refetchPhotos(); refetchTestimonials(); }} className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }
  
  const linkSections = sections?.filter(s => s.type === 'links') || [];
  const photoSections = sections?.filter(s => s.type === 'photo_slider' || s.type === 'photo_grid') || [];
  const contentUrlSections = sections?.filter(s => s.type === 'video' || s.type === 'map') || [];
  const testimonialSections = sections?.filter(s => s.type === 'testimonials') || [];
  
  // Determine the public URL based on the user's username
  const publicUrl = profile?.username ? `/u/${profile.username}` : '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel de Controle</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline" className="flex items-center" disabled={!profile?.username}>
            <RouterLink to={publicUrl} target="_blank">
              <Home className="h-4 w-4 mr-2" />
              Ver Página Pública
            </RouterLink>
          </Button>
          <Button variant="outline" onClick={handleLogout} className="flex items-center">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sections">Seções</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sections" className="mt-6">
            <SectionManager 
              sections={sections || []} 
              refetch={refetchSections} 
              isLoading={isLoadingSections}
            />
            
            {/* Content URL Section Management (Video/Map) */}
            {contentUrlSections.length > 0 && (
                <div className="mt-8 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Gerenciar Conteúdo de Vídeo/Mapa</h2>
                    {contentUrlSections.map((section) => (
                        <Card key={section.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {section.type === 'video' ? 'Seção de Vídeo' : 'Seção de Mapa'} (Ordem: {section.order_index + 1})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ContentUrlForm section={section} refetch={refetchSections} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Photo Section Management */}
            {photoSections.length > 0 && (
                <div className="mt-8 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Gerenciar Conteúdo das Seções de Fotos</h2>
                    <DndProviderWrapper>
                        {photoSections.map((section) => (
                            <PhotoSectionManager 
                                key={section.id} 
                                section={section} 
                                refetchSections={refetchSections} 
                            />
                        ))}
                    </DndProviderWrapper>
                </div>
            )}

            {/* Testimonial Section Management (If we decide to manage testimonials per section later, this is the spot) */}
            {/* For now, testimonials are managed globally in the 'testimonials' tab */}
          </TabsContent>

          <TabsContent value="links" className="mt-6">
            <div className="flex justify-end mb-4">
              <AddLinkDialog refetch={() => { refetchAllLinks(); refetchSections(); }} />
            </div>
            
            {linkSections.length === 0 ? (
              <Card>
                <CardHeader><CardTitle>Gerenciamento de Links</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-4">
                    Crie uma seção do tipo "Links (Botões)" na aba "Seções" para começar a adicionar links.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <DndProviderWrapper>
                <div className="space-y-6">
                  {linkSections.map((section) => (
                    <LinkManager 
                      key={section.id} 
                      section={section} 
                      refetchLinks={() => { refetchAllLinks(); refetchSections(); }} 
                    />
                  ))}
                </div>
              </DndProviderWrapper>
            )}
          </TabsContent>
          
          <TabsContent value="photos" className="mt-6">
            <PhotoManager 
              photos={photos || []} 
              refetch={refetchPhotos} 
              isLoading={isLoadingPhotos}
            />
          </TabsContent>

          <TabsContent value="testimonials" className="mt-6">
            <TestimonialManager 
              testimonials={testimonials || []} 
              refetch={refetchTestimonials} 
              isLoading={isLoadingTestimonials}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ProfileSettingsForm initialProfile={profile} refetch={refetchProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
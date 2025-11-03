import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/types/link";
import { PublicProfile } from "@/types/profile";
import { Section, SectionType, Photo, Testimonial } from "@/types/content";
import LinkButton from "@/components/LinkButton";
import PhotoSlider from "@/components/PhotoSlider";
import PhotoGrid from "@/components/PhotoGrid";
import TestimonialsSection from "@/components/TestimonialsSection";
import InfoCardSection from "@/components/InfoCardSection";
import VideoSection from "@/components/VideoSection";
import MapSection from "@/components/MapSection";
import InstallPwaButton from "@/components/InstallPwaButton";
import { Loader2, User } from "lucide-react";
import { useParams } from "react-router-dom"; // Importando useParams

// --- Data Fetching Utilities ---

// Fetching Public Profile by Username
const fetchPublicProfileByUsername = async (username: string): Promise<PublicProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, bio, avatar_url, store_hours, address, sales_pitch, username")
    .eq("username", username)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data as PublicProfile | null;
};

// Fetching Sections (Agora filtrando pelo user_id fornecido)
const fetchSections = async (userId: string): Promise<(Section & { content_url: string | null })[]> => {
  const { data, error } = await supabase
    .from("sections")
    .select("*, content_url")
    .eq("user_id", userId) // Filtrar pelo ID do usuário
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data as (Section & { content_url: string | null })[];
};

// Fetching Links (All active links, ordered by section)
interface SectionLinkItem extends Link {
  order_index: number;
  section_id: string;
}

const fetchAllActiveLinksGrouped = async (sectionIds: string[]): Promise<SectionLinkItem[]> => {
  if (sectionIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from("section_links")
    .select(`
      section_id,
      order_index,
      link:link_id (id, user_id, title, url, is_active, text_color, background_color, created_at)
    `)
    .in("section_id", sectionIds)
    .eq("link.is_active", true);

  if (error) {
    throw new Error(error.message);
  }
  
  return data.map(item => ({
    ...item.link,
    section_id: item.section_id,
    order_index: item.order_index,
  })) as SectionLinkItem[];
};

// Fetching Photos by Section
interface SectionPhotoItem extends Photo {
  order_index: number;
  section_id: string;
}

const fetchAllActivePhotosGrouped = async (sectionIds: string[]): Promise<SectionPhotoItem[]> => {
  if (sectionIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from("section_photos")
    .select(`
      section_id,
      order_index,
      photo:photo_id (id, user_id, url, caption, created_at)
    `)
    .in("section_id", sectionIds)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  
  return data.map(item => ({
    ...item.photo,
    section_id: item.section_id,
    order_index: item.order_index,
  })) as SectionPhotoItem[];
};


// Fetching Testimonials
const fetchTestimonials = async (userId: string): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as Testimonial[];
};

// --- Main Component ---

const PublicPage = () => {
  const { username } = useParams<{ username: string }>();

  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile } = useQuery<PublicProfile | null>({
    queryKey: ["publicProfile", username],
    queryFn: () => fetchPublicProfileByUsername(username!),
    enabled: !!username,
  });
  
  const userId = profile?.id;

  const { data: sections, isLoading: isLoadingSections, isError: isErrorSections } = useQuery<(Section & { content_url: string | null })[]>({
    queryKey: ["publicSections", userId],
    queryFn: () => fetchSections(userId!),
    enabled: !!userId,
  });
  
  const activeLinkSectionIds = sections?.filter(s => s.type === 'links').map(s => s.id) || [];
  const activePhotoSectionIds = sections?.filter(s => s.type === 'photo_slider' || s.type === 'photo_grid').map(s => s.id) || [];
  const activeTestimonialSectionIds = sections?.filter(s => s.type === 'testimonials').map(s => s.id) || [];


  const { data: allSectionLinks, isLoading: isLoadingLinks, isError: isErrorLinks } = useQuery<SectionLinkItem[]>({
    queryKey: ["publicLinksGrouped", activeLinkSectionIds],
    queryFn: () => fetchAllActiveLinksGrouped(activeLinkSectionIds),
    enabled: activeLinkSectionIds.length > 0,
  });
  
  const { data: allSectionPhotos, isLoading: isLoadingPhotos, isError: isErrorPhotos } = useQuery<SectionPhotoItem[]>({
    queryKey: ["publicPhotosGrouped", activePhotoSectionIds],
    queryFn: () => fetchAllActivePhotosGrouped(activePhotoSectionIds),
    enabled: activePhotoSectionIds.length > 0,
  });


  const { data: testimonials, isLoading: isLoadingTestimonials, isError: isErrorTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["publicTestimonials", userId],
    queryFn: () => fetchTestimonials(userId!),
    enabled: !!userId && activeTestimonialSectionIds.length > 0,
  });

  const isLoading = isLoadingProfile || isLoadingSections || isLoadingLinks || isLoadingPhotos || isLoadingTestimonials;
  const isError = isErrorProfile || isErrorSections || isErrorLinks || isErrorPhotos || isErrorTestimonials;

  if (!username) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600">Erro de Rota</h1>
                <p className="text-gray-500">Nome de usuário não fornecido na URL.</p>
            </div>
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Perfil Não Encontrado</h1>
          <p className="text-gray-500">O usuário @{username} não existe ou não tem um perfil público configurado.</p>
        </div>
      </div>
    );
  }
  
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");

  // Helper to render content based on section type
  const renderSectionContent = (section: Section & { content_url: string | null }) => {
    switch (section.type) {
      case 'links':
        // Filter links belonging to this specific section, and sort them by order_index
        const sectionLinks = (allSectionLinks || [])
          .filter(link => link.section_id === section.id)
          .sort((a, b) => a.order_index - b.order_index);
          
        if (sectionLinks.length === 0) return null;

        return (
          <div className="space-y-4">
            {sectionLinks.map((link) => (
              <LinkButton key={link.id} link={link} />
            ))}
          </div>
        );
      case 'photo_slider':
      case 'photo_grid':
        // Filter photos belonging to this specific section, and sort them by order_index
        const sectionPhotos = (allSectionPhotos || [])
          .filter(photo => photo.section_id === section.id)
          .sort((a, b) => a.order_index - b.order_index);
          
        if (sectionPhotos.length === 0) return null;

        if (section.type === 'photo_slider') {
            return <PhotoSlider photos={sectionPhotos} />;
        } else {
            return <PhotoGrid photos={sectionPhotos} />;
        }
      case 'testimonials':
        // Since testimonials are global per user, we display all of them if a testimonial section exists.
        if (!testimonials || testimonials.length === 0) return null;
        return <TestimonialsSection testimonials={testimonials} />;
      case 'video':
        if (!section.content_url) return null;
        return <VideoSection videoUrl={section.content_url} />;
      case 'map':
        if (!section.content_url) return null;
        return <MapSection mapEmbedUrl={section.content_url} />;
      case 'info_card':
        // Render the InfoCardSection using the profile data
        return <InfoCardSection profile={profile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg px-4">
        
        {/* Profile Section (Always at the top) */}
        <div className="flex flex-col items-center mb-8">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={fullName} 
              className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-foreground">@{profile.username}</h1>
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-1 text-center">{profile.bio}</p>
          )}
        </div>

        {/* Dynamic Content Sections */}
        <div className="space-y-8">
          {sections && sections.map((section) => (
            <div key={section.id} className="w-full">
              {renderSectionContent(section)}
            </div>
          ))}
          
          {/* Fallback: If no sections are defined, show nothing */}
          {(!sections || sections.length === 0) && (
            <p className="text-center text-muted-foreground">Nenhum conteúdo ativo encontrado.</p>
          )}
        </div>
      </div>
      
      {/* PWA Install Button */}
      <InstallPwaButton />

      <div className="mt-auto pt-10">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default PublicPage;
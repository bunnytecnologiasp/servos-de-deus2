import React from 'react';
import { Card } from '@/components/ui/card';

interface VideoSectionProps {
  videoUrl: string;
}

// Função simples para tentar extrair o ID do YouTube ou usar a URL diretamente
const getEmbedUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = '';
      if (urlObj.searchParams.get('v')) {
        videoId = urlObj.searchParams.get('v')!;
      } else if (urlObj.pathname.length > 1) {
        videoId = urlObj.pathname.substring(1);
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Vimeo (Assume que a URL já é o link de incorporação ou o ID está no path)
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop();
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // Se for uma URL direta (ex: MP4) ou um link de incorporação completo
    return url;
  } catch (e) {
    // Se a URL for inválida, retorna a URL original (pode falhar no iframe)
    return url;
  }
};

const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl }) => {
  if (!videoUrl) return null;
  
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <Card className="p-0 overflow-hidden shadow-xl">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title="Embedded Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </Card>
  );
};

export default VideoSection;
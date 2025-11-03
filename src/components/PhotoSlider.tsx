import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Photo } from '@/types/content';
import { Card } from '@/components/ui/card';

interface PhotoSliderProps {
  photos: Photo[];
}

const PhotoSlider: React.FC<PhotoSliderProps> = ({ photos }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  if (photos.length === 0) return null;

  // Função para avançar o slide
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Configuração do Autoplay
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(scrollNext, 3000); // Avança a cada 3000ms (3 segundos)

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, [emblaApi, scrollNext]);

  return (
    <Card className="p-0 overflow-hidden shadow-xl">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {photos.map((photo) => (
            <div className="embla__slide flex-shrink-0 w-full relative" key={photo.id}>
              <img
                src={photo.url}
                alt={photo.caption || "Foto do usuário"}
                className="w-full h-64 object-cover"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white text-sm">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PhotoSlider;
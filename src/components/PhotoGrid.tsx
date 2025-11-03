import React from 'react';
import { Photo } from '@/types/content';
import { Card } from '@/components/ui/card';
import PhotoViewerDialog from './PhotoViewerDialog';

interface PhotoGridProps {
  photos: Photo[];
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos }) => {
  const displayPhotos = photos.slice(0, 6);

  if (displayPhotos.length === 0) return null;

  return (
    <Card className="p-4 shadow-xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {displayPhotos.map((photo) => (
          <PhotoViewerDialog
            key={photo.id}
            photoUrl={photo.url}
            altText={photo.caption || "Galeria de fotos"}
            trigger={
              <div className="aspect-square overflow-hidden rounded-lg cursor-pointer">
                <img
                  src={photo.url}
                  alt={photo.caption || "Galeria de fotos"}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
            }
          />
        ))}
      </div>
    </Card>
  );
};

export default PhotoGrid;
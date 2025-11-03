import React from 'react';
import { Card } from '@/components/ui/card';

interface MapSectionProps {
  mapEmbedUrl: string;
}

const MapSection: React.FC<MapSectionProps> = ({ mapEmbedUrl }) => {
  if (!mapEmbedUrl) return null;

  return (
    <Card className="p-0 overflow-hidden shadow-xl">
      <div className="relative w-full" style={{ height: '300px' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={mapEmbedUrl}
          title="Embedded Map"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </Card>
  );
};

export default MapSection;
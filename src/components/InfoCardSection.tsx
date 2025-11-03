import React from 'react';
import { PublicProfile } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin, Megaphone } from 'lucide-react';

interface InfoCardSectionProps {
  profile: PublicProfile;
}

const InfoCardSection: React.FC<InfoCardSectionProps> = ({ profile }) => {
  const hasContent = profile.store_hours || profile.address || profile.sales_pitch;

  if (!hasContent) return null;

  return (
    <Card className="p-4 shadow-xl bg-white dark:bg-gray-800">
      <CardContent className="p-0 space-y-4">
        {profile.sales_pitch && (
          <div className="text-center border-b pb-3 border-muted-foreground/20">
            <p className="text-lg font-semibold text-primary italic">
              {profile.sales_pitch}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {profile.store_hours && (
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-secondary-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Horário de Funcionamento:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.store_hours}</p>
              </div>
            </div>
          )}

          {profile.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-secondary-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Endereço:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.address}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoCardSection;
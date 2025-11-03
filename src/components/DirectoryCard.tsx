import React from 'react';
import { PublicProfile } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/card';
import { User, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DirectoryCardProps {
  profile: PublicProfile;
}

const DirectoryCard: React.FC<DirectoryCardProps> = ({ profile }) => {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  const displayUsername = profile.username || "Perfil sem nome de usuário";

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col justify-between">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={fullName} 
              className="w-16 h-16 rounded-full object-cover border-2 border-lp-teal"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-lp-navy">{fullName || displayUsername}</h3>
            <p className="text-sm text-muted-foreground">@{displayUsername}</p>
          </div>
        </div>
        
        {profile.bio && (
          <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
        )}

        {profile.address && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{profile.address}</span>
          </div>
        )}
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild className="w-full bg-lp-teal hover:bg-lp-teal-light">
          <Link to={`/u/${profile.username}`}>
            Ver Perfil
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default DirectoryCard;
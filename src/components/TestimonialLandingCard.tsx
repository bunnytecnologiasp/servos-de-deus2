import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialLandingCardProps {
  author: string;
  role: string;
  content: string;
  avatarUrl: string;
}

const TestimonialLandingCard: React.FC<TestimonialLandingCardProps> = ({ author, role, content, avatarUrl }) => {
  return (
    <Card className="p-6 h-full shadow-lg border-none bg-white">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center space-x-4">
          <img 
            src={avatarUrl} 
            alt={author} 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-bold text-lp-navy">{author}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
        <p className="text-sm italic text-lp-navy leading-relaxed">
          "{content}"
        </p>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialLandingCard;
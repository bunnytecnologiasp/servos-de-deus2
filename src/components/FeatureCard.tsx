import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <Card className="p-6 h-full border-none shadow-lg transition-shadow hover:shadow-xl">
      <CardContent className="p-0 space-y-3">
        <div className="w-10 h-10 rounded-full bg-lp-teal/10 flex items-center justify-center mb-3">
          <Icon className="h-5 w-5 text-lp-teal" />
        </div>
        <h3 className="text-lg font-bold text-lp-navy">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
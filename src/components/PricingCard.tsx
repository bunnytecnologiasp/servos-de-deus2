import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  title: string;
  price: string;
  subtitle: string;
  features: { text: string; included: boolean }[];
  isPopular?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  subtitle,
  features,
  isPopular = false,
  buttonText,
  buttonVariant,
}) => {
  return (
    <Card 
      className={cn(
        "flex flex-col border-2 h-full",
        isPopular ? "border-lp-teal shadow-2xl" : "border-gray-200"
      )}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-lp-teal text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            Mais Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center pt-8 pb-4">
        <CardTitle className="text-xl font-bold text-lp-navy">{title}</CardTitle>
        <p className="text-4xl font-extrabold text-lp-teal mt-2">
          {price}
          <span className="text-base font-medium text-muted-foreground">/mês</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </CardHeader>
      <CardContent className="flex-1 p-6 pt-0">
        <ul className="space-y-3 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-lp-teal flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
              <span className={cn(feature.included ? "text-lp-navy" : "text-gray-500 line-through")}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="p-6 pt-0">
        <Button 
          className={cn(
            "w-full rounded-full",
            buttonVariant === 'default' ? "bg-lp-teal hover:bg-lp-teal-light text-white" : "border-lp-teal text-lp-teal hover:bg-lp-teal/10"
          )}
          variant={buttonVariant}
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};

export default PricingCard;
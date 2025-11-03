import React from 'react';
import { Testimonial } from '@/types/content';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <Card className="h-full flex flex-col justify-between bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="pb-2">
        <Quote className="h-6 w-6 text-primary mb-2" />
        <CardTitle className="text-lg font-normal italic leading-relaxed">
          "{testimonial.content}"
        </CardTitle>
      </CardHeader>
      <CardFooter className="pt-4">
        <p className="text-sm font-semibold text-primary">- {testimonial.author}</p>
      </CardFooter>
    </Card>
  );
};

export default TestimonialCard;
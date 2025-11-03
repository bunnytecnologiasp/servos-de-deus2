import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/types/link";

interface LinkButtonProps {
  link: Link;
}

const LinkButton: React.FC<LinkButtonProps> = ({ link }) => {
  return (
    <Button
      asChild
      variant="ghost" // Usando variant ghost para minimizar conflitos de cor padrão do shadcn/ui
      className="w-full h-14 text-lg font-semibold rounded-xl shadow-md transition-transform transform hover:scale-[1.02] border-2"
      // Removendo style daqui, será aplicado diretamente no <a>
    >
      <a 
        href={link.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{ 
          backgroundColor: link.background_color, 
          color: link.text_color,
          borderColor: '#d3bd75',
        }}
      >
        <LinkIcon className="mr-2 h-5 w-5" />
        {link.title}
      </a>
    </Button>
  );
};

export default LinkButton;
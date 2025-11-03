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
      className="w-full h-14 text-lg font-semibold rounded-xl shadow-md transition-transform transform hover:scale-[1.02] text-white border-2" // Adicionando border-2
      style={{ 
        backgroundColor: '#3e555a', 
        borderColor: '#d3bd75', // Cor da borda
      }}
    >
      <a 
        href={link.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center justify-center hover:bg-opacity-90 transition-opacity"
      >
        <LinkIcon className="mr-2 h-5 w-5" />
        {link.title}
      </a>
    </Button>
  );
};

export default LinkButton;
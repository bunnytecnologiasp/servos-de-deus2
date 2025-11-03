import { Link } from "react-router-dom";

export const MadeWithDyad = () => {
  return (
    <div className="p-4 text-center flex flex-col items-center space-y-1">
      <span
        className="text-sm text-gray-500 dark:text-gray-400"
      >
        ElfJoplin - 2025
      </span>
      <Link 
        to="/login" 
        className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-500 transition-colors"
      >
        Acesso Restrito
      </Link>
    </div>
  );
};
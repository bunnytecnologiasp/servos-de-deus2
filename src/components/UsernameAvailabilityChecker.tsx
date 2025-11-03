import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Debounce hook simples para evitar muitas requisições
const useDebounce = (callback: (value: string) => void, delay: number) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback((value: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      callback(value);
    }, delay);
    setTimeoutId(newTimeoutId);
  }, [callback, delay, timeoutId]);
};

const usernameRegex = /^[a-z0-9_-]{3,20}$/;

const UsernameAvailabilityChecker: React.FC = () => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');

  const checkUsernameAvailability = async (value: string) => {
    if (!value || value.length < 3 || !usernameRegex.test(value)) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');
    
    // Consulta ao Supabase para verificar se o username existe
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', value)
      .limit(1);

    if (error) {
      console.error("Erro ao verificar username:", error);
      setStatus('unavailable'); // Trata erro como indisponível por segurança
      return;
    }

    if (data && data.length > 0) {
      setStatus('unavailable');
    } else {
      setStatus('available');
    }
  };

  const debouncedCheck = useDebounce(checkUsernameAvailability, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    if (value.length >= 3 && usernameRegex.test(value)) {
      debouncedCheck(value);
    } else {
      setStatus('invalid');
    }
  };
  
  const isAvailable = status === 'available';
  const isUnavailable = status === 'unavailable';
  const isChecking = status === 'checking';
  const isInvalid = status === 'invalid';
  const isValidInput = username.length >= 3 && usernameRegex.test(username);

  return (
    <div className="w-full max-w-md mx-auto sm:mx-0">
      <div className="flex items-center bg-white p-1 rounded-full shadow-xl border border-gray-200">
        <span className="text-sm text-muted-foreground pl-4 pr-2 hidden sm:inline">servosdedeus.com.br/u/</span>
        <Input
          type="text"
          placeholder="seu_nome_unico"
          value={username}
          onChange={handleChange}
          className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base pl-2 sm:pl-0"
        />
        
        <div className="relative pr-2">
          {isChecking && <Loader2 className="h-5 w-5 animate-spin text-gray-500" />}
          {isAvailable && <Check className="h-5 w-5 text-green-500" />}
          {isUnavailable && <X className="h-5 w-5 text-red-500" />}
        </div>
        
        <Button 
          asChild
          className={cn(
            "bg-lp-teal hover:bg-lp-teal-light text-white font-semibold px-6 h-10 rounded-full transition-colors",
            !isAvailable && "opacity-50 cursor-not-allowed"
          )}
          disabled={!isAvailable}
        >
          <Link to={isAvailable ? `/login?username=${username}` : '#'} onClick={(e) => !isAvailable && e.preventDefault()}>
            Criar <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
      
      <div className="mt-3 text-center sm:text-left">
        {isAvailable && (
          <p className="text-sm text-green-600 flex items-center font-medium">
            <Check className="h-4 w-4 mr-1" /> Nome de usuário disponível!
          </p>
        )}
        {isUnavailable && (
          <p className="text-sm text-red-600 flex items-center font-medium">
            <X className="h-4 w-4 mr-1" /> Nome de usuário já está em uso.
          </p>
        )}
        {isInvalid && username.length > 0 && (
          <p className="text-sm text-yellow-600">
            Mínimo 3 caracteres. Use apenas letras minúsculas, números, hífens (-) ou underscores (_).
          </p>
        )}
      </div>
    </div>
  );
};

export default UsernameAvailabilityChecker;
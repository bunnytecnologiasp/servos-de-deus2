import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { Profile } from "@/types/profile"; // Importando o tipo Profile

interface AuthGuardProps {
  children: React.ReactNode;
  isProtected: boolean;
}

// Função auxiliar para buscar o perfil (mantida, mas não usada para redirecionamento de '/')
const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching profile in AuthGuard:", error);
    return null;
  }
  // O retorno é um objeto parcial do tipo Profile, mas contém o campo username
  return data as Profile | null;
};


const AuthGuard: React.FC<AuthGuardProps> = ({ children, isProtected }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    
    const handleAuthChange = async (currentSession: Session | null) => {
      if (!isMounted) return;

      setSession(currentSession);
      const isAuthenticated = !!currentSession;
      const isLoginPage = location.pathname === "/login";

      if (isAuthenticated) {
        if (isLoginPage) {
          // Authenticated user trying to access login -> redirect to dashboard
          navigate("/dashboard", { replace: true });
          return;
        }
        // Se estiver autenticado e não estiver na página de login, permite o acesso.
        // Rotas públicas (como '/') são permitidas.
      } else {
        if (isProtected && !isLoginPage) {
          // Unauthenticated user trying to access protected route -> redirect to login
          navigate("/login", { replace: true });
          return;
        }
      }
      
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        handleAuthChange(currentSession);
      }
    });

    // Check initial session immediately
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthChange(initialSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, isProtected, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
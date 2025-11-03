import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  isProtected: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, isProtected }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setLoading(false);

      const isAuthenticated = !!currentSession;
      const isLoginPage = location.pathname === "/login";

      if (isProtected && !isAuthenticated && !isLoginPage) {
        // If trying to access a protected route without authentication, redirect to login
        navigate("/login", { replace: true });
      } else if (isAuthenticated && isLoginPage) {
        // If authenticated and trying to access login, redirect to dashboard
        navigate("/dashboard", { replace: true });
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
      
      const isAuthenticated = !!initialSession;
      const isLoginPage = location.pathname === "/login";

      if (isProtected && !isAuthenticated && !isLoginPage) {
        navigate("/login", { replace: true });
      } else if (isAuthenticated && isLoginPage) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
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
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#3e555a' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="ELF JOPLIN Logo" 
            className="w-20 h-20 object-contain mb-4"
          />
          <CardTitle className="text-2xl text-center">Acesso ao Painel</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light"
            view="sign_in"
            redirectTo={window.location.origin + "/dashboard"}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Faça login', // Mantendo o link de login
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: '••••••••',
                },
                forgotten_password: {
                  link_text: '', // Mantendo desabilitado
                },
                update_password: {
                  link_text: '', // Mantendo desabilitado
                },
                magic_link: {
                  link_text: '', // Mantendo desabilitado
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Criar Senha',
                  button_label: 'Cadastrar',
                  social_provider_text: 'Cadastrar com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se', // Reativando o link de cadastro
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: '••••••••',
                }
              },
              lang: 'pt-BR',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
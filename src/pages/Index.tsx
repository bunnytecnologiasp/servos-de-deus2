import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <img 
            src="/logo.png" 
            alt="ELF JOPLIN Logo" 
            className="w-20 h-20 object-contain mb-4 mx-auto"
          />
          <CardTitle className="text-3xl font-bold">Elf Joplin Link Hub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Crie sua página de links personalizada e compartilhe seu conteúdo essencial.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/login">Acessar Painel / Login</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Para visualizar um perfil público, use a URL /u/[nome_de_usuario].
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="mt-auto pt-10">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;
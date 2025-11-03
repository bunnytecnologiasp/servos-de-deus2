import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"; // Importando Switch
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Profile } from "@/types/profile";
import { Loader2 } from "lucide-react";
import AvatarUploader from "./AvatarUploader"; // Importando o novo componente

// Regex para garantir que o username seja minúsculo, sem espaços e contenha apenas letras, números, hífens ou underscores.
const usernameRegex = /^[a-z0-9_-]{3,20}$/;

const profileSchema = z.object({
  first_name: z.string().min(1, "O nome é obrigatório."),
  last_name: z.string().optional().nullable(),
  bio: z.string().max(160, "A biografia deve ter no máximo 160 caracteres.").optional().nullable(),
  
  // Novos campos
  store_hours: z.string().max(255, "O horário deve ter no máximo 255 caracteres.").optional().nullable(),
  address: z.string().max(255, "O endereço deve ter no máximo 255 caracteres.").optional().nullable(),
  sales_pitch: z.string().max(500, "O texto de vendas deve ter no máximo 500 caracteres.").optional().nullable(),
  
  // Campo Username
  username: z.string()
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres.")
    .max(20, "O nome de usuário deve ter no máximo 20 caracteres.")
    .regex(usernameRegex, "O nome de usuário deve ser minúsculo, sem espaços, e pode conter apenas letras, números, hífens (-) ou underscores (_).")
    .optional()
    .nullable()
    .transform(e => e === "" ? null : e),
    
  is_visible_in_directory: z.boolean().default(false), // Novo campo
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSettingsFormProps {
  initialProfile: Profile | null;
  refetch: () => void;
}

const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({ initialProfile, refetch }) => {
  
  // Helper function to safely get string value or empty string
  const getSafeValue = (value: string | null | undefined): string => value ?? "";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: getSafeValue(initialProfile?.first_name),
      last_name: getSafeValue(initialProfile?.last_name),
      bio: getSafeValue(initialProfile?.bio),
      store_hours: getSafeValue(initialProfile?.store_hours),
      address: getSafeValue(initialProfile?.address),
      sales_pitch: getSafeValue(initialProfile?.sales_pitch),
      username: getSafeValue(initialProfile?.username),
      is_visible_in_directory: initialProfile?.is_visible_in_directory ?? false, // Novo valor padrão
    },
    mode: "onChange",
  });

  // Reset form when initialProfile data is loaded or changes
  useEffect(() => {
    if (initialProfile) {
      form.reset({
        first_name: getSafeValue(initialProfile.first_name),
        last_name: getSafeValue(initialProfile.last_name),
        bio: getSafeValue(initialProfile.bio),
        store_hours: getSafeValue(initialProfile.store_hours),
        address: getSafeValue(initialProfile.address),
        sales_pitch: getSafeValue(initialProfile.sales_pitch),
        username: getSafeValue(initialProfile.username),
        is_visible_in_directory: initialProfile.is_visible_in_directory ?? false,
      });
    }
  }, [initialProfile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data.user?.id;

    if (!userId) {
      showError("Erro de autenticação: Usuário não encontrado.");
      return;
    }
    
    // 1. Check for username uniqueness if it changed
    if (values.username && values.username !== initialProfile?.username) {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', values.username)
            .neq('id', userId) // Excluir o próprio usuário
            .limit(1);
            
        if (error) {
            showError(`Erro ao verificar nome de usuário: ${error.message}`);
            return;
        }
        
        if (data && data.length > 0) {
            form.setError('username', {
                type: 'manual',
                message: 'Este nome de usuário já está em uso.',
            });
            return;
        }
    }


    // Convert empty strings back to null for optional database fields
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name || null,
      bio: values.bio || null,
      store_hours: values.store_hours || null,
      address: values.address || null,
      sales_pitch: values.sales_pitch || null,
      username: values.username || null,
      is_visible_in_directory: values.is_visible_in_directory, // Salvando novo campo
      updated_at: new Date().toISOString(),
    };

    let error = null;

    if (initialProfile) {
      // UPDATE existing profile
      const result = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", initialProfile.id);
      error = result.error;
    } else {
      // INSERT new profile (if the handle_new_user trigger failed or was missed)
      const result = await supabase
        .from("profiles")
        .insert({ ...payload, id: userId });
      error = result.error;
    }


    if (error) {
      showError(`Erro ao atualizar perfil: ${error.message}`);
    } else {
      showSuccess("Perfil atualizado com sucesso!");
      form.reset(values); // Reset form state to mark it as clean after successful save
      refetch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Avatar Uploader Section */}
        <AvatarUploader profile={initialProfile} refetchProfile={refetch} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            
            <h3 className="text-lg font-semibold pt-4 border-t">Informações da Conta</h3>
            <div className="space-y-4">
                <div className="p-3 border rounded-md bg-muted/50">
                    <FormLabel>Email de Cadastro</FormLabel>
                    <p className="font-medium text-sm">{initialProfile?.email || 'Não disponível'}</p>
                </div>
            </div>

            <h3 className="text-lg font-semibold pt-4 border-t">Identificação Pública</h3>
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário (URL Pública)</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">/u/</span>
                        <Input 
                            placeholder="seu_nome_unico" 
                            {...field} 
                            value={field.value || ""}
                            // Garante que o valor seja minúsculo ao digitar
                            onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                        />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Novo Switch para Visibilidade no Diretório */}
            <FormField
              control={form.control}
              name="is_visible_in_directory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Visível no Diretório</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Permite que seu perfil seja encontrado na página de Diretório (Disponível apenas para planos Intermediário e Premium).
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <h3 className="text-lg font-semibold pt-4 border-t">Informações Básicas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia (Máx. 160 caracteres)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Uma breve descrição sobre você ou seu projeto." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <h3 className="text-lg font-semibold pt-4 border-t">Informações da Loja/Contato</h3>

            <FormField
              control={form.control}
              name="store_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Funcionamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Seg - Sex: 9h às 18h" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rua Exemplo, 123 - Cidade, UF" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sales_pitch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto de Vendas/Chamada (Máx. 500 caracteres)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Um texto curto e persuasivo para seus visitantes." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsForm;
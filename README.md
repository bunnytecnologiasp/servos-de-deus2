# 🔗 Elf Joplin Link - Seu Hub de Links Essenciais

Este é um aplicativo Linktree customizado, construído com React, TypeScript e Tailwind CSS, utilizando o Supabase como backend para autenticação, banco de dados e armazenamento de arquivos.

## 🚀 Visão Geral

O Elf Joplin Link permite que o usuário gerencie dinamicamente uma página pública de links, fotos e depoimentos, organizados em seções customizáveis.

## 🛠️ Stack Tecnológica

*   **Frontend:** React, TypeScript, Vite
*   **Estilização:** Tailwind CSS (com Shadcn/ui)
*   **Roteamento:** React Router DOM
*   **Gerenciamento de Estado/Dados:** React Query
*   **Backend:** Supabase (Auth, Database, Storage)
*   **Deploy:** Docker / Nginx

## ⚙️ Configuração Local

### 1. Pré-requisitos

Certifique-se de ter instalado:

*   Node.js (v20+)
*   npm
*   Docker (opcional, para deploy)

### 2. Configuração do Supabase

Este projeto depende de um backend Supabase.

1.  **Crie um Projeto Supabase:** Obtenha seu `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`.
2.  **Configuração do Cliente:** O arquivo `src/integrations/supabase/client.ts` já está configurado com as chaves do projeto.
3.  **Estrutura do Banco de Dados:** As tabelas e políticas de segurança (RLS) necessárias (`profiles`, `sections`, `links`, `section_links`, `photos`, `section_photos`, `testimonials`) já foram criadas via comandos SQL durante o desenvolvimento.

### 3. Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:8080`.

## 🔒 Autenticação e Acesso

*   **Página Pública:** Acessível em `/`.
*   **Painel de Controle:** Acessível em `/dashboard`.
*   **Login:** Acessível em `/login`.

O cadastro de novos usuários está desabilitado. O acesso ao painel é restrito a usuários criados diretamente no painel do Supabase.

## 📦 Deploy com Docker

Você pode usar o `Dockerfile` e o `nginx.conf` fornecidos para construir uma imagem de produção e implantar em qualquer VPS.

### 1. Construir a Imagem

Na pasta raiz do projeto:

```bash
docker build -t elfjoplin-link .
```

### 2. Executar o Container

O `Dockerfile` configura o Nginx para escutar na porta `3000`. Mapeie esta porta para a porta desejada no seu host (ex: porta 80 ou 443 se estiver usando um proxy reverso).

Para rodar em segundo plano na porta 3000 do seu host:

```bash
docker run -d -p 3000:3000 --name elfjoplin-app elfjoplin-link
```

### 3. Configuração do Nginx (Dentro do Container)

O arquivo `nginx.conf` garante que o Nginx escute na porta 3000 e lide corretamente com o roteamento do React (Single Page Application - SPA) usando `try_files $uri $uri/ /index.html;`.
# Play Prêmios 🏆

Plataforma profissional de sorteios e rifas online.

## 🚀 Tecnologias

*   **Framework**: Next.js 16 (App Router)
*   **Database**: PostgreSQL (via AWS/Supabase/Vercel Postgres)
*   **ORM**: Prisma
*   **Styling**: Tailwind CSS v4
*   **Language**: TypeScript

## 🛠️ Como rodar localmente

1.  Clone o repositório.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure o banco de dados e as variáveis de ambiente no arquivo `.env`:
    ```env
    DATABASE_URL="postgresql://..."
    ```
4.  Gere o cliente Prisma:
    ```bash
    npx prisma generate
    ```
5.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## 📦 Deploy

Para instruções detalhadas de deploy na Vercel, consulte [DEPLOY.md](./DEPLOY.md).

> [!WARNING]
> **Aviso de Segurança**: O painel administrativo (`/admin`) atualmente não possui proteção por senha. Certifique-se de implementar autenticação antes de divulgar a URL de produção ou usar a proteção de deploy da Vercel.

# Deployment Guide - Play Prêmios

## 🚀 Deploy on Vercel

### Prerequisites
1.  A [Vercel](https://vercel.com) account.
2.  A generic PostgreSQL database (e.g. Supabase, Neon, or Vercel Postgres).
    *   **Note**: This project is configured for PostgreSQL. SQLite will **not** work on Vercel because the filesystem is ephemeral.

### Setup Steps
1.  **Import Project**: Push your code to GitHub and import the repository in Vercel.
2.  **Environment Variables**: Add the following environment variables in the Vercel dashboard:

    ```env
    DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
    NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars"
    NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
    ```
    *   `DATABASE_URL`: Your connection string.
    *   `NEXTAUTH_SECRET`: Generate one with `openssl rand -base64 32`.
    *   `NEXTAUTH_URL`: The URL of your deployed app (configure this after the first deployment or use the Vercel preview URL).

3.  **Build Settings**: Use default Next.js settings.
    *   Build Command: `npm run build`
    *   Output Directory: `.next`
    *   Install Command: `npm install`

4.  **Database Migration**:
    *   After deployment (or during build if configured), you need to push the schema to your prod DB.
    *   You can run this locally against your prod DB URL:
        `npx prisma db push`
    *   **Or** add it to your build command: `npx prisma db push && npm run build` (be careful with this in production).

---

> [!CAUTION]
> **CRITICAL SECURITY WARNING**
>
> The Admin Dashboard at `/admin` is currently **UNPROTECTED**.
> Anyone with the URL can access it, delete campaigns, and modify settings.
>
> **Immediate Action Required**:
> 1.  Implement middleware protection for `/admin`.
> 2.  OR use Vercel Deployment Protection (password protect the whole site).
> 3.  OR do not publish the `/admin` routes until authentication is implemented.

---

### Verification
-   After deploy, visit `/admin` to verify the dashboard loads.
-   Visit `/` to see the public page.

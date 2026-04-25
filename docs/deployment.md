# Deployment Checklist

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `GITHUB_OWNER_USERNAME=lulalalual`

## Supabase Setup

1. Create a Supabase project.
2. In the SQL Editor, run:
   - `supabase/migrations/20260425_initial_schema.sql`
   - `supabase/seed.sql`
3. In `Authentication -> Providers`, enable `GitHub`.
4. Set the callback URL to:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://<your-vercel-domain>/auth/callback`

## Vercel Setup

1. Import this repository into Vercel.
2. Add all required environment variables in the Vercel project settings.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. Trigger the first deployment.
5. After the first deployment, update Supabase GitHub provider callback URL with the exact Vercel domain if it changed.

## Local Preflight

Before deploying, run:

```bash
npm run lint
npm run build
```

## Post-Deploy Verification

After Vercel gives you a URL, run:

```bash
npm run verify:deployment -- https://<your-vercel-domain>
```

## Production Verification

- Homepage renders the iPhone-style 3D stage.
- `/projects` and `/notes` load published content.
- `/login` starts GitHub OAuth.
- Only GitHub user `lulalalual` can access `/studio`.
- Studio API routes reject unauthenticated requests.
- `/api/health` returns `{ ok: true }`.

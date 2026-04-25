## Personal Site

Apple-inspired personal site built with Next.js, Supabase, and Vercel.

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Fill in the Supabase and GitHub owner values.
3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

Database files live in:

- `supabase/migrations/20260425_initial_schema.sql`
- `supabase/seed.sql`

Apply them in the Supabase SQL Editor or through the CLI once a project exists.

## Current Scope

- Public homepage, project pages, and notes
- GitHub owner-only studio access
- Markdown-first note storage
- iPhone-styled 3D homepage planned in later tasks

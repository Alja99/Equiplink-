# EquipLink Website

React and Vite frontend for EquipLink's services in Liberia.

## Development

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/equipment-mobility` | Equipment & Mobility |
| `/equipment-mobility/:id` | Equipment details |
| `/business-consultancy` | Business Consultancy |
| `/procurement-supply` | Procurement & Supply |
| `/partner-with-us` | Partner With Us |
| `/contact` | Contact |
| `/admin` | Admin request desk |

Previous `/equipment`, `/consultancy` and `/procurement` service URLs remain available as aliases.

## Request data

The frontend prototype stores enquiries in browser local storage so the admin request desk can review and update them in the same browser. A shared production database/API is needed for multi-user request synchronization.

## Supabase setup

Install dependencies with `npm install`, then copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project's URL and public anon/publishable key. These are public browser credentials; never use a service-role key in a `VITE_*` variable or client-side code.

The browser client is centralized in `src/lib/supabase.js`. It exports `supabase` as `null` until both public environment variables are present.

Link the Supabase CLI to the project and apply migrations with `supabase link --project-ref <project-ref>` followed by `supabase db push`. The migrations create the equipment booking tables, staff-only RLS policies, and a private `supporting-documents` bucket with a 25 MB per-file limit. Public uploads must be placed under an existing request UUID folder; public reads are not allowed.

After creating a staff user with Supabase Auth, provision its role in the SQL editor or trusted admin tooling by inserting that user's `auth.users.id` into `public.staff_profiles`. Staff records cannot be created through the browser client.

## Public assets

Place optimized images in the matching folders under `public/images/`. Public files are served from the site root, for example `/images/equipment/excavator.jpg`.

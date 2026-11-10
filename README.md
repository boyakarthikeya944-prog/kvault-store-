# KVAULT store (Next.js + Supabase), all free tiers

## 1. Supabase (database, login, image storage)
1. Sign up at supabase.com, create a project (free plan).
2. SQL Editor > paste all of `supabase/schema.sql` > Run.
3. Authentication > Users > Add user (your email + password, tick auto-confirm).
4. SQL Editor, run: `insert into admins select id from auth.users where email='YOU@EXAMPLE.COM';`
5. Project Settings > API: copy the Project URL and the `anon public` key. Never use the service_role key here.

## 2. Run locally (optional)
Copy `.env.example` to `.env.local`, fill it in, then `npm install` and `npm run dev`.

## 3. Deploy free
Push this folder to a GitHub repo. On vercel.com (free Hobby plan) click Add New > Project, import the repo, add the 4 env variables from `.env.example`, Deploy. You get a free `yourname.vercel.app` URL.

## 4. Daily use
Open `/admin`, log in, Add product: upload photos (first = main, auto-compressed to 1600px), enter variants one per line as `size,colour,stock`, tick New drop if needed, Publish. Orders tab: update status. Products tab: tap a stock number to change it, hide, delete.

## Free-tier limits
Supabase free: 500 MB database, 1 GB file storage, and projects pause after 7 days with no activity (resume from the dashboard). Vercel Hobby is for non-commercial use per its terms; check them, as a business store may need a paid plan or a different host like Netlify or Cloudflare Pages.

## Known gaps
Cash on Delivery only (no online payments). Stock reduces when an order is placed and is not returned automatically if you cancel (edit stock by hand). No product edit form yet (use hide/delete/stock, or re-add). No separate Collections or Inventory pages.

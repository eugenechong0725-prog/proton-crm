# Proton Sales Follow-up & Insurance Renewal

A lightweight sales tool for Proton consultants. It is not a generic CRM.

Use it to:

1. Follow up potential Proton buyers
2. Remind yourself when a sold customer's insurance is approaching renewal

## App pages

- `/dashboard` — today's follow-ups and insurance alerts
- `/customers` — search, filters, archive
- `/customers/new` — add a lead or sold customer
- `/customers/[id]` — profile, follow-up history, insurance history
- `/follow-ups` — today / overdue / upcoming
- `/insurance` — sold customers only, by official expiry date

## Codex: connect Supabase later

The UI and business logic are done. To connect the live database:

1. Use the existing project or create one.
2. Run every file in `supabase/migrations/` in the SQL editor, in filename order.
3. Put these in `.env.local` and Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. In Authentication, keep Email login on. For this dealership tool, turn off **Confirm email**.
5. Run `npm run dev` and sign in.

Each salesperson only sees their own customers. RLS is in the migration.

```bash
npm install
npm test
npm run dev
```

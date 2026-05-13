## Status of Part 1, 2, 3 (already partially done)

The previous migrations already created:
- All 5 tables (`profiles`, `links`, `social_icons`, `payment_buttons`, `page_views`) with the exact columns and RLS policies you requested.
- `set_updated_at()` function (but the trigger on `profiles` is NOT yet attached — needs to be added).
- 3 public storage buckets (`avatars`, `qr-codes`, `backgrounds`) with public read + auth upload — but the per-user folder restriction (`auth.uid()::text = (storage.foldername(name))[1]`) and the MIME/size limits (5/5/10 MB, jpeg/png/webp) are NOT yet enforced.
- `check_handle_available(handle text)` exists but does NOT block the reserved word list.

## Plan

### 1. Migration — finish backend hardening

- Attach `BEFORE UPDATE` trigger on `profiles` calling `set_updated_at()`.
- Recreate `check_handle_available(handle text)` so it returns false for the reserved words: `admin, api, app, help, login, logout, register, settings, support, terms, privacy, pinoy, bayan, root, mabuhay, www` (case-insensitive), in addition to existing-handle check.
- Update the 3 storage buckets to set `file_size_limit` (5/5/10 MB) and `allowed_mime_types` (`image/jpeg`, `image/png`, `image/webp`).
- Replace storage policies on `storage.objects` for these 3 buckets so authenticated users can only INSERT/UPDATE/DELETE objects whose path starts with their own `auth.uid()` folder. Public SELECT stays.

### 2. New file — `src/routes/$handle.tsx`

Public read-only profile page served at `/{handle}` (e.g. `link.merqato.digital/mariasantos`).

- `createFileRoute("/$handle")` with a `loader` that:
  - Lower-cases the param.
  - Queries `profiles` by `handle` (single row).
  - If found, fetches `links` (enabled, ordered by sort_order), `social_icons` (active), `payment_buttons` (enabled) in parallel.
  - Returns `{ profile, links, socials, payments }` or `{ notFound: true }`.
- `head()` builds title `"{full_name} — link.merqato.digital/{handle}"`, description from bio, og:title/og:description/og:image (avatar_url) — derived from loader data.
- Component:
  - Not-found state: clean centered message + CTA button linking to `/` ("Claim link.merqato.digital/{handle}").
  - Found state: renders the public profile using the same template tokens from `src/components/data.ts` (`TEMPLATES[selected_template]` → `bgClass`, `btnStyle`, `btnBgColor`, `btnBorder`, `avatarRing`) and the same Bricolage / DM Sans typography. Avatar, name, handle, bio, location, social icon row, link buttons, payment buttons. No edit controls.
  - Records a page view on mount: `insert into page_views (profile_id, referrer)`.
  - Each link button: insert `(profile_id, link_id, referrer)` then `window.open(url, '_blank')`.
- The route file lives in `src/routes/`; the TanStack Vite plugin regenerates `routeTree.gen.ts` automatically — no manual edit needed.

### 3. Edit — `src/components/pinoy/Onboarding.tsx`

Inside the existing debounce effect (lines ~57-74), replace the `setTimeout` mock + `takenList` array with a real call:

```ts
const { data, error } = await supabase.rpc('check_handle_available', { handle: debouncedHandle });
setHandleStatus(error || !data ? 'taken' : 'available');
```

Keep the 600 ms debounce, the `'checking'` spinner state, all surrounding JSX, and the rest of the component unchanged.

### 4. Out of scope (not touched)

- `src/routes/index.tsx`, `Builder.tsx`, `data.ts`, styles, all UI components.
- Auth flow / login pages (none requested in this turn — the public `/$handle` route is anonymous-readable via RLS).

### Confirmation needed

The custom domain `link.merqato.digital` is already connected to the project. The `/$handle` route works automatically on any domain serving the app — no extra wiring required.

Approve to proceed and I'll run the migration and create the files.
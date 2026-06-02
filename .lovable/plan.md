## Problem

The screenshot is the **Builder preview**, which is populated entirely from in-memory mock data (`INITIAL_LINKS`, `MS` initials, "Maria Santos", Palawan, the four social icons, the two yellow link cards). When the user visits their real short URL `link.merqato.digital/{handle}`, the public route (`src/routes/$handle.tsx`) queries Supabase and finds only the row written by `publishProfile`: `id`, `handle`, `full_name`, `email`, `mobile`, `selected_template`. No links, no socials, no payments, no bio, no avatar — so the page renders just the name. That matches exactly what the user is reporting.

`Builder.tsx` never calls Supabase. Everything the user edits (bio, location, avatar, links, socials, payments, theme, layout, fonts) lives only in React state and disappears the moment the page reloads.

## Goal

Make the Builder a real editor: every change is saved to Supabase under the authenticated (anonymous) user's `profile_id`, so the public page reflects what they built.

## Plan

### 1. New helper `src/lib/profileApi.ts`
Thin wrappers around `supabase`, all scoped to the current `auth.uid()`:
- `updateProfile(patch)` — updates `profiles` (bio, location, avatar_url, selected_template, accent_color, full_name).
- `uploadAvatar(file)` → uploads to the existing `avatars` bucket under `{uid}/avatar.{ext}`, returns public URL, then calls `updateProfile`.
- `saveLinks(links[])` — replace-all strategy: delete existing rows for `profile_id`, insert the current array with `sort_order`.
- `saveSocials(socials[])` — same replace-all pattern on `social_icons`.
- `savePayments(payments[])` — same on `payment_buttons`. Includes QR upload to the `qr-codes` bucket when a file is provided.
- `loadProfileBundle(userId)` — fetches profile + links + socials + payments to hydrate the Builder on mount/reload.

All writes are debounced by the caller (see step 3).

### 2. Auth-ready gate
Add a tiny `useAuthReady` hook (`src/hooks/useAuthReady.ts`) that waits for `supabase.auth.getSession()` to resolve, then exposes `{ userId, isReady }`. Builder won't issue any writes until `isReady && userId`. This avoids the known race where the session hasn't hydrated yet and RLS rejects the write.

### 3. Wire Builder to persistence (surgical, no UI changes)
Inside `src/components/pinoy/Builder.tsx`:
- On mount, if `isReady`, call `loadProfileBundle(userId)` and hydrate the existing state setters (bio, location, avatarImage, links, activeSocials/socialUrls, payment fields, accent, template) from what's in the DB. If the DB has no rows yet (fresh signup), keep current defaults.
- Wrap the existing setters' downstream effects with debounced auto-save (300–600ms) using a small `useDebouncedEffect`:
  - profile-level fields → `updateProfile`
  - `links` array → `saveLinks`
  - `activeSocials` + `socialUrls` → `saveSocials`
  - payment fields → `savePayments`
- Avatar upload: when the file input fires, in addition to setting the local data URL preview, call `uploadAvatar(file)` and replace the preview with the returned public URL once it resolves.
- Add a small `Saving… / Saved` indicator next to the existing top bar (single line, no layout change).

No props or component signatures change. No routes change. No design tokens change.

### 4. Public page is already correct
`src/routes/$handle.tsx` already reads `profiles`, `links`, `social_icons`, `payment_buttons` and renders them. Once step 3 writes real rows, the public page will populate automatically — no edits needed there.

### 5. Out of scope (call out, do not do now)
- Template "design" tab fields beyond accent + selected_template (button style override, page font, wallpaper, color overrides, profile layout) — the DB doesn't have columns for these. We can add a `theme jsonb` column to `profiles` in a follow-up if you want full theme persistence. For now, the visible content (avatar, bio, links, socials, payments) will persist; the visual theme tweaks remain session-only.
- Real account upgrade from anonymous → email (so the user doesn't lose their page if they clear storage). Worth doing soon but separate.

## Files touched

- new `src/lib/profileApi.ts`
- new `src/hooks/useAuthReady.ts`
- edit `src/components/pinoy/Builder.tsx` — add load-on-mount, debounced saves, avatar upload, "Saved" indicator. No structural / visual changes.

## Confirm before I build

1. OK to use the **replace-all** strategy for links/socials/payments (simplest, no ID tracking churn)?
2. OK that visual theme tweaks (custom colors, wallpaper, font override, button style, layout) stay session-only for now, and I add a follow-up to introduce a `theme jsonb` column?

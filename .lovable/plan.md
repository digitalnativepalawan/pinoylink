## Plan: Generate live short URL after onboarding

### 1. Enable anonymous auth
Call `supabase--configure_auth` to turn on anonymous sign-ins so a real `auth.uid()` exists when we insert the profile (required by RLS).

### 2. Migration: allow the QR code library
Add `qrcode` (pure JS, ~20KB) via `bun add qrcode @types/qrcode`. No DB migration needed — schema already supports everything.

### 3. New file: `src/lib/publishProfile.ts`
Helper used by the success step:
```ts
export async function publishProfile(input: {
  fullName: string; email: string; mobile: string;
  handle: string; selectedTemplate: string;
}): Promise<{ url: string; profileId: string }>
```
Logic:
- If no session, `supabase.auth.signInAnonymously()`.
- `supabase.from('profiles').upsert({ id: user.id, handle, full_name, email, mobile, selected_template })`.
- Return `{ url: \`https://link.merqato.digital/${handle}\`, profileId: user.id }`.

### 4. New component: `src/components/pinoy/PublishedSuccess.tsx`
Full-screen success step shown between onboarding and Builder:
- Confetti-style hero with handle name
- Big rendered short URL `link.merqato.digital/{handle}`
- QR code (generated with `qrcode.toDataURL`)
- Copy URL button (uses `navigator.clipboard`, shows "Copied!" toast)
- Native Share button (uses `navigator.share` with fallback)
- "Open my page" → opens `/{handle}` in new tab
- "Continue to editor" → calls `onContinue()` to go to Builder
- Matches Filipino-first dark aesthetic (Bricolage Grotesque, `#FCD116` accent, same `max-w-[480px]` mobile-first frame)

### 5. Edit `src/routes/index.tsx`
Add `step === 4` = success screen, `step === 5` = Builder.
- Step 3 → 4 transition calls `publishProfile(...)` (with loading state).
- On error: stay on step 3, show inline error.
- Success screen `onContinue` → `setStep(5)`.

### 6. Edit `src/components/pinoy/Onboarding.tsx`
Step 3 "Finish" button: switch from `onFinish()` to an async handler that calls `publishProfile` and only advances on success. Show spinner in button while publishing.

### Out of scope
- Builder persistence (links/socials/payments saving) — separate task.
- Email/password signup, login flow — anonymous-only per your choice.
- Custom domain DNS — already connected.

Approve and I'll execute.
## Goal
Add a proper Sign Up flow so users must register before signing in, and scope each user's dashboard data (profile, history, chat) to their own account so different users see different dashboards on the same device.

## Scope
Frontend + local storage only (no backend yet, per your earlier "UI only for now" choice). If you'd rather move to real accounts with Lovable Cloud (email/password auth, per-user data in a database, works across devices), say the word and I'll swap the plan.

## Changes

### 1. Local "accounts" store (`src/lib/storage.ts`)
- Add a `users` registry in localStorage: `uvu.users` = `{ [email]: { passwordHash, profile, createdAt } }` (hash with a simple SHA-256 via `crypto.subtle` — good enough for a local demo, not real security).
- Track current session as `uvu.session` = `{ email }` instead of the current boolean `uvu.auth`.
- Namespace per-user data by email:
  - `uvu.history:<email>`
  - `uvu.chat.messages:<email>`
  - `uvu.profile:<email>`
- Update `loadHistory / saveHistoryEntry / deleteHistoryEntry / loadChat / saveChat / clearChat / loadProfile / saveProfile` to read/write the current user's namespaced key. If no session, return empty/defaults and no-op writes.
- Add helpers: `registerUser(email, password, fullName)`, `signInUser(email, password)`, `signOutUser()`, `currentEmail()`.
- Keep `isAuthed()` (now = session present).

### 2. Auth UI (`src/routes/auth.tsx`)
- Convert to a tabbed card with **Sign in** and **Sign up** tabs (shadcn `Tabs`).
- **Sign up** fields: Full name, Work email, Password, Confirm password + Terms checkbox. Validate with zod (email format, password ≥ 8 chars, match). On submit → `registerUser`, auto sign in, redirect to `/app`. Error toast if email already exists.
- **Sign in**: unchanged UX, but now calls `signInUser` and errors on unknown email / wrong password ("No account found — switch to Sign up").
- Default tab driven by `?mode=signup|signin` search param so the landing page's **Get Started** deep-links to Sign up and **Sign in** deep-links to Sign in.

### 3. Landing page (`src/routes/index.tsx`)
- Point **Get Started** CTAs to `/auth?mode=signup`.
- Point **Sign in** links to `/auth?mode=signin`.

### 4. Dashboard isolation
- No component changes needed beyond storage namespacing — because `loadProfile`, `loadHistory`, and `loadChat` now key on the signed-in email, each account automatically sees its own dashboard, history, chat, and settings. Sign-out + sign-in as another user swaps the entire view.
- On sign-out, clear `uvu.session` only (keep each user's data so re-login restores it).

### 5. Fix minor SSR hydration warning
While in `auth.tsx`/`app.tsx`, ensure the ThemeToggle icon mismatch reported at runtime is resolved by rendering the toggle only after mount (or a stable placeholder during SSR) — small hygiene fix alongside the auth work.

## Out of scope
- Real backend auth, email verification, password reset (would require enabling Lovable Cloud).
- Cross-device sync — accounts live in this browser's localStorage only.

## Files touched
- `src/lib/storage.ts` — rewrite session + namespaced getters/setters, add register/sign-in helpers.
- `src/routes/auth.tsx` — tabs, sign-up form, zod validation, `?mode` param.
- `src/routes/index.tsx` — CTA links to `/auth?mode=...`.
- `src/components/theme-toggle.tsx` — mounted guard to stop hydration mismatch.

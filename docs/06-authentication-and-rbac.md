# Authentication and RBAC

## Phase 1–4: static admin credentials

Admin UI uses **one** env-configured username and password. No Supabase Auth, no user table, no OAuth.

```text
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

### Flow

1. Login form → Server Action
2. Timing-safe compare of username and password
3. Rate-limited
4. Signed **HTTP-only, Secure, SameSite=Lax** session cookie
5. Middleware rejects unauthenticated `/admin` requests
6. Logout clears cookie

Credentials are never hardcoded, never `NEXT_PUBLIC_*`, never in client JS.

### Authorization vs RLS

Static session is **not** `auth.uid()`. Admin database writes use the server **secret key** (bypasses RLS) **only after** the session is verified. The publishable key never receives unrestricted write policies.

## Phase 5+: Supabase Auth + roles

Replace static login when more than one staff user is needed.

Documented roles (implement later):

- `super_admin`, `editor`, `viewer`
- Later: `architect`, `designer`, `project_manager`, `finance`

Permissions are enforced server-side and via RLS for authenticated users.

## Public users

There are **no** public end-user accounts in V1.

# PRAGMA Test Users

> Erstellt mit `scripts/seed-test-users.mjs`
> Accounts laufen automatisch nach 30 Tagen ab.

## Ausfuehren

```bash
NEXT_PUBLIC_SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-test-users.mjs
```

## Test Accounts

| # | Email | Passwort | Rolle | Zweck |
|---|-------|----------|-------|-------|
| 1 | admin@pragma.app | PragmaAdmin2026! | admin | Admin-Dashboard, User-Management, Verifikations-Queue |
| 2 | tester1@pragma.app | PragmaTest2026! | user | Normaler User-Flow, Onboarding, Matching |
| 3 | tester2@pragma.app | PragmaTest2026! | user | Gegenseitiges Matching mit tester1 testen |
| 4 | tester3@pragma.app | PragmaTest2026! | user | Messaging, Report/Block testen |
| 5 | tester4@pragma.app | PragmaTest2026! | user | Zusaetzlicher Tester fuer externe Beta-Tester |

## Ablauf / Expiration

- Accounts laufen **30 Tage** nach Erstellung ab
- Abgelaufene Accounts werden automatisch bei Login ausgeloggt → Redirect zu `/login?error=test_expired`
- Middleware prueft `profiles.test_expires_at` bei jedem Request
- Zum Verlaengern: Supabase Dashboard → profiles Tabelle → `test_expires_at` anpassen

## Alter Demo-Account (ENTFERNT)

Der alte `test@pragma.app / pragma2026` Account ist nicht mehr hardcoded.
Demo-Modus existiert nur noch wenn `NEXT_PUBLIC_DEMO_MODE=true` UND env-vars
`NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD` gesetzt sind.
In Production: `NEXT_PUBLIC_DEMO_MODE=false` setzen.

## Migration

Vor dem Seed-Script muss Migration `007_test_user_tracking.sql` ausgefuehrt werden:
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS test_expires_at TIMESTAMPTZ;
```

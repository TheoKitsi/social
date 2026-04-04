/**
 * Seed script: Create test users for PRAGMA beta testing.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-test-users.mjs
 *
 * This creates test accounts via Supabase Auth Admin API.
 * Users are pre-verified (email_confirm: true) so they can log in immediately.
 * Test accounts expire after 30 days (test_expires_at in profile metadata).
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Test accounts expire 30 days from creation
const EXPIRY_DAYS = 30;
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);
const TEST_EXPIRES_AT = expiresAt.toISOString();

const TEST_USERS = [
  {
    email: "admin@pragma.app",
    password: "PragmaAdmin2026!",
    role: "admin",
    display_name: "PRAGMA Admin",
  },
  {
    email: "tester1@pragma.app",
    password: "PragmaTest2026!",
    role: "user",
    display_name: "Tester Eins",
  },
  {
    email: "tester2@pragma.app",
    password: "PragmaTest2026!",
    role: "user",
    display_name: "Tester Zwei",
  },
  {
    email: "tester3@pragma.app",
    password: "PragmaTest2026!",
    role: "user",
    display_name: "Tester Drei",
  },
  {
    email: "tester4@pragma.app",
    password: "PragmaTest2026!",
    role: "user",
    display_name: "Tester Vier",
  },
];

async function seed() {
  console.log(`Seeding ${TEST_USERS.length} test users...\n`);

  for (const user of TEST_USERS) {
    // Create auth user (auto-confirmed, with expiration metadata)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          is_test_user: true,
          test_expires_at: TEST_EXPIRES_AT,
        },
      });

    if (authError) {
      if (authError.message?.includes("already been registered")) {
        console.log(`  [skip] ${user.email} — already exists`);
        continue;
      }
      console.error(`  [fail] ${user.email} — ${authError.message}`);
      continue;
    }

    const userId = authData.user.id;

    // Update profile with role + display name + expiration
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: user.display_name,
        role: user.role,
        email_verified: true,
        is_test_user: true,
        test_expires_at: TEST_EXPIRES_AT,
      })
      .eq("user_id", userId);

    if (profileError) {
      console.error(
        `  [warn] ${user.email} — profile update failed: ${profileError.message}`
      );
    }

    console.log(
      `  [ok]   ${user.email} (${user.role}) — ${user.display_name}`
    );
  }

  console.log(`\n--- Test Credentials (expire: ${TEST_EXPIRES_AT.slice(0, 10)}) ---`);
  console.log("Admin:   admin@pragma.app    / PragmaAdmin2026!");
  console.log("Tester:  tester1@pragma.app  / PragmaTest2026!");
  console.log("         tester2@pragma.app  / PragmaTest2026!");
  console.log("         tester3@pragma.app  / PragmaTest2026!");
  console.log("         tester4@pragma.app  / PragmaTest2026!");
  console.log("\nDone.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

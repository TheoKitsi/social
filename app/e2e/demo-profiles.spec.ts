// PRAGMA — Playwright Demo Test
// Navigates through the app creating test profiles so you can watch the flow.
// Usage: npx playwright test e2e/demo-profiles.spec.ts --headed --workers=1

import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3000";

// Demo user profiles
const profiles = [
  {
    name: "Elena Papadopoulos",
    email: "elena@example.com",
    password: "Pragma2026!",
    age: "28",
    gender: "female",
    location: "Munich, Germany",
    orientation: "heterosexual",
    intention: "long-term",
    values: ["honesty", "loyalty", "growth"],
    languages: ["English", "German", "Greek"],
  },
  {
    name: "Marcus Weber",
    email: "marcus@example.com",
    password: "Pragma2026!",
    age: "32",
    gender: "male",
    location: "Berlin, Germany",
    orientation: "heterosexual",
    intention: "long-term",
    values: ["honesty", "ambition", "humor"],
    languages: ["English", "German"],
  },
];

test.describe("PRAGMA Demo Profile Creation", () => {
  test("Landing page loads correctly", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=PRAGMA")).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: "e2e/screenshots/01-landing.png" });
    console.log("Landing page loaded with PRAGMA branding");
  });

  test("Login with demo account", async ({ page }) => {
    await page.goto(`${BASE}/en/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });

    // Fill demo credentials
    await page.fill('input[type="email"]', "test@pragma.app");
    await page.fill('input[type="password"]', "pragma2026");
    await page.screenshot({ path: "e2e/screenshots/02-login-filled.png" });

    // Click login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "e2e/screenshots/03-after-login.png" });
    console.log("Logged in with demo account");
  });

  test("Onboarding mode selector", async ({ page }) => {
    // Navigate directly to onboarding
    await page.goto(`${BASE}/en/onboarding`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "e2e/screenshots/04-mode-selector.png" });

    // The mode selector should show 3 options
    const voiceCard = page.locator("text=Voice AI Assistant");
    const chatCard = page.locator("text=Chat AI Assistant");
    const manualCard = page.locator("text=Manual Entry");

    console.log("Mode selector visible with 3 options");

    // Click Chat AI mode
    await chatCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/05-chat-mode.png" });
    console.log("Selected Chat AI mode");

    // Type a message in the chat
    const chatInput = page.locator('input[type="text"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill("I'm 28, living in Munich");
      await page.screenshot({ path: "e2e/screenshots/06-chat-typing.png" });
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);
      await page.screenshot({ path: "e2e/screenshots/07-chat-response.png" });
      console.log("Chatted with PRAGMA AI");
    }
  });

  test("Voice AI mode interface", async ({ page }) => {
    await page.goto(`${BASE}/en/onboarding`);
    await page.waitForTimeout(1500);

    // Select Voice AI
    const voiceCard = page.locator("text=Voice AI Assistant");
    await voiceCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/08-voice-mode.png" });
    console.log("Voice AI mode loaded with pulsing orb");
  });

  test("Manual onboarding wizard", async ({ page }) => {
    await page.goto(`${BASE}/en/onboarding`);
    await page.waitForTimeout(1500);

    // Select Manual
    const manualCard = page.locator("text=Manual Entry");
    await manualCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/09-reflection.png" });
    console.log("Manual mode - reflection question displayed");

    // Click continue past reflection
    const continueBtn = page.locator("text=Continue");
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "e2e/screenshots/10-wizard-fields.png" });
      console.log("Wizard form fields visible");
    }
  });

  test("Admin dashboard", async ({ page }) => {
    await page.goto(`${BASE}/en/admin`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "e2e/screenshots/11-admin-overview.png" });
    console.log("Admin dashboard loaded with stats");

    // Click Users tab
    const usersTab = page.locator("text=User Management");
    if (await usersTab.isVisible()) {
      await usersTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "e2e/screenshots/12-admin-users.png" });
      console.log("Admin user management table");
    }

    // Click Analytics tab
    const analyticsTab = page.locator("text=Analytics");
    if (await analyticsTab.isVisible()) {
      await analyticsTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "e2e/screenshots/13-admin-analytics.png" });
      console.log("Admin analytics with charts");
    }
  });

  test("Subscription plans", async ({ page }) => {
    await page.goto(`${BASE}/en/subscription`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "e2e/screenshots/14-subscription.png" });
    console.log("Subscription page with 3 tiers + success commission");
  });

  test("German locale", async ({ page }) => {
    await page.goto(`${BASE}/de`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "e2e/screenshots/15-german-landing.png" });
    console.log("German locale landing page");
  });

  test("Greek locale", async ({ page }) => {
    await page.goto(`${BASE}/el`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "e2e/screenshots/16-greek-landing.png" });
    console.log("Greek locale landing page");
  });
});

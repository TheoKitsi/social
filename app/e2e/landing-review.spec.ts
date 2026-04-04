// PRAGMA — Comprehensive Landing Page Review Test
// Tests all 6 improvement points: snap-scroll, animations, EN text, DE Umlauts,
// competitor anonymization, i18n category keys.
// Usage: npx playwright test e2e/landing-review.spec.ts --headed --workers=1

import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

// ─── 1. Snap-Scroll & Section Structure ───────────────────────────
test.describe("1. Snap-Scroll Landing Sections", () => {
  test("Landing page has 6 snap sections + header + footer", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    // Header is fixed
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    await expect(header).toHaveCSS("position", "fixed");

    // All 6 sections exist with snap-start
    const sections = page.locator("section");
    const sectionCount = await sections.count();
    expect(sectionCount).toBe(6);

    // Verify snap-scroll container
    const container = page.locator("div.snap-y").first();
    await expect(container).toBeVisible();

    // Footer exists with snap-end
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/review-01-hero.png", fullPage: false });
  });

  test("Snap-scroll navigates between sections", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    // Get the scroll container
    const container = page.locator("div.snap-y").first();

    // Hero section should be visible initially
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeInViewport();

    // Scroll down to section 2 (The Question)
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "e2e/screenshots/review-02-question.png", fullPage: false });

    // Scroll to section 3 (Industry)
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "e2e/screenshots/review-03-industry.png", fullPage: false });

    // Scroll to section 4 (How It Works)
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "e2e/screenshots/review-04-process.png", fullPage: false });

    // Scroll to section 5 (The Difference)
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "e2e/screenshots/review-05-different.png", fullPage: false });

    // Scroll to section 6 (Final CTA)
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "e2e/screenshots/review-06-cta.png", fullPage: false });

    // Scroll back up to verify bidirectional animations
    await container.evaluate((el) => el.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "e2e/screenshots/review-07-back-to-hero.png", fullPage: false });
  });
});

// ─── 2. ScrollSection Bidirectional Animation ─────────────────────
test.describe("2. ScrollSection Animations", () => {
  test("Sections fade in when scrolled into view", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    const container = page.locator("div.snap-y").first();

    // Scroll to the Question section
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1500);

    // The ScrollSection inside section 2 should now be visible (opacity-100)
    const questionContent = page.locator("section").nth(1).locator("div.transition-all").first();
    await expect(questionContent).toHaveCSS("opacity", "1");
  });

  test("Scroll indicator bounce arrow exists in hero", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    // Should have a bouncing arrow indicator
    const arrow = page.locator(".animate-bounce svg");
    await expect(arrow).toBeVisible();
  });
});

// ─── 3. EN Text Elevation (Rhetorical Quality) ───────────────────
test.describe("3. English Text Quality", () => {
  test("Hero has elevated rhetorical subtitle", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    // Verify elevated hero text
    await expect(page.getByText("Partnership, methodically.")).toBeVisible();
    await expect(page.getByText("What if you approached the most consequential decision")).toBeVisible();
  });

  test("Question section has thought-provoking copy", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    const container = page.locator("div.snap-y").first();
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);

    // Rhetorical question format
    await expect(page.getByText("wouldn't buy a car without a test drive")).toBeVisible();
    // Powerful quote
    await expect(page.getByText("the person we'll wake up next to for the next forty years")).toBeVisible();
    // PRAGMAtic punch line
    await expect(page.getByText("Every lasting relationship is a cancelled subscription")).toBeVisible();
  });

  test("Industry section uses anonymous categories, not platform names", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    const container = page.locator("div.snap-y").first();
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight * 2, behavior: "smooth" }));
    await page.waitForTimeout(1200);

    // Should show category names instead of platform names
    await expect(page.getByText("Swipe-Based", { exact: true })).toBeVisible();
    await expect(page.getByText("Algorithm-Driven", { exact: true })).toBeVisible();
    await expect(page.getByText("Premium Segment", { exact: true })).toBeVisible();

    // Should NOT show any platform names
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Tinder");
    expect(bodyText).not.toContain("Bumble");
    expect(bodyText).not.toContain("Hinge");
    expect(bodyText).not.toContain("OkCupid");
    expect(bodyText).not.toContain("Parship");
    expect(bodyText).not.toContain("ElitePartner");
  });

  test("Differentiator section has elevated titles", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    const container = page.locator("div.snap-y").first();
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight * 4, behavior: "smooth" }));
    await page.waitForTimeout(1200);

    await expect(page.getByText("Six principles. Zero compromises.")).toBeVisible();
    await expect(page.getByText("Real Humans Only")).toBeVisible();
    await expect(page.getByText("Built to Be Deleted")).toBeVisible();
    await expect(page.getByText("Your Data, Your Rules")).toBeVisible();
  });

  test("Final CTA uses PRAGMAtic wordplay", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    const container = page.locator("div.snap-y").first();
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight * 5, behavior: "smooth" }));
    await page.waitForTimeout(1200);

    await expect(page.getByText("Ready to be PRAGMAtic about love?")).toBeVisible();
    await expect(page.getByText("It deserves method.")).toBeVisible();
  });
});

// ─── 4. German Text — Umlauts ─────────────────────────────────────
test.describe("4. German Umlauts", () => {
  test("DE landing page renders proper Umlauts throughout", async ({ page }) => {
    await page.goto(`${BASE}/de`);
    await page.waitForLoadState("networkidle");

    // Hero
    await expect(page.getByText("Partnerschaft, methodisch.")).toBeVisible();
    await expect(page.getByText("wäre, wenn Sie die folgenreichste")).toBeVisible();

    const container = page.locator("div.snap-y").first();

    // Section 2: Die Frage — check Umlauts
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await expect(page.getByText("würden kein Auto kaufen")).toBeVisible();
    await expect(page.getByText("nächsten vierzig Jahre")).toBeVisible();
    await expect(page.getByText("glückliche Beziehung ist ein gekündigtes")).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/review-de-02-question.png", fullPage: false });

    // Section 3: Realität (not "Realitaet")
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await expect(page.getByText("Die Realität")).toBeVisible();
    await expect(page.getByText("Über alle Kategorien hinweg")).toBeVisible();
    await expect(page.getByText("großen Kategorien")).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/review-de-03-industry.png", fullPage: false });

    // Section 5: Differentiators with proper Umlauts
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight * 2, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await expect(page.getByText("Kündigung per Klick")).toBeVisible();
    await expect(page.getByText("löschen auf Anfrage")).toBeVisible();
    await expect(page.getByText("glücklichen Beziehung")).toBeVisible();
    await expect(page.getByText("überflüssig")).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/review-de-05-different.png", fullPage: false });
  });

  test("DE landing has NO broken Umlauts (ae/oe/ue substitutions)", async ({ page }) => {
    await page.goto(`${BASE}/de`);
    await page.waitForLoadState("networkidle");

    const container = page.locator("div.snap-y").first();
    // Scroll through all sections to load all text
    for (let i = 0; i < 5; i++) {
      await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
      await page.waitForTimeout(800);
    }

    // Check the full page text for broken Umlaut patterns
    const bodyText = await page.locator("body").innerText();
    // These patterns indicate missing Umlauts in German context
    expect(bodyText).not.toMatch(/\bfuer\b/i);
    expect(bodyText).not.toMatch(/\bueber\b/i);
    expect(bodyText).not.toMatch(/\bwaehlen\b/i);
    expect(bodyText).not.toMatch(/\bPraezision\b/i);
    expect(bodyText).not.toMatch(/\bGluecksspiel\b/i);
    expect(bodyText).not.toMatch(/\bGeloeschtwerden\b/i);
    expect(bodyText).not.toMatch(/\bKuendigung\b/i);
    expect(bodyText).not.toMatch(/\bRealitaet\b/i);
  });
});

// ─── 5. Competitor Anonymization ──────────────────────────────────
test.describe("5. Competitor Anonymization", () => {
  test("EN about page has no competitor platform names", async ({ page }) => {
    await page.goto(`${BASE}/en/about`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Tinder");
    expect(bodyText).not.toContain("Bumble");
    expect(bodyText).not.toContain("Hinge");
    expect(bodyText).not.toContain("OkCupid");
    expect(bodyText).not.toContain("Parship");
    expect(bodyText).not.toContain("ElitePartner");

    await page.screenshot({ path: "e2e/screenshots/review-08-about-en.png", fullPage: true });
  });

  test("DE about page has no competitor platform names", async ({ page }) => {
    await page.goto(`${BASE}/de/about`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Tinder");
    expect(bodyText).not.toContain("Bumble");
    expect(bodyText).not.toContain("Hinge");
    expect(bodyText).not.toContain("OkCupid");
    expect(bodyText).not.toContain("Parship");
    expect(bodyText).not.toContain("ElitePartner");

    // Also verify proper Umlauts on about page
    await expect(page.getByText("Präzision").first()).toBeVisible();
    await expect(page.getByText("Überzeugung").first()).toBeVisible();
    await expect(page.getByText("Geschäftsmodell").first()).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/review-09-about-de.png", fullPage: true });
  });

  test("DE industry categories show localized names", async ({ page }) => {
    await page.goto(`${BASE}/de`);
    await page.waitForLoadState("networkidle");

    const container = page.locator("div.snap-y").first();
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight * 2, behavior: "smooth" }));
    await page.waitForTimeout(1200);

    await expect(page.getByText("Swipe-basiert", { exact: true })).toBeVisible();
    await expect(page.getByText("Algorithmus-getrieben", { exact: true })).toBeVisible();
    await expect(page.getByText("Etablierte Plattformen", { exact: true })).toBeVisible();
    await expect(page.getByText("Exklusive Clubs", { exact: true })).toBeVisible();
  });
});

// ─── 6. Navigation & Page Accessibility ──────────────────────────
test.describe("6. Multi-Page Navigation", () => {
  test("All main pages load without errors", async ({ page }) => {
    const pages = [
      { path: "/en", name: "Landing EN" },
      { path: "/de", name: "Landing DE" },
      { path: "/en/about", name: "About EN" },
      { path: "/de/about", name: "About DE" },
      { path: "/en/login", name: "Login EN" },
      { path: "/de/login", name: "Login DE" },
      { path: "/en/register", name: "Register EN" },
      { path: "/en/plans", name: "Plans EN" },
      { path: "/en/legal/impressum", name: "Impressum" },
      { path: "/en/legal/datenschutz", name: "Datenschutz" },
      { path: "/en/legal/agb", name: "AGB" },
    ];

    for (const p of pages) {
      const response = await page.goto(`${BASE}${p.path}`);
      expect(response?.status(), `${p.name} should return 200`).toBeLessThan(400);
      await expect(page.getByText("PRAGMA", { exact: true }).first()).toBeVisible({ timeout: 8000 });
    }
  });

  test("Header navigation links work", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    // Click "Our story" link in header
    const aboutLink = page.locator("header a", { hasText: /Why PRAGMA|Our story/i }).first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/\/about/);
    }

    // Go back and click login
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");
    const loginBtn = page.locator("header").getByText("Sign In");
    await loginBtn.click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/);
  });

  test("Footer links are present and correct", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    const container = page.locator("div.snap-y").first();
    // Scroll to bottom to see footer
    await container.evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }));
    await page.waitForTimeout(1500);

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText("PRAGMA").first()).toBeVisible();

    // Check footer links exist
    await expect(footer.locator("a", { hasText: /Imprint|Impressum/i })).toBeVisible();
    await expect(footer.locator("a", { hasText: /Privacy|Datenschutz/i })).toBeVisible();
    await expect(footer.locator("a", { hasText: /Terms|AGB/i })).toBeVisible();
  });

  test("Mobile viewport snap-scroll works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto(`${BASE}/en`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Partnership, methodically.")).toBeVisible();

    const container = page.locator("div.snap-y").first();
    await container.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: "smooth" }));
    await page.waitForTimeout(1200);

    await page.screenshot({ path: "e2e/screenshots/review-10-mobile-question.png", fullPage: false });

    // Verify sections render on mobile
    const sections = page.locator("section");
    expect(await sections.count()).toBe(6);
  });
});

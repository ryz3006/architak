import { expect, test } from "@playwright/test";

const HERO_HEADLINES = [
  { selector: "h1.hero-chapter-headline", parts: ["Experiences", "that stay"] },
  {
    selector: '.hero-scene[data-chapter="space"] .hero-chapter-headline',
    parts: ["Spaces that think", "like you"],
  },
  {
    selector: '.hero-scene[data-chapter="feel"] .hero-chapter-headline',
    parts: ["A feel that defines", "luxury"],
  },
] as const;

test.describe("hero composition", () => {
  test("exposes all three headlines and chapter-one CTA", async ({ page }) => {
    await page.goto("/");

    for (const headline of HERO_HEADLINES) {
      const node = page.locator(headline.selector);
      for (const part of headline.parts) {
        await expect(node).toContainText(new RegExp(part, "i"));
      }
    }

    await expect(page.getByRole("link", { name: /view work/i })).toBeInViewport();
  });

  test("hero images use concrete alt text", async ({ page }) => {
    await page.goto("/");

    const alts = await page
      .locator(".hero-image-layer img")
      .evaluateAll((images) => images.map((img) => img.getAttribute("alt") ?? ""));

    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) {
      expect(alt.length).toBeGreaterThan(12);
      expect(alt.toLowerCase()).not.toMatch(/image\s*\d|placeholder|hero image/i);
    }
  });

  test("journey images are unique within the hero", async ({ page }) => {
    await page.goto("/");

    const srcs = await page
      .locator(".hero-image-layer img")
      .evaluateAll((images) => images.map((img) => img.getAttribute("src") ?? ""));

    const unique = new Set(srcs.filter(Boolean));
    expect(unique.size).toBeGreaterThanOrEqual(3);
    expect(unique.size).toBe(srcs.filter(Boolean).length);
  });

  test("reduced motion keeps all chapters accessible without pinning", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    for (const headline of HERO_HEADLINES) {
      const node = page.locator(headline.selector);
      for (const part of headline.parts) {
        await expect(node).toContainText(new RegExp(part, "i"));
      }
      await expect(node).toBeVisible();
    }

    // Stacked, not pinned: the stage scrolls with the page instead of sticking.
    const stagePosition = await page
      .locator(".hero-stage")
      .evaluate((node) => getComputedStyle(node).position);
    expect(stagePosition).toBe("relative");

    await expect(page.locator(".hero-progress")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /view work/i })).toBeVisible();
  });
});

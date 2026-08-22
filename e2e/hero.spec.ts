import { expect, test } from "@playwright/test";

const HERO_HEADLINES = [
  "Experiences that stay",
  "Spaces that think",
  "A feel that defines",
] as const;

test.describe("hero composition", () => {
  test("exposes all three headlines and chapter-one CTA", async ({ page }) => {
    await page.goto("/");

    for (const headline of HERO_HEADLINES) {
      await expect(page.getByRole("heading", { name: new RegExp(headline, "i") })).toBeAttached();
    }

    await expect(page.getByRole("link", { name: /view work/i })).toBeInViewport();
  });

  test("hero images use concrete alt text", async ({ page }) => {
    await page.goto("/");

    const alts = await page.locator(".hero-image-panel img, .hero-image-layer img").evaluateAll(
      (images) => images.map((img) => img.getAttribute("alt") ?? ""),
    );

    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) {
      expect(alt.length).toBeGreaterThan(12);
      expect(alt.toLowerCase()).not.toMatch(/image\s*\d|placeholder|hero image/i);
    }
  });

  test("journey images are unique within the hero", async ({ page }) => {
    await page.goto("/");

    const srcs = await page.locator(".hero-image-layer img, .hero-chapter-block img").evaluateAll(
      (images) => images.map((img) => img.getAttribute("src") ?? ""),
    );

    const unique = new Set(srcs.filter(Boolean));
    expect(unique.size).toBeGreaterThanOrEqual(3);
    expect(unique.size).toBe(srcs.filter(Boolean).length);
  });

  test("reduced motion keeps all chapters accessible without pinning", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    for (const headline of HERO_HEADLINES) {
      await expect(page.getByRole("heading", { name: new RegExp(headline, "i") })).toBeVisible();
    }

    await expect(page.locator(".hero-track.is-static")).toBeVisible();
    await expect(page.getByRole("link", { name: /view work/i })).toBeVisible();
  });
});
